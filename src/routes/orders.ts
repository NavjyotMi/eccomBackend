import express from "express";
import { adminOnly } from "../middleware/auth.js";

import {
  allOrder,
  deleteOrder,
  getSingleOrder,
  myOrder,
  newOrder,
  processOrder,
} from "../controllers/order.js";

const app = express.Router();

//route -  /api/v1/order/new
app.post("/new", newOrder);
app.get("/my", myOrder);
app.get("/all", adminOnly, allOrder);

app
  .route("/:id")
  .get(getSingleOrder)
  .put(adminOnly, processOrder)
  .delete(adminOnly, deleteOrder);

export default app;
