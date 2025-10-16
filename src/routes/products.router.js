import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';

const router = Router();

// GET CON PAGINACIÓN, FILTROS Y ORDENAMIENTO
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const options = { limit: parseInt(limit), page: parseInt(page), lean: true };
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
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null,
            nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null
        };
        
        res.json(response);

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// POST PARA CREAR UN NUEVO PRODUCTO
router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = await ProductModel.create(productData);
        
        const io = req.app.get('socketio');
        if (io) {
            io.emit('updateProducts');
        }

        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ status: 'error', message: `El código de producto '${error.keyValue.code}' ya existe.` });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// GET PARA UN PRODUCTO ESPECÍFICO POR ID
router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await ProductModel.findById(pid).lean();
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// PUT PARA ACTUALIZAR UN PRODUCTO
router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const productData = req.body;
        const updatedProduct = await ProductModel.findByIdAndUpdate(pid, productData, { new: true }).lean();
        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// DELETE PARA ELIMINAR UN PRODUCTO
router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const deletedProduct = await ProductModel.findByIdAndDelete(pid);
        if (!deletedProduct) {
            return res.status(4404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;