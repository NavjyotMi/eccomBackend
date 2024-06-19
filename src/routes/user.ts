import express from "express";
import { adminOnly } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../controllers/user.js";

const app = express.Router();

app.post("/new", newUser);

app.get("/all", adminOnly, getAllUsers);

app.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default app;
