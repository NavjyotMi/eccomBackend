import { User } from "../models/User.js";
import ErrorHandler from "../utils/utitlity-class.js";
import { TryCatch } from "./errorMiddleware.js";

// Middleware to make sure only admin is allowed
export const adminOnly = TryCatch(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new ErrorHandler("Please Login", 401));
  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("Please Enter correct id", 401));

  if (user.role !== "admin")
    return next(new ErrorHandler("You are not Authorized to access this", 401));

  next();
});
