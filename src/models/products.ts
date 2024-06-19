import mongoose from "mongoose";
import validator from "validator";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please enter Name"] },
    photo: {
      type: String,
      required: [true, "Please Enter Photo"],
    },
    price: {
      type: Number,
      required: [true, "Please Enter Price"],
    },
    stock: {
      type: Number,
      required: [true, "Please Enter Stock"],
    },
    category: {
      type: String,
      required: [true, "Please Enter Category"],
      trim: true,
    },
  },
  { timestamps: true }
);
export const Product = mongoose.model("Product", schema);
