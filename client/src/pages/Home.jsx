import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import "swiper/css/bundle";
import ListingItem from "../components/ListingItem";
import API_BASE_URL from "../api.js";

function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation]);

  const normalize = (resJson) => {
    if (!resJson) return [];
    if (Array.isArray(resJson)) return resJson;
    if (resJson.success && Array.isArray(resJson.data)) return resJson.data;
    if (resJson.data && Array.isArray(resJson.data)) return resJson.data;
    return [];
  };

  useEffect(() => {
    let mounted = true;

    const fetchOfferListings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/listing/get?offer=true&limit=4`);
        const json = await res.json();
        if (!mounted) return;
        setOfferListings(normalize(json));
      } catch (err) {
        console.error("fetch offer error", err);
        if (mounted) setOfferListings([]);
      } finally {
        fetchRentAndSale();
      }
    };

    const fetchRentAndSale = async () => {
      try {
        const [rentRes, saleRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/listing/get?type=rent&limit=4`),
          fetch(`${API_BASE_URL}/api/listing/get?type=sale&limit=4`),
        ]);
        const rentJson = await rentRes.json();
        const saleJson = await saleRes.json();
        if (!mounted) return;
        setRentListings(normalize(rentJson));
        setSaleListings(normalize(saleJson));
      } catch (err) {
        console.error("fetch rent/sale error", err);
        if (mounted) {
          if (!rentListings.length) setRentListings([]);
          if (!saleListings.length) setSaleListings([]);
        }
      }
    };

    fetchOfferListings();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* Top */}
      <div className="flex flex-col gap-6 py-10 px-3 max-w-6xl mx-auto text-center sm:text-left">
        <h1 className="text-sky-700 font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
          Find a place you’ll <span className="text-sky-500">love</span>
          <br />
          to call home
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto sm:mx-0">
          Browse from a wide range of properties that fit your budget, taste, and lifestyle.
        </p>
        <Link
          to="/search"
          className="inline-block mt-3 px-4 py-2 bg-sky-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-sky-700 transition"
        >
          Let's Start now...
        </Link>
      </div>

      {/* Swiper */}
      <Swiper
        navigation={true}
        modules={[Navigation]}
        className="mySwiper mb-10 max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg"
      >
        {Array.isArray(offerListings) &&
          offerListings.length > 0 &&
          offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div
                className="h-[400px] sm:h-[500px] rounded-xl bg-center bg-cover transform transition duration-300 hover:scale-105"
                style={{
                  backgroundImage: `url(${(listing.imageUrls && listing.imageUrls[0]) || ""})`,
                }}
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>

      {/* Listing results for offer */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {offerListings && offerListings.length > 0 && (
          <div>
            <div className="flex justify-between items-center my-3">
              <h2 className="text-2xl font-semibold text-sky-600">Recent Offers</h2>
              <Link className="text-sm text-blue-800 hover:underline" to={"/search?offer=true"}>
                Show more offers
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {/* Listing results for rent */}
        {rentListings && rentListings.length > 0 && (
          <div>
            <div className="flex justify-between items-center my-3">
              <h2 className="text-2xl font-semibold text-sky-600">Recent places for rent</h2>
              <Link className="text-sm text-blue-800 hover:underline" to={"/search?type=rent"}>
                Show more places for rent
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {/* Listing results for sale */}
        {saleListings && saleListings.length > 0 && (
          <div>
            <div className="flex justify-between items-center my-3">
              <h2 className="text-2xl font-semibold text-sky-600">Recent places for sale</h2>
              <Link className="text-sm text-blue-800 hover:underline" to={"/search?type=sale"}>
                Show more places for sale
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
