document.addEventListener('DOMContentLoaded', () => {
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const categoryFilter = document.getElementById('categoryFilter');
    const productCards = document.querySelectorAll('.product-card');
  
    priceRange.addEventListener('input', function() {
      priceValue.textContent = `R$ ${this.value}`;
      filterProducts();
    });
  
    categoryFilter.addEventListener('change', filterProducts);
  
    function filterProducts() {
      const selectedCategory = categoryFilter.value;
      const selectedPrice = priceRange.value;
  
      productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardPrice = parseInt(card.getAttribute('data-price'), 10);
  
        if ((selectedCategory === 'todos' || cardCategory === selectedCategory) && cardPrice <= selectedPrice) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  });
  