// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Configuração do MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado ao MySQL com sucesso!');
});

// Configuração do multer para uploads de imagem
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Inicialização do carrinho como uma lista vazia
let cart = [];

// Rota para adicionar produto ao banco com imagem
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, price, description, collection, featured } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !price || !description || !collection || !image) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }

    // Converte 'featured' para 1 (verdadeiro) ou 0 (falso)
    const isFeatured = featured === 'on' ? 1 : 0;

    const sql = 'INSERT INTO products (name, price, description, collection, image, featured) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, parseFloat(price), description, collection, image, isFeatured], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar produto:', err);
            res.status(500).json({ message: 'Erro ao adicionar produto.' });
        } else {
            res.status(201).json({ message: 'Produto adicionado com sucesso!' });
        }
    });
});


// Rota para buscar apenas produtos destacados (featured = 1)
app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products WHERE featured = 1';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).json({ message: 'Erro ao buscar produtos.' });
        } else {
            const formattedResults = results.map(product => ({
                ...product,
                price: parseFloat(product.price),  // Certifique-se de que `price` seja um número
            }));
            res.json(formattedResults);
        }
    });
});

// Rota para exibir produtos de uma coleção específica
app.get('/collections/:collectionName', (req, res) => {
    const collectionName = req.params.collectionName;
    const sql = 'SELECT * FROM products WHERE collection = ?';

    db.query(sql, [collectionName], (err, products) => {
        if (err) {
            console.error('Erro ao buscar produtos da coleção:', err);
            return res.status(500).json({ message: 'Erro ao buscar produtos da coleção.' });
        }

        const formattedProducts = products.map(product => ({
            ...product,
            price: parseFloat(product.price)  // Certifique-se de que o preço é um número
        }));

        res.render('collection', { collectionName, products: formattedProducts });
    });
});

// Rota para retornar produtos de uma coleção específica pela API
app.get('/api/collections/:collectionName', (req, res) => {
    const collectionName = req.params.collectionName;
    const sql = 'SELECT * FROM products WHERE collection = ?';

    db.query(sql, [collectionName], (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos da coleção via API:', err);
            return res.status(500).json({ message: 'Erro ao buscar produtos da coleção.' });
        }
        
        res.json(results);
    });
});


// Rota para obter itens do carrinho
app.get('/api/cart', (req, res) => {
    res.json(cart);
});

// Rota para adicionar ao carrinho
app.post('/api/cart', (req, res) => {
    const { id, quantity } = req.body;

    const productIndex = cart.findIndex(item => item.id === id);
    if (productIndex !== -1) {
        cart[productIndex].quantity += quantity;
    } else {
        const sql = 'SELECT * FROM products WHERE id = ?';
        db.query(sql, [id], (err, results) => {
            if (err || results.length === 0) {
                console.error('Produto não encontrado:', err);
                res.status(404).json({ message: 'Produto não encontrado' });
            } else {
                const newProduct = { ...results[0], quantity };
                cart.push(newProduct);
                res.status(200).json(cart);
            }
        });
    }
});

// Rota para remover do carrinho
app.delete('/api/cart/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    cart = cart.filter(item => item.id !== productId);
    res.status(200).json(cart);
});

app.get('/', (req, res) => {
    const sql = 'SELECT * FROM products WHERE featured = 1'; // Apenas produtos com featured = 1
    db.query(sql, (err, products) => {
        if (err) throw err;

        const featuredProducts = products.map(product => ({
            ...product,
            price: parseFloat(product.price)  // Converte o preço para número
        }));

        res.render('index', { featuredProducts });
    });
});

app.get('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [productId], (err, results) => {
        if (err || results.length === 0) {
            res.status(404).send('Produto não encontrado');
        } else {
            res.render('product', { product: results[0] });
        }
    });
});

app.get('/cart', (req, res) => res.render('cart'));

// Rota para página de adicionar produto
app.get('/add_product', (req, res) => res.render('add_product'));

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
