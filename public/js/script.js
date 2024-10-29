// Função para exibir o modal com mensagem personalizada
function showModal(message) {
    const modalTitle = document.getElementById('alertModalLabel');
    const modalBody = document.getElementById('alertModalBody');

    if (modalTitle && modalBody) {
        modalTitle.textContent = "Sucesso";
        modalBody.textContent = message;

        // Inicializar o modal e mostrar
        const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
        alertModal.show();
    } else {
        console.error("Elementos do modal não encontrados no DOM.");
    }
}

// Função para carregar produtos dinamicamente na página inicial
function loadProducts() {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('product-list');
            productList.innerHTML = ''; // Limpa o conteúdo antes de renderizar

            products.forEach(product => {
                const productPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price);
                const productCard = document.createElement('div');
                productCard.classList.add('col-md-4', 'mb-4');

                productCard.innerHTML = `
                    <div class="card">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                        <div class="card-body">
                            <h3 class="card-title">${product.name}</h3>
                            <p class="card-text">R$ ${productPrice.toFixed(2)}</p>
                            <button onclick="addToCart(${product.id})" class="btn btn-warning mt-2">Adicionar ao Carrinho</button>
                            <a href="/product/${product.id}" class="btn btn-outline-primary mt-2">Ver Detalhes</a>
                        </div>
                    </div>
                `;
                productList.appendChild(productCard);
            });
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));
}

// Função para carregar itens do carrinho na página de carrinho
function loadCart() {
    fetch('/api/cart')
        .then(response => response.json())
        .then(cartItems => {
            const cartItemsContainer = document.getElementById('cart-items');
            let total = 0;
            cartItemsContainer.innerHTML = ''; // Limpa o conteúdo do carrinho

            if (cartItems.length === 0) {
                cartItemsContainer.innerHTML = '<tr><td colspan="6" class="text-center">Seu carrinho está vazio.</td></tr>';
            } else {
                cartItems.forEach(item => {
                    const price = parseFloat(item.price); // Converte price para número
                    const subtotal = price * item.quantity;
                    total += subtotal;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                        <td>${item.name}</td>
                        <td>
                            <input type="number" value="${item.quantity}" min="1" class="form-control form-control-sm" onchange="updateCartItem(${item.id}, this.value)">
                        </td>
                        <td>R$ ${price.toFixed(2)}</td>
                        <td>R$ ${subtotal.toFixed(2)}</td>
                        <td>
                            <button onclick="removeFromCart(${item.id})" class="btn btn-danger btn-sm">Remover</button>
                        </td>
                    `;
                    cartItemsContainer.appendChild(row);
                });
            }

            document.getElementById('cart-total').innerText = `R$ ${total.toFixed(2)}`;
        })
        .catch(error => console.error('Erro ao carregar o carrinho:', error));
}


// Função para adicionar um item ao carrinho e exibir o alerta
function addToCart(productId) {
    fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, quantity: 1 })
    })
    .then(response => response.json())
    .then(() => {
        showModal("Produto adicionado ao carrinho!");
        updateCartCount();
        loadCart();
    })
    .catch(error => console.error('Erro ao adicionar ao carrinho:', error));
}

// Função para remover um item do carrinho e exibir o alerta
function removeFromCart(productId) {
    fetch(`/api/cart/${productId}`, {
        method: 'DELETE'
    })
    .then(() => {
        showModal("Produto removido do carrinho.");
        loadCart();
        updateCartCount();
    })
    .catch(error => console.error('Erro ao remover do carrinho:', error));
}

// Função para atualizar a quantidade de um item no carrinho
function updateCartItem(productId, quantity) {
    fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, quantity: parseInt(quantity) })
    })
    .then(() => {
        loadCart();
        updateCartCount();
    })
    .catch(error => console.error('Erro ao atualizar item do carrinho:', error));
}

// Função para atualizar o número de itens no carrinho no cabeçalho
function updateCartCount() {
    fetch('/api/cart')
        .then(response => response.json())
        .then(cartItems => {
            const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
            document.getElementById('cart-count').textContent = cartCount;
        })
        .catch(error => console.error('Erro ao atualizar contagem do carrinho:', error));
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Carrega os produtos apenas na página inicial
    if (document.getElementById('product-list')) {
        loadProducts();
    }

    // Carrega o carrinho apenas na página do carrinho
    if (document.getElementById('cart-items')) {
        loadCart();
    }
});

function finalizarCompra() {
    // Mostrar mensagem de processando no modal
    const modalBody = document.getElementById('alertModalBody');
    modalBody.innerHTML = `<div class="text-center">
        <p>Processando seu pedido...</p>
        <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>`;

    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    alertModal.show();

    // Simular atraso de processamento
    setTimeout(() => {
        // Atualizar o modal para exibir a confirmação de compra
        modalBody.innerHTML = `
            <div class="text-center">
                <p class="fs-4 text-success">Compra Aprovada com Sucesso!</p>
                <p>Obrigado por sua compra. O número do pedido é: <strong>#${Math.floor(Math.random() * 100000)}</strong></p>
            </div>`;
        
        // Limpar o carrinho (para simular que a compra foi finalizada)
        limparCarrinho();
    }, 3000); // 3 segundos de espera para a simulação
}

// Função para limpar o carrinho após a finalização da compra
function limparCarrinho() {
    fetch('/api/cart', {
        method: 'DELETE'
    })
    .then(() => {
        document.getElementById('cart-items').innerHTML = '<tr><td colspan="6" class="text-center">Seu carrinho está vazio.</td></tr>';
        document.getElementById('cart-total').textContent = 'R$ 0,00';
        updateCartCount();
    })
    .catch(error => console.error('Erro ao limpar o carrinho:', error));
}
