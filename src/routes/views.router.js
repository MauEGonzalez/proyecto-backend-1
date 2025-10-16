import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';
import { CartModel } from '../models/cart.model.js';

const router = Router();

router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            lean: true
        };

        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }
        
        const filter = {};
        if (query) {
            const [field, value] = query.split(':');
            if (field && value) {
                if (field === 'status') {
                    filter[field] = value.toLowerCase() === 'true';
                } else {
                    filter[field] = value;
                }
            }
        }

        const result = await ProductModel.paginate(filter, options);
        
        const response = {
            products: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null,
            nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null,
        };

        res.render('products', response);

    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send('Error al obtener los productos');
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await CartModel.findById(cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        res.render('cart', { cart });
    } catch (error) {
        res.status(500).send('Error al obtener el carrito');
    }
});

export default router;