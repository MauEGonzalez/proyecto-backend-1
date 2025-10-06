import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProductManager } from '../managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const productManager = new ProductManager(path.join(__dirname, '../data/products.json'));

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products }); // Renderiza home.handlebars con los productos
    } catch (error) {
        res.status(500).send('Error al obtener los productos');
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realTimeProducts', { products }); // Renderiza realTimeProducts.handlebars
    } catch (error) {
        res.status(500).send('Error al obtener los productos');
    }
});

export default router;