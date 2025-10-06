// src/app.js
import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js'; // Importamos el nuevo router
import { ProductManager } from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;
const productManager = new ProductManager(path.join(__dirname, './data/products.json'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Iniciar servidor HTTP
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Iniciar servidor de Websockets
const io = new Server(httpServer);

// Hacemos que el servidor de sockets sea accesible globalmente en la app
// ¡Esta es la clave para poder usarlo en las rutas!
app.set('socketio', io);

// Routes
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter); // Usamos el router de vistas

// Lógica de Sockets
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });

    // Escuchamos el evento para agregar un producto
    socket.on('addProduct', async (product) => {
        await productManager.addProduct(product);
        // Emitimos la lista actualizada a TODOS los clientes
        const products = await productManager.getProducts();
        io.emit('updateProducts', products);
    });

    // Escuchamos el evento para eliminar un producto
    socket.on('deleteProduct', async (productId) => {
        await productManager.deleteProduct(productId);
        // Emitimos la lista actualizada a TODOS los clientes
        const products = await productManager.getProducts();
        io.emit('updateProducts', products);
    });
});