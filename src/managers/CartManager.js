import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";

export class CartManager {
  constructor(path) {
    this.path = path;
  }

  async getCarts() {
    try {
      const data = await fs.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async createCart() {
    const carts = await this.getCarts();
    const newCart = {
      id: uuidv4(),
      products: [],
    };
    carts.push(newCart);
    await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    const cart = carts.find((c) => c.id === id);
    return cart;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex((c) => c.id === cid);

    if (cartIndex === -1) {
      return null;
    }

    const cart = carts[cartIndex];
    const productIndexInCart = cart.products.findIndex(
      (p) => p.product === pid
    );

    if (productIndexInCart !== -1) {
      cart.products[productIndexInCart].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    carts[cartIndex] = cart;
    await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }
}
