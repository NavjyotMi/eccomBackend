import { TryCatch } from "../middleware/errorMiddleware.js";
import { Product } from "../models/products.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Request } from "express";
import ErrorHandler from "../utils/utitlity-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidatesCache } from "../utils/features.js";

export const newProdcut = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please Add Photo", 404));
    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {});
      return next(new ErrorHandler("Please Enter All the fields", 404));
    }
    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

    await invalidatesCache({ product: true });
    return res.status(201).json({
      success: true,
      message: "Product created succefully",
    });
  }
);

// Revalidate on New, Update or Delete Product
export const getlatestProdcuts = TryCatch(async (req, res, next) => {
  let products = [];
  if (myCache.has("latest-products"))
    products = JSON.parse(myCache.get("latest-products") as string);
  else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-products", JSON.stringify(products));
  }
  return res.status(201).json({
    success: true,
    products,
  });
});

// Revalidate on New, Update or Delete Product
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories") as string);
  else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }
  return res.status(201).json({
    success: true,
    categories,
  });
});

// Revalidate on New, Update or Delete Product
export const getAdminProdcuts = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("all-products"))
    products = JSON.parse(myCache.get("all-products") as string);
  else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(201).json({
    success: true,
    products,
  });
});

export const getSingleProdcuts = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 400));

  return res.status(201).json({
    success: true,
    product,
  });
});

export const updateProdcut = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const { name, price, stock, category } = req.body;
  const photo = req.file;

  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Invalid Product Id", 400));

  if (photo) {
    rm(product.photo!, () => {});
    product.photo = photo.path;
  }

  if (name) product.name = name;

  if (price) product.name = price;
  if (stock) product.name = stock;
  if (category) product.name = category;
  await product.save();

  await invalidatesCache({ product: true });

  return res.status(200).json({
    success: true,
    message: "Product updated succefully",
  });
});

export const deleteProdcuts = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Invalid Product Id", 400));
  rm(product.photo!, () => {});

  await product.deleteOne();

  await invalidatesCache({ product: true });

  return res.status(201).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProdcuts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

    const skip = limit * (page - 1);
    const baseQuery: BaseQuery = {};

    if (search) baseQuery.name = { $regex: search, $options: "i" };

    if (price) baseQuery.price = { $lte: Number(price) };
    if (category) baseQuery.category = category;

    const productsPromise = await Product.find(baseQuery)
      .sort(sort && { price: 1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);
    const totalPage = Math.ceil(filteredOnlyProducts.length / limit);

    return res.status(201).json({
      success: true,
      message: "this is to check it this path is working",
      products,
      totalPage,
    });
  }
);
