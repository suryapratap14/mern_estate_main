import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import { useSelector } from "react-redux";
import { FaBath, FaBed, FaChair, FaMapMarkerAlt, FaParking, FaShare } from "react-icons/fa";
import Contact from "../components/Contact";

SwiperCore.use([Navigation]);

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);

  const params = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user || {});

  const listingId = params.listingId || params.id || params._id;

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        setError(true);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        const listingData = data.listing || data.data || data;
        setListing(listingData);
        setLoading(false);
        setError(false);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handlePayment = async () => {
    if (!currentUser) {
      const confirmRedirect = window.confirm("You need to sign in to continue. Do you want to sign-in?");
      if (confirmRedirect) navigate("/sign-in");
      return;
    }

    if (!listing) return;

    if (currentUser._id === listing.userRef) {
      alert("You cannot buy or rent your own listing.");
      return;
    }

    const amount = listing.offer ? listing.discountPrice : listing.regularPrice;

    const options = {
      key: "rzp_test_RWlC10L2Vi8Ynr",
      amount: (amount || 0) * 100,
      currency: "INR",
      name: listing.name,
      description: listing.description,
      handler: async function (response) {
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);

        try {
          await fetch("/api/payment/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              userId: currentUser._id,
              listingId: listing._id,
              amount: amount,
              type: listing.type,
            }),
          });
        } catch (err) {
          console.error("Error saving payment:", err);
        }
        setTimeout(() => {
          navigate("/profile?view=payments");
        }, 500);
      },
      prefill: {
        name: currentUser.username || "",
        email: currentUser.email || "",
      },
      theme: { color: "#0284c7" },
    };

    if (typeof window.Razorpay !== "function") {
      alert("Payment gateway not available (Razorpay script not loaded).");
      return;
    }

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <main className="bg-gray-50 min-h-screen mt-5">
      {loading && <p className="text-center my-7 text-2xl text-gray-700">Loading...</p>}
      {error && <p className="text-center my-7 text-2xl text-red-600">Something went wrong!</p>}

      {listing && !loading && !error && (
        <div className="relative">
          <Swiper navigation className="h-[300px] md:h-[400px]">
            {Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0 ? (
              listing.imageUrls.map((url, idx) => (
                <SwiperSlide key={`${url}-${idx}`}>
                  <div
                    className="h-full w-full rounded-lg shadow-md"
                    style={{
                      background: `url(${url}) center no-repeat`,
                      backgroundSize: "cover",
                    }}
                  />
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="h-full w-full rounded-lg shadow-md bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600">No images</span>
                </div>
              </SwiperSlide>
            )}
          </Swiper>

          <div className="fixed top-[13%] right-[3%] z-20 border rounded-full w-12 h-12 flex justify-center items-center bg-white shadow-md cursor-pointer hover:bg-gray-100 transition">
            <FaShare
              className="text-gray-600"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            />
          </div>

          {copied && <p className="fixed top-[23%] right-[5%] z-20 rounded-md bg-white p-2 shadow-md text-sm text-gray-700">Link copied!</p>}

          <div className="flex flex-col max-w-7xl mx-auto p-5 md:p-7 my-7 bg-white rounded-lg shadow-md gap-5">
            <p className="text-2xl md:text-3xl font-bold text-sky-700">
              {listing.name} - ₹
              {listing.offer ? Number(listing.discountPrice)?.toLocaleString("en-US") : Number(listing.regularPrice)?.toLocaleString("en-US")}
              {listing.type === "rent" && " / month"}
            </p>

            <p className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
              <FaMapMarkerAlt className="text-green-600" />
              {listing.address}
            </p>

            <div className="flex flex-wrap gap-3 mt-2">
              {listing.offer && (
                <p className="bg-green-700 text-white px-3 py-1 rounded-md">
                  ₹{Number(listing.regularPrice || 0) - Number(listing.discountPrice || 0)} OFF
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      const confirmRedirect = window.confirm("You need to sign in to continue. Do you want to sign-in?");
                      if (confirmRedirect) navigate("/sign-in");
                      return;
                    }
                    if (currentUser._id === listing.userRef) {
                      alert("You cannot buy or rent your own listing.");
                      return;
                    }
                    handlePayment();
                  }}
                  className={`w-40 h-12 rounded-lg font-semibold text-white transition-all duration-300 ${currentUser ? "bg-sky-600 hover:bg-sky-700" : "bg-gray-400 cursor-not-allowed"}`}
                >
                  {listing.type === "rent" ? "Rent Now" : "Buy Now"}
                </button>

                {listing.offer && (
                  <p className="w-40 h-12 flex items-center justify-center bg-green-700 text-white rounded-lg font-semibold">
                    ₹{Number(listing.regularPrice || 0) - Number(listing.discountPrice || 0)} OFF
                  </p>
                )}
              </div>
            </div>

            <p className="text-gray-800 mt-4">
              <span className="font-semibold text-gray-900">Description: </span>
              {listing.description}
            </p>

            <ul className="text-gray-700 font-semibold text-sm flex flex-wrap gap-5 mt-3">
              <li className="flex items-center gap-1">
                <FaBed className="text-lg text-sky-600" />
                {listing.bedRooms} {listing.bedRooms > 1 ? "beds" : "bed"}
              </li>
              <li className="flex items-center gap-1">
                <FaBath className="text-lg text-sky-600" />
                {listing.bathRooms} {listing.bathRooms > 1 ? "baths" : "bath"}
              </li>
              <li className="flex items-center gap-1">
                <FaParking className="text-lg text-sky-600" />
                {listing.parking ? "Parking spot" : "No Parking"}
              </li>
              <li className="flex items-center gap-1">
                <FaChair className="text-lg text-sky-600" />
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </li>
            </ul>

            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button onClick={() => setContact(true)} className="bg-sky-700 text-white rounded-lg uppercase hover:bg-sky-800 transition p-3 mt-5">
                Contact landlord
              </button>
            )}

            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}
