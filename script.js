console.log("Kent Pizza is ready");


const accountForm = document.querySelector("#account-form");

if (accountForm) {
    accountForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const message = document.querySelector("#account-message");
        message.textContent = "Demo sign-in complete!";

        accountForm.reset();
    });
}


//Customize page functions

function getPizzaDetails() {
    const size = document.getElementById("pizzaSize").value;
    const crust = document.getElementById("pizzaCrust").value;

    const sizePrices = { small: 8.99, medium: 12.99, large: 15.99
    };

    const crustPrices = { thin: 0, regular: 0, stuffed: 2
    };

    let toppings = [];
    let toppingPrice = 0;

    //topping adding functionality

    document.querySelectorAll('input[name="toppings"]:checked')
        .forEach(function (topping) {
            toppings.push(topping.value);
            toppingPrice += Number(topping.dataset.price || 0);
        });

    const total = (sizePrices[size] || 8.99) + (crustPrices[crust] || 0) + toppingPrice;

    return {
        size: size,
        crust: crust,
        toppings: toppings,
        price: total
    };
}

// Update the pizza description and price
function updatePizzaSummary() {
    const pizza = getPizzaDetails();

    const summary = document.getElementById("pizzaSummary");
    const price = document.getElementById("pizzaPrice");

    if (summary) {
        summary.textContent =
            pizza.size.charAt(0).toUpperCase() + pizza.size.slice(1) +
            " pizza with " + pizza.crust + " crust" +
            (pizza.toppings.length
                ? " and " + pizza.toppings.join(", ")
                : "");
    }

    if (price) {
        price.textContent = "Total: " + money(pizza.price);
    }
}

// Reset pizza to default
function undoPizza() {
    document.getElementById("pizzaSize").value = "small";
    document.getElementById("pizzaCrust").value = "thin";

    document.querySelectorAll('input[name="toppings"]')
        .forEach(function (topping) {
            topping.checked = false;
        });

    updatePizzaSummary();

    const message = document.getElementById("message");
    if (message) {
        message.textContent = "Pizza options have been reset.";
    }
}

function addPizzaToCart() {
    const pizza = getPizzaDetails();
    const cart = getCart();

    saveCartUndo();

    cart.push(pizza);
    saveCart(cart);

    const message = document.getElementById("message");
    if (message) {
        message.textContent = "Pizza added to your cart!";
    }
}

// Update pizza price when an option changes
document.addEventListener("change", function (event) {
    if (event.target.id === "pizzaSize" || event.target.id === "pizzaCrust" || event.target.name === "toppings") {
        updatePizzaSummary();
    }
});


 // Cart functions

function getCart() {
    return JSON.parse(localStorage.getItem("kentPizzaCart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("kentPizzaCart", JSON.stringify(cart));
}

function money(amount) {
    return "$" + Number(amount).toFixed(2);
}

function saveCartUndo() {
    sessionStorage.setItem("previousCart", JSON.stringify(getCart()));
}


// Display cart items and totals
function renderCart() {
    const cartItems = document.getElementById("cartItems");

    if(!cartItems){
        return;
    }

    const cart = getCart();
    cartItems.innerHTML = "";

    let subtotal = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    }

    for (let i = 0; i < cart.length; i++) {
        let pizza = cart[i];
        subtotal += pizza.price;

        cartItems.innerHTML +=
            "<div class='cart-item'>" +
            "<h4>" + (pizza.name || (pizza.size + " Pizza")) + "</h4>" +
            "<p>Crust: " + pizza.crust + "</p>" +
            "<p>Toppings: " + (pizza.toppings.length > 0
                ? pizza.toppings.join(", ")
                : "None") + "</p>" +
            "<p>Price: " + money(pizza.price) + "</p>" +
            "<button onclick='removePizza(" + i + ")'>Remove</button>" +
            "</div>";
    }

    let tax = subtotal * 0.0675;
    let total = subtotal + tax;

    document.getElementById("subtotal").textContent =
        "Subtotal: " + money(subtotal);

    document.getElementById("tax").textContent =
        "Tax: " + money(tax);

    document.getElementById("total").textContent =
        "Total: " + money(total);
}

// Remove a pizza
function removePizza(index) {
    let cart = getCart();
    saveCartUndo();
    cart.splice(index, 1);
    saveCart(cart);

    renderCart();
}

// Clear the cart
function clearCart() {
    saveCartUndo();
    saveCart([]);

    renderCart();
}

// Undo the last cart action
function undoCartAction() {
    let previousCart = sessionStorage.getItem("previousCart");

    if (previousCart) {
        saveCart(JSON.parse(previousCart));
        sessionStorage.removeItem("previousCart");
        renderCart();
    } else {
        alert("Nothing to undo.");
    }
}


 //load cart and initialize page features
document.addEventListener("DOMContentLoaded", function () {
    renderCart();
    const sizeSelect = document.getElementById("pizzaSize");
    //only run the preset logic on the customization page
    if (sizeSelect) {
        const params = new URLSearchParams(window.location.search);
        const pizzaType = params.get("pizza");
        //default specialty pizzas to medium
        if (pizzaType === "margherita" || pizzaType === "pepperoni") {
            sizeSelect.value = "medium";
            document.getElementById("pizzaCrust").value = "regular";
        }
        //preset toppings for each specialty pizza
        const presets = {
            margherita: ["tomatoes", "basil"],
            pepperoni: ["pepperoni"]
        };
        if (presets[pizzaType]) {
            document.querySelectorAll('input[name="toppings"]').forEach(function (topping) {
                topping.checked = presets[pizzaType].includes(topping.value);
            });
        }
        //update the displayed price and summary
        updatePizzaSummary();
    }
});


// deals page feedback
document.querySelectorAll(".deal-button").forEach(function(button){
    button.addEventListener("click", function() {
        const message = document.getElementById("deal-message");
        const dealName = button.dataset.deal;

        if(message){
            message.textContent = dealName + " selected! Explore the menu to contine your order";
        }
    });
});

function addSpecialityPizza(name, toppings, price){
    const cart = getCart();

    saveCartUndo();

    cart.push({
        name: name,
        size: "medium",
        crust: "regular",
        toppings: toppings,
        price: price
    });

    saveCart(cart);
    const message = document.getElementById("menu-message");
    if(message){
        message.textContent = name + " added to your cart!";
    }
}

// Checkout page functions

// Show order items and totals
function renderCheckout() {
    const checkoutSummary = document.getElementById("checkoutSummary");

    if (!checkoutSummary) {
        return;
    }

    const cart = getCart();
    checkoutSummary.innerHTML = "";

    let subtotal = 0;

    if (cart.length === 0) {
        checkoutSummary.innerHTML = "<p>Your cart is empty.</p>";
    }

    for (let i = 0; i < cart.length; i++) {
        let pizza = cart[i];
        subtotal += pizza.price;

        checkoutSummary.innerHTML +=
            "<div class='cart-item'>" +
            "<h4>" + (pizza.name || (pizza.size + " Pizza")) + "</h4>" +
            "<p>Crust: " + pizza.crust + "</p>" +
            "<p>Toppings: " + (pizza.toppings.length > 0
                ? pizza.toppings.join(", ")
                : "None") + "</p>" +
            "<p>Price: " + money(pizza.price) + "</p>" +
            "</div>";
    }

    let tax = subtotal * 0.0675;
    let total = subtotal + tax;

    document.getElementById("subtotal").textContent =
        "Subtotal: " + money(subtotal);

    document.getElementById("tax").textContent =
        "Tax: " + money(tax);

    document.getElementById("total").textContent =
        "Total: " + money(total);
}

// Place the order and clear the cart
function placeOrder(event) {
    event.preventDefault();
 
    const message = document.getElementById("message");
    const cart = getCart();
 
    if (cart.length === 0) {
        message.textContent = "Your cart is empty.";
        return;
    }
 
    let subtotal = 0;
 
    for (let i = 0; i < cart.length; i++) {
        subtotal += cart[i].price;
    }
 
    let tax = subtotal * 0.0675;
 
    const order = {
        number: Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        name: document.getElementById("name").value,
        address: document.getElementById("address").value + ", " + document.getElementById("city").value,
        items: cart,
        subtotal: subtotal,
        tax: tax,
        total: subtotal + tax
    };
 
    localStorage.setItem("kentPizzaOrder", JSON.stringify(order));
 
    saveCart([]);
    sessionStorage.removeItem("previousCart");
 
    window.location.href = "confirmation.html";
}
 
const checkoutForm = document.getElementById("checkoutForm");
 
if (checkoutForm) {
    checkoutForm.addEventListener("submit", placeOrder);
    renderCheckout();
}

// Confirmation page functions
 
// Show the saved order details
function renderConfirmation() {
    const confirmedItems = document.getElementById("confirmedItems");
 
    if (!confirmedItems) {
        return;
    }
 
    const order = JSON.parse(localStorage.getItem("kentPizzaOrder"));
 
    if (!order) {
        confirmedItems.innerHTML = "<p>No recent order found.</p>";
        return;
    }
 
    document.getElementById("orderNumber").textContent =
        "Order Number: " + order.number;
 
    document.getElementById("orderDate").textContent =
        "Order Date: " + order.date;
 
    confirmedItems.innerHTML = "";
 
    for (let i = 0; i < order.items.length; i++) {
        let pizza = order.items[i];
 
        confirmedItems.innerHTML +=
            "<div class='cart-item'>" +
            "<h4>" + (pizza.name || (pizza.size + " Pizza")) + "</h4>" +
            "<p>Crust: " + pizza.crust + "</p>" +
            "<p>Toppings: " + (pizza.toppings.length > 0
                ? pizza.toppings.join(", ")
                : "None") + "</p>" +
            "<p>Price: " + money(pizza.price) + "</p>" +
            "</div>";
    }
 
    document.getElementById("deliveryName").textContent =
        "Name: " + order.name;
 
    document.getElementById("deliveryAddress").textContent =
        "Address: " + order.address;
 
    document.getElementById("confirmedSubtotal").textContent =
        "Subtotal: " + money(order.subtotal);
 
    document.getElementById("confirmedTax").textContent =
        "Tax: " + money(order.tax);
 
    document.getElementById("confirmedTotal").textContent =
        "Total: " + money(order.total);
}
 
renderConfirmation();
 

// Tracking page functions
 
// Show the saved order number and total
function renderTracking() {
    const orderNumber = document.getElementById("orderNumber");
 
    if (!orderNumber) {
        return;
    }
 
    const order = JSON.parse(localStorage.getItem("kentPizzaOrder"));
 
    if (!order) {
        orderNumber.textContent = "Order Number: No recent order found";
 
        document.getElementById("orderStatus").textContent =
            "Status: No order to track";
 
        document.getElementById("estimatedDelivery").textContent =
            "Estimated Delivery: N/A";
 
        return;
    }
 
    orderNumber.textContent = "Order Number: " + order.number;
 
    document.getElementById("trackingTotal").textContent =
        "Total: " + money(order.total);
}
 
renderTracking();