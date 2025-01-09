document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cart-container");
    const subtotalElement = document.getElementById("subtotal");
    const totalElement = document.getElementById("total");
    const checkoutButton = document.querySelector(".checkout-btn");

    let cartData = [];

    
    function loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem("cartData");
        return savedCart ? JSON.parse(savedCart) : [];
    }

   
    function saveCartToLocalStorage() {
        localStorage.setItem("cartData", JSON.stringify(cartData));
    }

    async function fetchCartData() {
        cartData = loadCartFromLocalStorage();

        console.log('cartDataFromLocalStorage',cartData)

        if (cartData.length === 0) {
            try {
                const response = await fetch("https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889");
                const data = await response.json(); 
                cartData = data.items;
                console.log('cartDataFromAPI',response.json())
                saveCartToLocalStorage();
            } catch (error) {
                console.error("Error fetching cart data:", error);
            }
        }

        renderCartItems();
    }

    
    function renderCartItems() {
        cartContainer.innerHTML = "";
        let subtotal = 0;

        cartData.forEach((item, index) => {
            
            const itemTotal = (item.discounted_price / 100) * item.quantity; 
            subtotal += itemTotal;

            
            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="details">
                    <h3>${item.title}</h3>
                    <p>Price: ₹${(item.discounted_price / 100).toFixed(2)}</p> <!-- Display discounted price -->
                    <input type="number" value="${item.quantity}" min="1" data-index="${index}">
                </div>
                <div class="subtotal">₹${itemTotal.toFixed(2)}</div>
                <button class="remove-item" data-index="${index}">🗑️</button>
            `;
            cartContainer.appendChild(cartItem);
        });


        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        totalElement.textContent = `₹${subtotal.toFixed(2)}`;
        saveCartToLocalStorage(); 
        addEventListeners();
    }


    function addEventListeners() {
        
        const quantityInputs = document.querySelectorAll(".cart-item input");
        quantityInputs.forEach(input => {
            input.addEventListener("change", (e) => {
                const index = e.target.dataset.index;
                const newQuantity = parseInt(e.target.value);
                if (newQuantity > 0) {
                    cartData[index].quantity = newQuantity;
                    renderCartItems();
                } else {
                    alert("Quantity must be at least 1.");
                    e.target.value = cartData[index].quantity; 
                }
            });
        });

        const removeButtons = document.querySelectorAll(".cart-item .remove-item");
        removeButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                if (confirm("Are you sure you want to remove this item from your cart?")) {
                    cartData.splice(index, 1);
                    renderCartItems();
                }
            });
        });


        checkoutButton.addEventListener("click", () => {
            if (cartData.length === 0) {
                alert("Your cart is empty!");
            } else {
                alert("Proceeding to checkout...");
                
            }
        });
    }

    fetchCartData();
});
