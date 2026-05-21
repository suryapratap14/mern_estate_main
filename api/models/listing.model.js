import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    regularPrice: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number,
      required: true
    },
    bathRooms: {
      type: Number,
      required: true
    },
    bedRooms: {
      type: Number,
      required: true
    },
    furnished: {
      type: Boolean,
      required: true
    },
    parking: {
      type: Boolean,
      required: true
    },
    type: {
      type: String,
      required: true
    }, // "sale" | "rent"
    offer: {
      type: Boolean,
      required: true
    },
    imageUrls: {
      type: [String],
      required: true
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
