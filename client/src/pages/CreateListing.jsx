import React, { useEffect, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api.js";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user || {});
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedRooms: 1,
    bathRooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // redirect if not signed in
  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const storeImage = async (file) => {
    if (!file) throw new Error("No file");
    if (file.size > 2 * 1024 * 1024) throw new Error("File too large");
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = `${new Date().getTime()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (err) => {
          console.error("Firebase upload error:", err);
          reject(err);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  };

  const handleImageSubmit = async (e) => {
    e?.preventDefault();
    setImageUploadError(false);
    if (!files || files.length === 0) return setImageUploadError("No files selected");
    if (files.length + formData.imageUrls.length > 6) {
      return setImageUploadError("You can only upload up to 6 images per listing");
    }

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const urls = await Promise.all(fileArray.map((f) => storeImage(f)));
      setFormData((prev) => ({ ...prev, imageUrls: prev.imageUrls.concat(urls) }));
      setFiles([]); // clear selected files
    } catch (err) {
      console.error(err);
      setImageUploadError("Image Upload Failed (2 MB max per image)");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;

    // type selection (sale/rent) - we treat them as mutually exclusive
    if (id === "sale" || id === "rent") {
      setFormData((prev) => ({ ...prev, type: id === "sale" ? "sale" : "rent" }));
      return;
    }

    // boolean flags
    if (id === "parking" || id === "furnished" || id === "offer") {
      setFormData((prev) => ({ ...prev, [id]: checked }));
      return;
    }

    // number inputs
    setFormData((prev) => ({ ...prev, [id]: type === "number" ? +value : value }));
  };

  const resolveListingId = (resp) => {
    if (!resp) return null;
    if (resp._id) return resp._id;
    if (resp.listing && resp.listing._id) return resp.listing._id;
    if (resp.data && resp.data._id) return resp.data._id;
    if (resp.listingId) return resp.listingId;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    if (!currentUser || !currentUser._id) {
      setError("You must be signed in to create a listing.");
      return;
    }

    if (!formData.imageUrls || formData.imageUrls.length < 1) {
      setError("You must upload at least one image");
      return;
    }

    if (+formData.regularPrice < +formData.discountPrice) {
      setError("Discount price must be lower than regular price");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        userRef: currentUser._id,
      };

      const res = await fetch(`${API_BASE_URL}/api/listing/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success === false) {
        setError(data.message || "Failed to create listing");
        setLoading(false);
        return;
      }

      const listingId = resolveListingId(data);
      if (listingId) {
        navigate(`/listing/${listingId}`);
      } else {
        const fallback = data._id || data.listing?._id || data.data?._id;
        if (fallback) navigate(`/listing/${fallback}`);
        else {
          console.warn("Could not determine listing id from server response:", data);
          navigate("/profile");
        }
      }
    } catch (err) {
      console.error("Create listing error:", err);
      setError(err.message || "Something went wrong creating the listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto bg-gray-50 rounded-lg shadow-lg mt-5">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">Create a Listing</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* left side */}
        <div className="flex flex-col gap-6 flex-1 bg-white p-6 rounded-lg shadow-sm">
          <input
            type="text"
            id="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
            maxLength={62}
            minLength={10}
          />

          <textarea
            id="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="border p-3 rounded-lg resize-none"
            rows={4}
            required
          />

          <input
            type="text"
            id="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <div className="flex gap-6 flex-wrap">
            <label className="flex items-center gap-2">
              <input id="sale" type="checkbox" checked={formData.type === "sale"} onChange={handleChange} className="w-5 h-5" />
              Sell
            </label>
            <label className="flex items-center gap-2">
              <input id="rent" type="checkbox" checked={formData.type === "rent"} onChange={handleChange} className="w-5 h-5" />
              Rent
            </label>
            <label className="flex items-center gap-2">
              <input id="parking" type="checkbox" checked={formData.parking} onChange={handleChange} className="w-5 h-5" />
              Parking
            </label>
            <label className="flex items-center gap-2">
              <input id="furnished" type="checkbox" checked={formData.furnished} onChange={handleChange} className="w-5 h-5" />
              Furnished
            </label>
            <label className="flex items-center gap-2">
              <input id="offer" type="checkbox" checked={formData.offer} onChange={handleChange} className="w-5 h-5" />
              Offer
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bedRooms">Beds</label>
              <input id="bedRooms" type="number" min={1} max={10} value={formData.bedRooms} onChange={handleChange} className="p-3 border rounded-lg" required />
            </div>

            <div>
              <label htmlFor="bathRooms">Baths</label>
              <input id="bathRooms" type="number" min={1} max={10} value={formData.bathRooms} onChange={handleChange} className="p-3 border rounded-lg" required />
            </div>

            <div>
              <label htmlFor="regularPrice">Regular Price (₹ / month)</label>
              <input id="regularPrice" type="number" min={50} value={formData.regularPrice} onChange={handleChange} className="p-3 border rounded-lg" required />
            </div>

            {formData.offer && (
              <div>
                <label htmlFor="discountPrice">Discounted Price (₹ / month)</label>
                <input id="discountPrice" type="number" min={0} value={formData.discountPrice} onChange={handleChange} className="p-3 border rounded-lg" required />
              </div>
            )}
          </div>
        </div>

        {/* right side */}
        <div className="flex flex-col flex-1 gap-6 bg-white p-6 rounded-lg shadow-sm">
          <p className="font-semibold text-gray-800">
            Images:
            <span className="font-normal text-gray-500 ml-2">The first image will be the cover (max-6)</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <input
              className="p-3 border rounded-lg w-full sm:w-auto"
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded-lg uppercase disabled:opacity-70"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          <p className="text-red-600 text-sm">{imageUploadError && imageUploadError}</p>

          {formData.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {formData.imageUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="flex flex-col gap-2 p-2 border rounded-lg shadow-sm items-center">
                  <img src={url} alt={`listing-${index}`} className="w-full h-32 object-cover rounded-lg" />
                  <button type="button" onClick={() => handleRemoveImage(index)} className="p-2 w-full text-white bg-red-600 rounded-lg hover:bg-red-700">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading || uploading} className="p-4 mt-4 bg-blue-700 text-white rounded-lg uppercase disabled:opacity-70">
            {loading ? "Creating..." : "Create Listing"}
          </button>

          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </form>
    </main>
  );
}
