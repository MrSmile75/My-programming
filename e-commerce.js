    /* © SMILEX - This code is licensed and protected. */
class AdvancedPreloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.initParticles();
        this.setupLoadingSequence();
    }

        /* © SMILEX - This code is licensed and protected. */

    initParticles() {
        for (let i = 0; i < 50; i++) {
            this.createParticle();
        }
    }

        /* © SMILEX - This code is licensed and protected. */

    createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        particle.style.left = `${Math.random() * window.innerWidth}px`;
        particle.style.top = `${Math.random() * window.innerHeight}px`;
        particle.style.animationDuration = `${Math.random() * 2 + 1}s`;
        particle.style.animationDelay = `${Math.random() * 2}s`;

        this.preloader.appendChild(particle);
    }

    setupLoadingSequence() {
        const loadingStages = [
            { stage: 'Initializing Core Systems', duration: 1500 },
            { stage: 'Loading Resources', duration: 1500 },
            { stage: 'Preparing Interface', duration: 1500 },
            { stage: 'Finalizing', duration: 1500 }
        ];

        this.sequentialLoading(loadingStages);
    }

        /* © SMILEX - This code is licensed and protected. */

    sequentialLoading(stages) {
        const loadingText = document.querySelector('.loading-text');
        
        stages.reduce((promise, stage) => {
            return promise.then(() => {
                return new Promise(resolve => {
                    loadingText.textContent = stage.stage;
                    setTimeout(resolve, stage.duration);
                });
            });
        }, Promise.resolve()).then(() => {
            this.completeLoading();
        });
    }

        /* © SMILEX - This code is licensed and protected. */

    completeLoading() {
        this.preloader.style.opacity = 0;
        setTimeout(() => {
            this.preloader.style.display = 'none';
            this.triggerMainAppLoad();
        }, 5000);
    }

    triggerMainAppLoad() {
        // Trigger main application initialization
        document.dispatchEvent(new Event('app-ready'));
    }
}
    /* © SMILEX - This code is licensed and protected. */

// Initialize Preloader
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedPreloader();
});

// Main App Initialization
document.addEventListener('app-ready', () => {
    // Your main application initialization code here
    console.log('Application is now ready to use');
});


 // Cart Management Class
 class CartManager {
    constructor() {
        this.cart = [];
        this.loadCartFromLocalStorage();
    }

    addToCart(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            this.cart.push({
                ...item,
                quantity: 1
            });
        }

        this.saveCartToLocalStorage();
        this.updateCartUI();
        this.showNotification(`${item.itemName} added to cart!`);
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCartToLocalStorage();
        this.updateCartUI();
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity = quantity > 0 ? quantity : 1;
            this.saveCartToLocalStorage();
            this.updateCartUI();
        }
    }

    calculateTotal() {
        return this.cart.reduce((total, item) => 
            total + (parseFloat(item.itemPrice) * item.quantity), 0
        ).toFixed(2);
    }

    saveCartToLocalStorage() {
        localStorage.setItem('marketplaceCart', JSON.stringify(this.cart));
    }

    loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('marketplaceCart');
        this.cart = savedCart ? JSON.parse(savedCart) : [];
        this.updateCartUI();
    }

    updateCartUI() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');
        const cartItemCountElement = document.getElementById('cartItemCount');

        // Clear existing cart items
        cartItemsContainer.innerHTML = '';

        // Populate cart items
        this.cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item d-flex justify-content-between align-items-center mb-2';
            cartItemElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.imageUrl}" class="img-thumbnail me-2">
                    <div>
                        <h6 class="mb-0">${item.itemName}</h6>
                        <small>${item.currency} ${item.itemPrice}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <input type="number" 
                           class="form-control form-control-sm" 
                           value="${item.quantity}" 
                           min="1" 
                           style="width: 70px;"
                           onchange="cartManager.updateQuantity(${item.id}, this.value)">
                    <button class="btn btn-danger btn-sm ms-2" 
                            onclick="cartManager.removeFromCart(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });

        // Update total and item count
        cartTotalElement.textContent = `$${this.calculateTotal()}`;
        cartItemCountElement.textContent = this.cart.length;
    }

    showNotification(message) {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `alert alert-success notification`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => container.removeChild(notification), 300);
        }, 3000);
    }
}



// Marketplace Manager Class
class MarketplaceManager {
    constructor() {
        this.items = [];
        this.categories = ['Electronics', 'Fashion', 'Home', 'Sports'];
        this.selectedCategory = null;
        this.loadItemsFromLocalStorage();
    }

    addItem(itemData) {
        const newItem = {
            id: Date.now(),
            ...itemData,
            createdAt: new Date()
        };
        this.items.push(newItem);
        this.saveItemsToLocalStorage();
        this.renderItems();
        this.showNotification('Item listed successfully!');
        return newItem;
    }

    renderItems(filteredItems = null) {
        const container = document.getElementById('itemsContainer');
        container.innerHTML = '';

        const itemsToRender = filteredItems || this.items;

        if (itemsToRender.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No items found</p>
                </div>
            `;
            return;
        }

        itemsToRender.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'col-md-4';
            itemCard.innerHTML = `
                <div class="card item-card h-100">
                    <img src="${item.imageUrl}" class="card-img-top" alt="${item.itemName}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${item.itemName}</h5>
                        <p class="card-text">${item.itemDescription.substring(0, 100)}${item.itemDescription.length > 100 ? '...' : ''}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary">${item.category}</span>
                            <strong>${item.currency} ${item.itemPrice}</strong>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span class="badge bg-secondary">Condition: ${item.itemCondition}</span>
                            <button class="btn btn-success btn-sm" onclick="marketplaceManager.addToCart(${item.id})">
                                <i class="bi bi-cart-plus me-1"></i>Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(itemCard);
        });
    }

    addToCart(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            cartManager.addToCart(item);
        }
    }

    saveItemsToLocalStorage() {
        localStorage.setItem('marketplaceItems', JSON.stringify(this.items));
    }

    loadItemsFromLocalStorage() {
        const savedItems = localStorage.getItem('marketplaceItems');
        this.items = savedItems ? JSON.parse(savedItems) : [];
        this.renderItems();
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => container.removeChild(notification), 300);
        }, 3000);
    }
}

// Global Instances
const cartManager = new CartManager();
const marketplaceManager = new MarketplaceManager();

// Page Navigation Functions
function showSellPage() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('sellPage').style.display = 'block';
    document.getElementById('buyPage').style.display = 'none';
}

function showBuyPage() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('sellPage').style.display = 'none';
    document.getElementById('buyPage').style.display = 'block';
    marketplaceManager.renderItems();
}

// Category Selection
function selectCategory(category) {
    marketplaceManager.selectedCategory = category;
    marketplaceManager.showNotification(`Selected Category: ${category}`);
}

// Search and Filter Functions
function searchItems() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const filteredItems = marketplaceManager.items.filter(item => 
        item.itemName.toLowerCase().includes(searchQuery) ||
        item.itemDescription.toLowerCase().includes(searchQuery)
    );
    marketplaceManager.renderItems(filteredItems);
}

function filterItems(category) {
    const filteredItems = marketplaceManager.items.filter(item => 
        item.category === category
    );
    marketplaceManager.renderItems(filteredItems);
}

function applyPriceFilter() {
    const minPrice = document.getElementById('minPriceFilter').value;
    const maxPrice = document.getElementById('maxPriceFilter').value;

    const filteredItems = marketplaceManager.items.filter(item => {
        const price = parseFloat(item.itemPrice);
        return (!minPrice || price >= parseFloat(minPrice)) && 
               (!maxPrice || price <= parseFloat(maxPrice));
    });

    marketplaceManager.renderItems(filteredItems);
}

// Checkout Function
function checkoutCart() {
    if (cartManager.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Simulate checkout process
    alert(`Checkout successful! Total: $${cartManager.calculateTotal()}`);
    
    // Clear cart
    cartManager.cart = [];
    cartManager.saveCartToLocalStorage();
    cartManager.updateCartUI();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const sellForm = document.getElementById('sellForm');
    
    sellForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(sellForm);
        
        const imageFile = formData.get('itemImage');
        const imageUrl = imageFile && imageFile.size > 0 
            ? URL.createObjectURL(imageFile) 
            : 'https://via.placeholder.com/300x200?text=No+Image';

        const itemData = {
            itemName: formData.get('itemName'),
            itemPrice: formData.get('itemPrice'),
            currency: formData.get('currency'),
            itemDescription: formData.get('itemDescription'),
            imageUrl: imageUrl,
            category: marketplaceManager.selectedCategory || 'Uncategorized',
            itemCondition: formData.get('itemCondition')
        };

        marketplaceManager.addItem(itemData);
        sellForm.reset();
    });
});



 document.addEventListener('DOMContentLoaded', () => {
            const rulesPopup = document.getElementById('rules-popup');
            const proceedBtn = document.getElementById('proceed-btn');
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');

            // Check if user has previously accepted terms
            function hasAcceptedTerms() {
                return localStorage.getItem('termsAccepted') === 'true';
            }

            // Show popup function
            function showRulesPopup() {
                if (!hasAcceptedTerms()) {
                    rulesPopup.classList.add('show');
                }
            }

            // Hide popup function
            function hideRulesPopup() {
                rulesPopup.classList.remove('show');
            }

            // Check if all checkboxes are checked
            function checkAllChecked() {
                const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
                proceedBtn.disabled = !allChecked;
            }

            // Add event listeners to checkboxes
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', checkAllChecked);
            });

            // Proceed button click handler
            proceedBtn.addEventListener('click', () => {
                if (!proceedBtn.disabled) {
                    // Store acceptance in local storage
                    localStorage.setItem('termsAccepted', 'true');
                    
                    // Hide popup
                    hideRulesPopup();
                    
                    // Add your proceed logic here
                    alert('Welcome!');
                }
            });

            // Show popup on page load if terms not accepted
            showRulesPopup();
        });



                document.addEventListener('DOMContentLoaded', () => {
            const popup = document.querySelector('.seller-popup-overlay');
            const proceedBtn = document.querySelector('.seller-proceed-btn');
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');

            // Show popup
            function showPopup() {
                popup.classList.add('show');
            }

            // Hide popup
            function hidePopup() {
                popup.classList.remove('show');
            }

            // Check checkbox status
            function checkCheckboxStatus() {
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                proceedBtn.disabled = !allChecked;
            }

            // Add event listeners to checkboxes
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', checkCheckboxStatus);
            });

            // Proceed button handler
            proceedBtn.addEventListener('click', () => {
                if (!proceedBtn.disabled) {
                    hidePopup();
                    // Add your proceed logic here
                    alert('Welcome to our seller platform!');
                }
            });

            // Show popup on load
            showPopup();
        });


    /* © SMILEX - This code is licensed and protected. */