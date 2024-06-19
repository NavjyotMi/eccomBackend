import express from "express";

import { adminOnly } from "../middleware/auth.js";
import {
  deleteProdcuts,
  getAdminProdcuts,
  getAllCategories,
  getAllProdcuts,
  getSingleProdcuts,
  getlatestProdcuts,
  newProdcut,
  updateProdcut,
} from "../controllers/product.js";
import { singleUpload } from "../middleware/multer.js";
const app = express.Router();
// Create New PRODUCT - /api/v1/product/new
app.post("/new", adminOnly, singleUpload, newProdcut);

// Get Latest PRODUCT - /api/v1/product/latest
app.get("/latest", getlatestProdcuts);

// console.log("it it reaching in the route folder or not");
// Get all Product with filters
app.get("/all", getAllProdcuts);

// Get All Categories - /api/v1/product/categories
app.get("/categories", getAllCategories);

// To get all Products - /api/v1/product/admin-products
app.get("/admin-products", adminOnly, getAdminProdcuts);

//get single product
app
  .route("/:id")
  .get(getSingleProdcuts)
  .put(adminOnly, singleUpload, updateProdcut)
  .delete(adminOnly, deleteProdcuts);

export default app;
