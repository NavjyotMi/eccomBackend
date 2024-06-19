import express from "express";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import NodeCache from "node-cache";
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import orderRoute from "./routes/orders.js";
import { config } from "dotenv";
import { connectDB } from "./utils/features.js";
import morgan from "morgan";
import paymentRoute from "./routes/payments.js";
import dashboardRoute from "./routes/stats.js";
import cors from "cors";
import Razorpay from "razorpay";

config({
  path: "./.env",
});

const app = express();
const port = process.env.PORT || 4000;
const mongoURL = process.env.URI || "";
connectDB(mongoURL);
export const myCache = new NodeCache();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const instance = new Razorpay({
  key_id: "rzp_test_Sa5tAQ07iLcCyb",
  key_secret: "6Wm6f3T9zpDhy8YIw1q70rli",
});

app.use(express.json());
app.use(morgan("dev"));
app.use(cors(corsOptions));

// User Routes
app.get("/", (req, res) => {
  res.json({
    message: "the api is working now",
  });
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`It's working fine`);
});
