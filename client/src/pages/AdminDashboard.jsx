import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  FaAngleLeft,
  FaAngleRight,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import {
  signOutUserStart,
  deleteUserSuccess,
  deleteUserFailure,
} from "../redux/user/userSlice";

import API_BASE_URL from "../api.js";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // UI helpers
  const [query, setQuery] = useState("");

  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, lRes, pRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user/admin/all`),
        fetch(`${API_BASE_URL}/api/listing/admin/all`),
        fetch(`${API_BASE_URL}/api/payment/all`),
      ]);
      const [uJson, lJson, pJson] = await Promise.all([
        uRes.json(),
        lRes.json(),
        pRes.json(),
      ]);
      setUsers(uJson.success ? uJson.data : []);
      setListings(lJson.success ? lJson.data : []);
      setPayments(pJson.success ? pJson.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      dispatch(signOutUserStart());

      await fetch(`${API_BASE_URL}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");

      dispatch(deleteUserSuccess({}));

      navigate("/sign-in");
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete user?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/admin/delete/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) return alert(json.message || "Delete failed");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const deleteListing = async (id) => {
    if (!confirm("Delete listing?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/listing/delete/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) return alert(json.message || "Delete failed");
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const clearSearch = () => setQuery("");

  // client-side filtering for quick search UX (keeps server calls untouched)
  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
  );
  const filteredListings = listings.filter(
    (l) =>
      l.name?.toLowerCase().includes(query.toLowerCase()) ||
      l.address?.toLowerCase().includes(query.toLowerCase())
  );
  const filteredPayments = payments.filter(
    (p) =>
      (p.paymentId || p._id || "")
        .toString()
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      (p.userId || "").toString().toLowerCase().includes(query.toLowerCase()) ||
      (p.listingId || "").toString().toLowerCase().includes(query.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
          <svg
            className="animate-spin h-6 w-6 text-sky-500"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 24 12 12 0 01-12-12z"
            />
          </svg>
          <div className="text-gray-700">Loading admin dashboard...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-lg shadow text-red-600">
          {error}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="bg-sky-100 shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-3 flex items-center justify-between">
          {/* LEFT - LOGO */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1">
              <h1 className="font-bold text-lg sm:text-2xl flex flex-wrap">
                <span className="text-sky-500">Home</span>
                <span className="text-sky-700">Heaven</span>
              </h1>
            </Link>
            <span className="text-xs text-gray-400">• Admin</span>
          </div>

          {/* RIGHT - PROFILE */}
          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 rounded-sm">
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {currentUser?.username || "Admin"}
              </span>

              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover border"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <FaUserCircle className="text-gray-500" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`bg-white shadow-md transition-all duration-300 flex flex-col ${sidebarOpen ? "w-72" : "w-16"
            } h-screen overflow-y-auto`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3
              className={`text-xl font-bold text-sky-600 ${sidebarOpen ? "" : "hidden"
                }`}
            >
              Admin
            </h3>
            <button
              className="p-1 rounded hover:bg-gray-200 transition"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
            >
              {sidebarOpen ? <FaAngleLeft /> : <FaAngleRight />}
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-2">
            <button
              onClick={() => setActiveView(null)}
              className="w-full text-left px-3 py-2 rounded flex items-center gap-3 hover:bg-sky-50 transition"
              title="Dashboard"
            >
              <span className="text-lg">📊</span>
              {sidebarOpen && <span className="flex-1">Dashboard</span>}
              {sidebarOpen && (
                <span className="text-xs text-gray-400">
                  {users.length + listings.length + payments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView("users")}
              className="w-full text-left px-3 py-2 rounded flex items-center gap-3 hover:bg-sky-50 transition"
              title="Users"
            >
              <span className="text-lg">👥</span>
              {sidebarOpen && <span className="flex-1">Users</span>}
              {sidebarOpen && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {users.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView("listings")}
              className="w-full text-left px-3 py-2 rounded flex items-center gap-3 hover:bg-sky-50 transition"
              title="Listings"
            >
              <span className="text-lg">🏠</span>
              {sidebarOpen && <span className="flex-1">Listings</span>}
              {sidebarOpen && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {listings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView("payments")}
              className="w-full text-left px-3 py-2 rounded flex items-center gap-3 hover:bg-sky-50 transition"
              title="Payments"
            >
              <span className="text-lg">💳</span>
              {sidebarOpen && <span className="flex-1">Payments</span>}
              {sidebarOpen && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {payments.length}
                </span>
              )}
            </button>
          </nav>

          <div className="p-3 border-t">
            <button
              onClick={logout}
              className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 transition-all duration-300">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700">
                Welcome,{" "}
                <span className="text-sky-600">
                  {currentUser?.username || "Admin"}
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAll}
                className="px-3 py-1 rounded bg-white border text-sm hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div
              className="bg-white p-5 rounded-lg shadow flex flex-col justify-between cursor-pointer hover:shadow-md"
              onClick={() => setActiveView("users")}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  👥 Total Users
                </div>
                <div className="text-xs text-gray-400">Updated</div>
              </div>
              <div className="text-3xl font-bold text-sky-600">
                {users.length}
              </div>
              <div className="text-sm text-gray-400 mt-3">Click to view →</div>
            </div>

            <div
              className="bg-white p-5 rounded-lg shadow flex flex-col justify-between cursor-pointer hover:shadow-md"
              onClick={() => setActiveView("listings")}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  🏠 Total Listings
                </div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
              <div className="text-3xl font-bold text-emerald-600">
                {listings.length}
              </div>
              <div className="text-sm text-gray-400 mt-3">Click to view →</div>
            </div>

            <div
              className="bg-white p-5 rounded-lg shadow flex flex-col justify-between cursor-pointer hover:shadow-md"
              onClick={() => setActiveView("payments")}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  💳 Total Payments
                </div>
                <div className="text-xs text-gray-400">Recent</div>
              </div>
              <div className="text-3xl font-bold text-amber-500">
                {payments.length}
              </div>
              <div className="text-sm text-gray-400 mt-3">Click to view →</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow flex flex-col justify-between">
              <div className="text-sm text-gray-500">Quick actions</div>
              <div className="flex flex-col gap-3 mt-3">
                <Link to="/create-listing" className="text-sm text-emerald-600">
                  + Add Listing
                </Link>
              </div>
            </div>
          </div>

          {/* Detailed list */}
          {activeView ? (
            <div className="space-y-4">
              {activeView === "users" && (
                <>
                  {filteredUsers.length === 0 ? (
                    <div className="p-6 bg-white rounded shadow text-gray-500">
                      No users found.
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <div
                        key={u._id}
                        className="flex justify-between items-center p-4 bg-white rounded shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt="avatar"
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-xl">👤</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{u.username}</div>
                            <div className="text-xs text-gray-500">
                              {u.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              Role: {u.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 items-center">
                          <Link
                            to={`/profile/${u._id}`}
                            className="text-sky-600 text-sm"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="text-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeView === "listings" && (
                <>
                  {filteredListings.length === 0 ? (
                    <div className="p-6 bg-white rounded shadow text-gray-500">
                      No listings found.
                    </div>
                  ) : (
                    filteredListings.map((l) => (
                      <div
                        key={l._id}
                        className="flex justify-between items-center p-4 bg-white rounded shadow"
                      >
                        <div>
                          <Link
                            to={`/listing/${l._id}`}
                            className="text-sky-600 font-medium text-lg"
                          >
                            {l.name}
                          </Link>
                          <div className="text-xs text-gray-500">
                            {l.address}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Price: {l.price ? `₹${l.price}` : "N/A"}
                          </div>
                        </div>
                        <div className="flex gap-3 items-center">
                          <Link
                            to={`/update-listing/${l._id}`}
                            className="text-emerald-600 text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteListing(l._id)}
                            className="text-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeView === "payments" && (
                <>
                  {filteredPayments.length === 0 ? (
                    <div className="p-6 bg-white rounded shadow text-gray-500">
                      No payments found.
                    </div>
                  ) : (
                    filteredPayments.map((p) => (
                      <div key={p._id} className="p-4 bg-white rounded shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              Payment: {p.paymentId || p._id}
                            </div>
                            <div className="text-xs text-gray-500">
                              User: {p.userId} • Listing: {p.listingId}
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              Amount: ₹{p.amount} • Type: {p.type}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(p.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded shadow">
                <h3 className="font-medium text-gray-700">Recent Users</h3>
                <div className="mt-3 space-y-2">
                  {users.slice(0, 4).map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                          👤
                        </div>
                        <div>
                          <div className="text-sm">{u.username}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">{u.role}</div>
                    </div>
                  )) || (
                      <div className="text-sm text-gray-400">No recent users</div>
                    )}
                </div>
              </div>

              <div className="bg-white p-6 rounded shadow">
                <h3 className="font-medium text-gray-700">Recent Listings</h3>
                <div className="mt-3 space-y-2">
                  {listings.slice(0, 4).map((l) => (
                    <div
                      key={l._id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm text-sky-600">{l.name}</div>
                        <div className="text-xs text-gray-400">{l.address}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {l.status || "—"}
                      </div>
                    </div>
                  )) || (
                      <div className="text-sm text-gray-400">
                        No recent listings
                      </div>
                    )}
                </div>
              </div>

              <div className="bg-white p-6 rounded shadow">
                <h3 className="font-medium text-gray-700">Recent Payments</h3>
                <div className="mt-3 space-y-2">
                  {payments.slice(0, 4).map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm">₹{p.amount}</div>
                        <div className="text-xs text-gray-400">
                          {p.paymentId || p._id}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )) || (
                      <div className="text-sm text-gray-400">
                        No recent payments
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
