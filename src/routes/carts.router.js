import { Router } from "express";
import { CartManager } from "../managers/CartManager.js";

const router = Router();
const cartManager = new CartManager("./src/data/carts.json");
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (cart) {
      res.json(cart.products);
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const updatedCart = await cartManager.addProductToCart(
      req.params.cid,
      req.params.pid
    );
    if (updatedCart) {
      res.json(updatedCart);
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});

export default router;
