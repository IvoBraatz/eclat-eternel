// Carregar itens do carrinho
function loadCart() {
    fetch('/api/cart')
        .then(response => response.json())
        .then(cartItems => {
            const cartItemsContainer = document.getElementById('cart-items');
            let total = 0;
            cartItemsContainer.innerHTML = '';

            if (cartItems.length === 0) {
                // Exibe uma mensagem se o carrinho estiver vazio
                cartItemsContainer.innerHTML = '<tr><td colspan="5" class="text-center">Seu carrinho está vazio.</td></tr>';
            } else {
                cartItems.forEach(item => {
                    const subtotal = item.price * item.quantity;
                    total += subtotal;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>R$ ${item.price.toFixed(2)}</td>
                        <td>R$ ${subtotal.toFixed(2)}</td>
                        <td><button onclick="removeFromCart(${item.id})" class="btn btn-danger btn-sm">Remover</button></td>
                    `;
                    cartItemsContainer.appendChild(row);
                });
            }

            document.getElementById('cart-total').innerText = `R$ ${total.toFixed(2)}`;
        })
        .catch(error => console.error('Erro ao carregar o carrinho:', error));
}

// Função para exibir o modal com mensagem personalizada
function showModal(message) {
    const modalTitle = document.getElementById('alertModalLabel');
    const modalBody = document.getElementById('alertModalBody');

    modalTitle.textContent = "Notificação";
    modalBody.textContent = message;

    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    alertModal.show();
}

// Função para remover item do carrinho
function removeFromCart(productId) {
    fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
    })
    .then(() => {
        showModal("Produto removido do carrinho"); // Mostra o modal ao remover
        loadCart();
        updateCartCount(); // Atualiza o contador no header
    })
    .catch(error => console.error('Erro ao remover do carrinho:', error));
}

// Carregar o carrinho ao iniciar a página
document.addEventListener('DOMContentLoaded', loadCart);
