import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user || {});
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = !!(
    currentUser &&
    (currentUser.role === "admin" || currentUser.isAdmin)
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set("searchTerm", searchTerm);

    navigate(`/search?${urlParams.toString()}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const searchTermFromUrl =
      urlParams.get("searchTerm") || "";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between">

          {/* Logo */}
          <Link to="/">
            <h1 className="font-bold text-2xl">
              <span className="text-sky-500">Home</span>
              <span className="text-sky-700">Heaven</span>
            </h1>
          </Link>

          {/* Mobile Right */}
          <div className="flex items-center gap-4">

            {!isAdmin && (
              <>
                <Link
                  to="/"
                  className="text-sky-700 text-sm font-medium"
                >
                  Home
                </Link>

                <Link
                  to="/about"
                  className="text-sky-700 text-sm font-medium"
                >
                  About
                </Link>
              </>
            )}

            <Link
              to={currentUser ? "/profile" : "/sign-in"}
            >
              {currentUser ? (
                avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="profile"
                    className="
                      h-9
                      w-9
                      rounded-full
                      object-cover
                      border-2
                      border-sky-500
                    "
                  />
                ) : (
                  <div
                    className="
                      h-9
                      w-9
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-sky-200
                      text-sky-700
                      font-semibold
                      border-2
                      border-sky-500
                    "
                  >
                    {initials}
                  </div>
                )
              ) : (
                <span className="text-sky-700 text-sm font-medium">
                  Sign In
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Tablet + Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <h1 className="font-bold text-2xl lg:text-3xl">
              <span className="text-sky-500">Home</span>
              <span className="text-sky-700">Heaven</span>
            </h1>
          </Link>

          {/* Search */}
          {!isAdmin && (
            <form
              onSubmit={handleSubmit}
              className="
                flex
                items-center
                flex-1
                max-w-md
                lg:max-w-xl
                bg-white
                rounded-xl
                border
                border-gray-200
                px-4
                py-2.5
                shadow-sm
              "
            >
              <input
                type="text"
                placeholder="Search..."
                className="
                  flex-1
                  bg-transparent
                  outline-none
                  text-sm
                  lg:text-base
                "
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

              <button
                type="submit"
                className="
                  text-sky-600
                  hover:text-sky-800
                  transition
                  text-lg
                "
              >
                <FaSearch />
              </button>
            </form>
          )}

          {/* Right Nav */}
          <div className="flex items-center gap-5 shrink-0">

            {!isAdmin && (
              <Link
                to="/"
                className="
                  text-sky-700
                  hover:text-sky-900
                  hover:underline
                  font-medium
                  transition
                "
              >
                Home
              </Link>
            )}

            <Link
              to="/about"
              className="
                text-sky-700
                hover:text-sky-900
                hover:underline
                font-medium
                transition
              "
            >
              About
            </Link>

            <Link
              to={currentUser ? "/profile" : "/sign-in"}
            >
              {currentUser ? (
                avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="profile"
                    className="
                      h-10
                      w-10
                      rounded-full
                      object-cover
                      border-2
                      border-sky-500
                      hover:border-sky-700
                      transition
                    "
                  />
                ) : (
                  <div
                    className="
                      h-10
                      w-10
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-sky-200
                      text-sky-700
                      font-semibold
                      border-2
                      border-sky-500
                    "
                  >
                    {initials}
                  </div>
                )
              ) : (
                <span
                  className="
                    text-sky-700
                    hover:text-sky-900
                    hover:underline
                    font-medium
                    transition
                  "
                >
                  Sign In
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}