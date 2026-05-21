import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user || {});
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // detect admin (common patterns)
  const isAdmin = !!(currentUser && (currentUser.role === "admin" || currentUser.isAdmin));

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    navigate(`/search?${urlParams.toString()}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm") || "";
    setSearchTerm(searchTermFromUrl);
  }, [location.search]);

  const avatarSrc = currentUser?.avatar || null;
  const initials = currentUser?.username
    ? currentUser.username
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="bg-sky-100 shadow-md sticky top-0 z-50">
      <div className="flex flex-col sm:flex-row justify-between items-center max-w-6xl mx-auto p-3 gap-3">
        {/* Brand stays visible for everyone */}
        <Link to="/" className="flex items-center gap-1">
          <h1 className="font-bold text-lg sm:text-2xl flex flex-wrap">
            <span className="text-sky-500">Home</span>
            <span className="text-sky-700">Heaven</span>
          </h1>
        </Link>

        {/* hide search bar for admin */}
        {!isAdmin && (
          <form
            onSubmit={handleSubmit}
            className="flex items-center w-full sm:w-auto bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 hover:shadow-md transition"
          >
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent focus:outline-none text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="ml-2 text-sky-600 hover:text-sky-800 transition">
              <FaSearch />
            </button>
          </form>
        )}

        <ul className="flex items-center gap-4">
          {/* hide the Home link for admin users (About remains) */}
          {!isAdmin && (
            <Link to="/">
              <li className="hidden sm:inline text-sky-700 hover:underline transition">Home</li>
            </Link>
          )}

          <Link to="/about">
            <li className="hidden sm:inline text-sky-700 hover:underline transition">About</li>
          </Link>

          <Link to={currentUser ? "/profile" : "/sign-in"} className="flex items-center">
            {currentUser ? (
              avatarSrc ? (
                <img
                  className="rounded-full h-8 w-8 object-cover border-2 border-sky-500 hover:border-sky-700 transition"
                  src={avatarSrc}
                  alt="profile"
                />
              ) : (
                <div className="h-8 w-8 rounded-full flex items-center justify-center font-semibold bg-sky-200 text-sky-700 border-2 border-sky-500">
                  {initials}
                </div>
              )
            ) : (
              <li className="text-sky-700 hover:underline transition">Sign in</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
