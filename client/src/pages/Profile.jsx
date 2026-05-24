import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
} from "../redux/user/userSlice";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api.js";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector(
    (state) => state.user || {}
  );
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [view, setView] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = !!(
    currentUser &&
    (currentUser.role === "admin" || currentUser.isAdmin)
  );

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({ ...currentUser, ...prev }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file]);

  const handleFileUpload = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setFileUploadError("File too large (max 2MB)");
      return;
    }

    setFileUploadError(false);
    const storage = getStorage(app);
    const fileName = `${new Date().getTime()}-${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (err) => {
        console.error("avatar upload error:", err);
        setFileUploadError(true);
      },
      () =>
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData((prev) => ({ ...prev, avatar: downloadURL }))
        )
    );
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser._id) return;

    try {
      dispatch(updateUserStart());
      const res = await fetch(
        `${API_BASE_URL}/api/user/update/${currentUser._id}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      const updatedUser = data.user || data || {};
      dispatch(updateUserSuccess(updatedUser));

      try {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      } catch (e) {}

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2500);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleDeleteuser = async () => {
    if (!currentUser || !currentUser._id) return;
    try {
      if (
        !window.confirm(
          "Are you sure you want to delete your account? This cannot be undone."
        )
      )
        return;
      dispatch(deleteUserStart());
      const res = await fetch(
        `${API_BASE_URL}/api/user/delete/${currentUser._id}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      localStorage.removeItem("currentUser");
      navigate("/");
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      await fetch(`${API_BASE_URL}/api/auth/signout`, {
        method: "GET",
        credentials: "include",
      });
      localStorage.removeItem("currentUser");
      dispatch(deleteUserSuccess({}));
      navigate("/sign-in");
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const normalizeListingResponse = (resp) => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.data && Array.isArray(resp.data)) return resp.data;
    if (resp.listings && Array.isArray(resp.listings)) return resp.listings;
    return [];
  };

  const handleShowListing = async () => {
    if (!currentUser || !currentUser._id) return;
    try {
      setShowListingsError(false);
      const res = await fetch(
        `${API_BASE_URL}/api/user/listings/${currentUser._id}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        setUserListings([]);
        setView("listings");
        return;
      }
      const normalized = normalizeListingResponse(data);
      setUserListings(normalized);
      setView("listings");
    } catch (err) {
      console.error("Error fetching user listings:", err);
      setShowListingsError(true);
      setUserListings([]);
      setView("listings");
    }
  };

  const handleShowPayments = async () => {
    if (!currentUser || !currentUser._id) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/payment/user/${currentUser._id}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      const payments =
        data?.data || data?.payments || (Array.isArray(data) ? data : []);
      setUserPayments(payments);
      setView("payments");
    } catch (err) {
      console.error("Error fetching user payments:", err);
      setUserPayments([]);
      setView("payments");
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      if (!window.confirm("Delete this listing?")) return;
      const res = await fetch(
        `${API_BASE_URL}/api/listing/delete/${listingId}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json();
      if (data.success === false) {
        alert(data.message || "Could not delete listing");
        return;
      }
      setUserListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch (err) {
      console.error(err);
      alert("Error deleting listing");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-10 p-6 max-w-6xl mx-auto mt-10">
      {/* LEFT SIDE - Profile */}
      <div className="flex-1 max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-sky-700 mb-6">
          My Profile
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            ref={fileRef}
            hidden
            accept="image/*"
          />

          <div className="flex flex-col items-center">
            <img
              onClick={() => fileRef.current?.click()}
              src={
                formData.avatar || currentUser?.avatar || "/default-avatar.png"
              }
              alt="profile"
              className="rounded-full h-28 w-28 object-cover cursor-pointer border-4 border-sky-300 shadow-md"
            />

            <p className="text-sm mt-2">
              {fileUploadError ? (
                <span className="text-red-600">{fileUploadError}</span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <span className="text-sky-600">{`Uploading ${filePerc}%`}</span>
              ) : filePerc === 100 ? (
                <span className="text-green-600">
                  Image uploaded successfully!
                </span>
              ) : (
                ""
              )}
            </p>
          </div>

          <input
            type="text"
            placeholder="Username"
            value={formData.username || currentUser?.username || ""}
            id="username"
            className="border border-sky-200 p-3 rounded-lg"
            onChange={handleChange}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email || currentUser?.email || ""}
            id="email"
            className="border border-sky-200 p-3 rounded-lg"
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Password"
            id="password"
            className="border border-sky-200 p-3 rounded-lg"
            onChange={handleChange}
          />

          <button
            disabled={loading}
            className="bg-sky-600 text-white rounded-lg p-3 font-semibold uppercase disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update"}
          </button>

          {!isAdmin && (
            <Link
              className="bg-emerald-600 text-white p-3 rounded-lg uppercase text-center"
              to={"/create-listing"}
            >
              Create Listing
            </Link>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="bg-indigo-600 text-white p-3 rounded-lg uppercase text-center mt-2"
            >
              Go to Dashboard
            </button>
          )}
        </form>

        <div className="flex justify-between mt-5 text-sm">
          <span
            onClick={handleDeleteuser}
            className="text-red-600 font-medium cursor-pointer hover:underline"
          >
            Delete Account
          </span>
          <span
            onClick={handleSignOut}
            className="text-red-600 font-medium cursor-pointer hover:underline"
          >
            Sign Out
          </span>
        </div>

        {error && <p className="text-red-600 mt-5 text-center">{error}</p>}
        {updateSuccess && (
          <p className="text-green-600 mt-5 text-center">
            Profile updated successfully!
          </p>
        )}

        {!isAdmin && (
          <div className="mt-6 flex justify-start gap-3">
            <button
              onClick={handleShowListing}
              className="bg-sky-100 text-sky-700 px-4 py-2 rounded-lg"
            >
              Show My Listings
            </button>
            <button
              onClick={handleShowPayments}
              className="bg-sky-100 text-sky-700 px-4 py-2 rounded-lg"
            >
              Show My Payments
            </button>
          </div>
        )}

        {showListingsError && (
          <p className="text-red-600 mt-2 text-center">
            Error showing listings
          </p>
        )}
      </div>

      {/* RIGHT SIDE - Display */}
      {view === "listings" && (
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 overflow-y-auto max-h-[110vh]">
          <h2 className="text-center text-2xl font-semibold text-sky-700 mb-5">
            Your Listings
          </h2>
          {userListings.length === 0 ? (
            <p className="text-center text-gray-600">No listings yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {userListings.map((listing) => (
                <div
                  key={listing._id}
                  className="border rounded-xl p-4 flex flex-col gap-3 bg-gray-50 shadow-sm hover:shadow-md"
                >
                  <Link to={`/listing/${listing._id}`}>
                    <img
                      src={listing.imageUrls?.[0] || "/placeholder.png"}
                      alt="listing cover"
                      className="h-40 w-full object-cover rounded-lg"
                    />
                  </Link>

                  <div className="flex flex-col gap-1">
                    <Link
                      to={`/listing/${listing._id}`}
                      className="text-lg font-semibold text-gray-800 hover:text-sky-700 truncate"
                    >
                      {listing.name}
                    </Link>

                    <div className="flex justify-between mt-2">
                      <button
                        onClick={() => handleListingDelete(listing._id)}
                        className="text-red-600 font-medium hover:underline"
                      >
                        Delete
                      </button>
                      <Link to={`/update-listing/${listing._id}`}>
                        <button className="text-emerald-600 font-medium hover:underline">
                          Edit
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "payments" && (
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-h-[110vh]">
          <h2 className="text-center text-2xl font-semibold text-sky-700 mb-5">
            Payment History
          </h2>
          {userPayments.length === 0 ? (
            <p className="text-center text-gray-600">No payments yet.</p>
          ) : (
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Payment ID</th>
                  <th className="p-2 border">Listing ID</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {userPayments.map((p) => (
                  <tr key={p._id || p.paymentId}>
                    <td className="p-2 border">{p.paymentId}</td>
                    <td className="p-2 border">{p.listingId}</td>
                    <td className="p-2 border">₹{p.amount}</td>
                    <td className="p-2 border">{p.type}</td>
                    <td className="p-2 border">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
