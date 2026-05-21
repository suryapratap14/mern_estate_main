import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import API_BASE_URL from "../api.js";

function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "createdAt",
    order: "desc",
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const LIMIT = 9;

  const normalizeResponse = (json) => {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (json.success && Array.isArray(json.data)) return json.data;
    return [];
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const parsed = {
      searchTerm: urlParams.get("searchTerm") || "",
      type: urlParams.get("type") || "all",
      parking: urlParams.get("parking") === "true",
      furnished: urlParams.get("furnished") === "true",
      offer: urlParams.get("offer") === "true",
      sort: urlParams.get("sort") || "createdAt",
      order: urlParams.get("order") || "desc",
    };

    setSidebarData(parsed);

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      try {
        const res = await fetch(`${API_BASE_URL}/api/listing/get?${urlParams.toString()}`);
        const json = await res.json();
        const dataArr = normalizeResponse(json);
        setListings(dataArr);
        setShowMore((dataArr?.length ?? 0) >= LIMIT);
      } catch (err) {
        console.error("Search fetch error:", err);
        setListings([]);
        setShowMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;

    if (id === "searchTerm") {
      setSidebarData((prev) => ({ ...prev, searchTerm: value }));
      return;
    }

    if (["all", "rent", "sale"].includes(id)) {
      setSidebarData((prev) => ({ ...prev, type: id }));
      return;
    }

    if (["parking", "furnished", "offer"].includes(id)) {
      setSidebarData((prev) => ({ ...prev, [id]: checked }));
      return;
    }

    if (id === "sort_id") {
      const [sort, order] = value.split("_");
      setSidebarData((prev) => ({ ...prev, sort, order }));
      return;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (sidebarData.searchTerm) params.set("searchTerm", sidebarData.searchTerm);
    if (sidebarData.type) params.set("type", sidebarData.type);
    if (sidebarData.parking) params.set("parking", "true");
    if (sidebarData.furnished) params.set("furnished", "true");
    if (sidebarData.offer) params.set("offer", "true");
    if (sidebarData.sort) params.set("sort", sidebarData.sort);
    if (sidebarData.order) params.set("order", sidebarData.order);

    navigate(`/search?${params.toString()}`);
  };

  const onShowMoreClick = async () => {
    const currentLength = listings.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", String(currentLength));
    urlParams.set("limit", String(LIMIT));

    try {
      const res = await fetch(`${API_BASE_URL}/api/listing/get?${urlParams.toString()}`);
      const json = await res.json();
      const newData = normalizeResponse(json);
      setListings((prev) => [...prev, ...newData]);
      setShowMore(newData.length >= LIMIT);
    } catch (err) {
      console.error("Show more error:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-0 bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div className="p-7 border-b md:border-b-0 md:border-r border-gray-300 shadow-md md:min-h-screen bg-white rounded-lg md:w-80">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Search Term */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Search Term:</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search..."
              className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-sky-500 outline-none"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>

          {/* Type */}
          <div className="flex flex-col mt-5 gap-2">
            <label className="font-semibold">Type:</label>
            <div className="flex flex-wrap gap-4">
              {["all", "rent", "sale"].map((t) => (
                <div key={t} className="flex gap-2 items-center">
                  <input
                    type="radio"
                    id={t}
                    name="type"
                    className="w-5 h-5 accent-sky-500"
                    onChange={handleChange}
                    checked={sidebarData.type === t}
                  />
                  <span className="capitalize">{t === "all" ? "Rent & Sale" : t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-col mt-5 gap-2">
            <label className="font-semibold">Amenities:</label>
            <div className="flex flex-wrap gap-4">
              {["parking", "furnished", "offer"].map((amenity) => (
                <div key={amenity} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    id={amenity}
                    className="w-5 h-5 accent-sky-500"
                    onChange={handleChange}
                    checked={Boolean(sidebarData[amenity])}
                  />
                  <span className="capitalize">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex flex-col mt-5 gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              onChange={handleChange}
              id="sort_id"
              value={`${sidebarData.sort}_${sidebarData.order}`}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="regularPrice_desc">Price high to low</option>
              <option value="regularPrice_asc">Price low to high</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>

          <button className="bg-sky-600 text-white rounded-lg p-3 uppercase mt-5 hover:bg-sky-700 transition">
            Search
          </button>
        </form>
      </div>

      {/* Listings */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b border-gray-300 p-3 text-slate-700 bg-white sticky top-0 z-10">
          Listing Results:
        </h1>

        <div className="p-7 flex flex-wrap gap-6 bg-gray-50">
          {!loading && listings.length === 0 && (
            <p className="text-xl text-slate-700 w-full text-center mt-10">No listings found</p>
          )}

          {loading && (
            <p className="text-xl text-slate-700 w-full text-center mt-10">Loading...</p>
          )}

          {!loading &&
            Array.isArray(listings) &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              className="text-green-700 hover:underline p-5 w-full text-center"
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
