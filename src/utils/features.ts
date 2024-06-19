import mongoose from "mongoose";
import { InvalidateCacheProps, orderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/products.js";
import { Order } from "../models/order.js";

console;
export const connectDB = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log("the db is connedted");
  } catch (error) {
    console.log(error);
  }
};

export const invalidatesCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];

    myCache.del(productKeys);
  }
  if (order) {
    const ordersKeys: string[] = ["all-orders", `my-orders-${userId}`];
    const orders = await Order.find({}).select("_id");

    myCache.del(ordersKeys);
  }
  if (admin) {
    myCache.del([
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ]);
  }
};

export const reduceStock = async (orderItems: orderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];

    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product not found");

    product.stock -= order.quantity;
    await product.save();
  }
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = (thisMonth / lastMonth) * 100;

  return Number(percent.toFixed(0));
};

export const getInventories = async ({
  categories,
  productCounts,
}: {
  categories: string[];
  productCounts: number;
}) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );
  const categoriesCount = await Promise.all(categoriesCountPromise);
  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productCounts) * 100),
    });
  });
  return categoryCount;
};

interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}

type FuncProps = {
  length: number;
  docArr: MyDocument[];
  today: Date;
  property?: string;
};

export function transformToMyDocument(doc: any): MyDocument {
  return {
    ...doc,
    createdAt: new Date(doc.createdAt), // Ensures createdAt is a Date object
  };
}

export const getChartData = ({
  length,
  docArr,
  today,
  property,
}: FuncProps) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
    if (monthDiff < 6) {
      if (property) {
        data[length - monthDiff - 1] += i.discount!;
      } else data[length - monthDiff - 1] += 1;
    }
  });

  return data;
};
