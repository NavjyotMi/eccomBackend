import { TryCatch } from "../middleware/errorMiddleware.js";
import { Coupon } from "../models/coupon.model.js";
import ErrorHandler from "../utils/utitlity-class.js";
import Razorpay from "razorpay";
import crypto from "crypto";

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount } = req.body;
  if (!amount)
    return next(new ErrorHandler("Please enter amount or coupon", 404));

  const options = {
    amount: Number(amount) * 100,
    currency: "INR",
    receipt: "order_rcptid_11",
  };

  let instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const order = await instance.orders.create(options);
  return res.status(201).json({
    success: true,
    order,
  });
});

export const paymentSignatureValiation = TryCatch(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const sha = crypto.createHmac(
    "sha256",
    process.env.RAZORPAY_KEY_SECRET || ""
  );
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");

  if (digest !== razorpay_signature)
    return res.json({ msg: "the signature is not succesfull" });

  res.json({
    msg: "success",
    valid: true,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;
  if (!coupon || !amount)
    return next(new ErrorHandler("Please enter amount or coupon", 404));
  await Coupon.create({ code: coupon, amount });

  return res.status(201).json({
    success: true,
    message: `Coupon ${coupon} created succefully`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const allCoupons = await Coupon.find();

  return res.status(200).json({
    success: true,
    allCoupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  await Coupon.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});
