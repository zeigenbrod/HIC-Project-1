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

 // deals page feedback
document.querySelectorAll(".deal-button").forEach(function(button) {
    button.addEventListener("click", function() {
        const dealName = button.dataset.deal;

        const messageId = dealName === "Pizza Night"
            ? "pizza-night-message"
            : "lunch-special-message";

        const message = document.getElementById(messageId);

        if (message) {
            // Cancel the previous fade timer.
            if (message.fadeTimer) {
                clearTimeout(message.fadeTimer);
            }

            // Show the confirmation.
            message.textContent =
                dealName + " selected! Explore the menu or check your cart to continue your order.";

            message.classList.add("show");

            // Fade after 0.8 seconds without another click.
            message.fadeTimer = setTimeout(function() {
                message.classList.remove("show");
            }, 2000);
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

    const messageId = name.toLowerCase().includes("margherita") ? "margherita-message" : "pepperoni-message";
    const message = document.getElementById(messageId);
    if(message){
        if(message.fadeTimer){
            clearTimeout(message.fadeTimer);
        }
        message.classList.add("show");
        message.textContent = name + " added to your cart!";
        message.fadeTimer = setTimeout(function() {
            message.classList.remove("show");
        }, 900);
    }
}

