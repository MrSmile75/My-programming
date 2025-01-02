const products =[
    {
        id:1,
        title:"Autumn Hoodie",
        price: 264.9,
        image:
        ""
    }

    {
        id:2,
        title:"Autumn Hoodie",
        price: 264.9,
        image:
        ""
    }

    {
        id:3,
        title:"Autumn Hoodie",
        price: 264.9,
        image:
        ""
    }

    {
        id:4,
        title:"Autumn Hoodie",
        price: 264.9,
        image:
        ""
    }

    {
        id:5,
        title:"Autumn Hoodie",
        price: 264.9,
        image:
        ""
    }
];


//Get the product list and element
const productList = document.getElementById('productList')
const cartItemsElement = document.getElementById('cartItems')
const cartTotalElement = document.getElementById('cartTotal')


//store Cart items in local storge
let cart = JSON.parse(localStorage.getItem("cart"))|| [];

//render product on page
function renderProduct(){
    productList.innerHTML= products
    .map(
        (product) =>`
        <div class="products">
                <img src="${product.img}" alt="${product.title}" class="products-img">
                <div class="product-info">
                    <h2 class="product-title">${product.title}</h2>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <a  class="add-to-cart" data-id="${product.id}">Add to carts</a>
                </div>
            </div>
        `
        
    )

    .join("")

    //add to cart
    const addToCartButtons = document.getElementsByClassName('add-to-cart');
    for(=let i =0; i < addToCartButtons.length; i++) _{
        const addToCartButton = addToCartButtons[i];
        addToCartButton.addEventLister('click',addToCart);
    }


}


//ADD TO CART
function addToCart(event){
    const productID = parseInt(event.target.dataset.id);
    const product = products.find((product) => product.id === productID)

    if (product) {
        //if product in cart
        const exixtingItem = cart.find((item) => item.id === productID);

        if(exixtingItem) {
            exixtingItem.quantity++;
        }else {
            const cartItem ={
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1,
            };
            cart.push(cartItem);
        }

        //change add to cart text to added
        event.target.textContent ="Added";
        updateCartIcon();
        renderCartItems();
        SaveToLocalStorage();
        calculateCartTotal();
        
    }
}


//remove from cart
function removeFromCart(event) {
    const productID = parseInt(event.target.dataset.id);
    cart = cart.filter((items) => item.id !== productID);
    SaveToLocalStorage();
    renderCartItems();
    calculateCartTotal();
    updateCartIcon();
}

//quantity change
function changeQuantity(event) {
    const productID = parseInt(event.target.dataset.id);
    const quantity = parseInt(event.target.value);

    if(quantity > 0) {
        const cartItem = cart.find((item) => item.id === productID);
        if(cartItem) {
            cartItem.quantity = quantity;
            SaveToLocalStorage();
            calculateCartTotal();
            updateCartIcon();
        }
    }
}

//SaveToLocalStorage
function SaveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

//render products on cart page
function renderCartItems(){
    cartItemsElement.innerHTML =cart
    .map(
    (item)=>`
      <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        <h2 class="cart-item-title">${item.title}</h2>
                        <input 
                        class="cart-item-quantity" 
                        type="number" 
                        name="" 
                        min="1" 
                        value="${item.quantity}"    
                        data-id="${item.id}"
                        />
                    </div>
                    <h2 class="cart-item-price">$${item.price}</h2>
                    <button class="remove-from-cart" data-id="${item.id}">Remove</button>
                    
                  </div>  

    `
    )
    .join("");
    //remove from cart
    const removeButtons = document.getElementsByClassName('remove-from-cart');
    for(=let i =0; i < removeButtons.length; i++) _{
        const removeButton = removeButtons[i];
        removeButton.addEventLister('click',removeFromCart);
    }

    //quantity change
    const quantityInputs = document.querySelectorAll(".cart-item-quantity");
    quantityInputs.forEach((input) => {
        input.addEventListener("change", changeQuantity);

    });

}

//calculate total
function calculateCartTotal(){
    const total = cart.reduce((sum,item) => sum + item.price * item.quantity,0);
    cartTotalElement.textContent = `Total:$${total.toFixed(2)}`;

}

//check if on cart page
if(window.location.pathname.includes("cart.html")) {
    renderCartItems();
    calculateCartTotal();

} else{
    renderProducts();
}

//CART ICON QUANTITY
const cartIcon = document.getElementById("cart-icon");

function updateCartIcon() {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity,0);
    cartIcon.setAttribute("data-quantity", totalQuantity);
}

updateCartIcon();

function updateCartIconOnCartChange() {
    updateCartIcon();
}

window.addEventListener("storage", updateCartIconOnCartChange);

function updateCartIcon() {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity,0);
    const cartIcon = document.getElementById("cart-icon");
    cartIcon.setAttribute("data-quantity", totalQuantity);
}


renderProducts();
renderCartItems();
calculateCartTotal();
