import { Router } from 'express';
import { CartModel } from '../models/cart.model.js';

const router = Router();

// POST para crear un carrito vacío
router.post('/', async (req, res) => {
    try {
        const newCart = await CartModel.create({ products: [] });
        res.status(201).json({ message: 'Carrito creado', cart: newCart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET CART CON POPULATE
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await CartModel.findById(cid).populate('products.product').lean();
        
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE (eliminar un producto específico del carrito)
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await CartModel.findByIdAndUpdate(
            cid,
            { $pull: { products: { product: pid } } },
            { new: true }
        );
        res.json({ message: 'Producto eliminado del carrito', cart: updatedCart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT (actualizar carrito completo con un arreglo)
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        const updatedCart = await CartModel.findByIdAndUpdate(cid, { products }, { new: true }).populate('products.product');
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT (actualizar SÓLO la cantidad de un producto)
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        const cart = await CartModel.findOneAndUpdate(
            { _id: cid, 'products.product': pid },
            { $set: { 'products.$.quantity': Number(quantity) } },
            { new: true }
        );

        if (!cart) return res.status(404).json({ message: 'Carrito o producto no encontrado' });
        
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE (vaciar todo el carrito)
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const updatedCart = await CartModel.findByIdAndUpdate(cid, { products: [] }, { new: true });
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;