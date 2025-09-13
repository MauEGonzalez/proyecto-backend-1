import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";

export class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async getProducts() {
    try {
      const data = await fs.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async addProduct(product) {
    const products = await this.getProducts();

    if (
      !product.title ||
      !product.description ||
      !product.code ||
      !product.price ||
      !product.stock ||
      !product.category
    ) {
      console.error("Todos los campos son obligatorios, excepto thumbnails.");
      return;
    }

    const newProduct = {
      id: uuidv4(),
      status: true,
      ...product,
    };

    products.push(newProduct);
    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    return newProduct;
  }

  async getProductById(id) {
    const products = await this.getProducts();
    const product = products.find((p) => p.id === id);
    return product;
  }

  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return null;
    }

    delete updatedFields.id;

    products[productIndex] = { ...products[productIndex], ...updatedFields };
    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    return products[productIndex];
  }

  async deleteProduct(id) {
    let products = await this.getProducts();
    const initialLength = products.length;
    products = products.filter((p) => p.id !== id);

    if (products.length === initialLength) {
      return false;
    }

    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    return true;
  }
}
