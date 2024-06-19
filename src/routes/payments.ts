import express from "express";

import { adminOnly } from "../middleware/auth.js";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupon,
  paymentSignatureValiation,
} from "../controllers/payment.controller.js";

const app = express.Router();

app.post("/create", createPaymentIntent);
app.post("/verification", paymentSignatureValiation);

app.get("/discount", applyDiscount);
app.post("/coupon/new", adminOnly, newCoupon);

app.get("/coupon/all", adminOnly, allCoupons);
app.delete("/coupon/:id", adminOnly, deleteCoupon);

export default app;
