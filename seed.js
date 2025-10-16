import mongoose from "mongoose";
import { ProductModel } from "./src/models/product.model.js";
import { promises as fs } from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("🌱 Conectado a MongoDB para la siembra...");

    await ProductModel.deleteMany({});
    console.log("🧹 Productos anteriores eliminados.");

    const filePath = path.join(process.cwd(), "src", "data", "products.json");
    const data = await fs.readFile(filePath, "utf-8");
    const products = JSON.parse(data);

    await ProductModel.insertMany(products);
    console.log("✅ ¡Base de datos sembrada con éxito!");
  } catch (error) {
    console.error("❌ Error durante la siembra:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Desconectado de MongoDB.");
  }
};

seedProducts();
