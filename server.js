const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs'); // Configura EJS como mecanismo de visualização
app.set('views', path.join(__dirname, 'views')); // Configura a pasta de visualizações

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Dados de produtos para simulação
const products = [
    { id: 1, name: "Anel de Ouro", price: 1200, image: "/assets/images/produto1.webp", description: "Anel de ouro elegante." },
    { id: 2, name: "Colar de Prata", price: 800, image: "/assets/images/produto2.webp", description: "Colar de prata refinado." },
    { id: 3, name: "Pulseira de Platina", price: 1500, image: "/assets/images/produto3.webp", description: "Pulseira de platina exclusiva." }
];

// Array para simular o carrinho de compras
let cart = [];

// Rotas de API para o carrinho e produtos
app.get('/api/products', (req, res) => res.json(products));

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    product ? res.json(product) : res.status(404).json({ message: "Produto não encontrado" });
});

app.post('/api/cart', (req, res) => {
    const { id, quantity } = req.body;
    const product = products.find(p => p.id === id);

    if (product) {
        // Verifica se o item já está no carrinho
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            // Aumenta a quantidade do item existente
            existingItem.quantity += quantity;
        } else {
            // Adiciona o novo item ao carrinho com a quantidade inicial
            cart.push({ ...product, quantity });
        }
        res.status(200).json(cart);
    } else {
        res.status(404).json({ message: "Produto não encontrado" });
    }
});


app.get('/api/cart', (req, res) => res.json(cart));

app.delete('/api/cart/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    cart = cart.filter(item => item.id !== productId);
    res.status(200).json(cart);
});
// Renderizar páginas com partials e dados de produtos
app.get('/', (req, res) => {
    res.render('index', { products });
});

app.get('/product/:id', (req, res) => res.render('product', { productId: req.params.id }));
app.get('/cart', (req, res) => res.render('cart'));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
