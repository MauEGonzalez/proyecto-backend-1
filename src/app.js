import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport'; 
import cookieParser from 'cookie-parser'; 

// --- ¡LA CORRECCIÓN MÁS IMPORTANTE ESTÁ AQUÍ! ---
// 1. Cargar las variables de entorno PRIMERO
dotenv.config();

// 2. Importar la configuración de Passport DESPUÉS de dotenv
import './config/passport.config.js';

// --- El resto de tus importaciones ---
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import sessionsRouter from './routes/sessions.router.js';

// --- Constantes ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 8080;

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // CookieParser ANTES que passport
app.use(passport.initialize()); 

// --- Configuración de Vistas (Handlebars) ---
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// --- Conexión a MongoDB ---
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// --- Rutas ---
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/', viewsRouter);

// --- Iniciar Servidor ---
const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});

// --- Configuración de Websockets ---
const io = new Server(httpServer);
app.set('socketio', io);
io.on('connection', (socket) => {
    console.log('🔌 Nuevo cliente conectado');
});