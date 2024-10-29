// Função para carregar produtos dinamicamente
fetch('/api/products')
    .then(response => response.json())
    .then(products => {
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Limpa conteúdo antes de renderizar
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('col-md-4');
            productCard.innerHTML = `
                <div class="card">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h3 class="card-title">${product.name}</h3>
                        <p class="card-text">R$ ${product.price.toFixed(2)}</p>
                        <a href="/product/${product.id}" class="btn btn-outline-primary">Ver Detalhes</a>
                        <button onclick="addToCart(${product.id})" class="btn btn-warning mt-2">Adicionar ao Carrinho</button>
                    </div>
                </div>
            `;
            productList.appendChild(productCard);
        });
    })
    .catch(error => console.error('Erro ao carregar produtos:', error));

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
        console.error("Modal elements not found in the DOM.");
    }
}

// Função para adicionar produto ao carrinho com modal
function addToCart(productId) {
    fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, quantity: 1 })
    })
    .then(response => response.json())
    .then(cart => {
        showModal('Produto adicionado ao carrinho!');
        updateCartCount(); // Atualiza o contador de itens no carrinho
    })
    .catch(error => {
        showModal('Erro ao adicionar ao carrinho.');
        console.error('Erro ao adicionar ao carrinho:', error);
    });
}

// Função para atualizar o número de itens no carrinho
function updateCartCount() {
    fetch('/api/cart')
        .then(response => response.json())
        .then(cartItems => {
            const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
            document.getElementById('cart-count').textContent = cartCount;
        })
        .catch(error => console.error('Erro ao atualizar contagem do carrinho:', error));
}

// Atualiza a contagem do carrinho ao carregar a página
document.addEventListener('DOMContentLoaded', updateCartCount);
