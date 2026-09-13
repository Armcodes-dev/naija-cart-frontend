// ============================================================
// NAIJACART — cart.js
// Handles:
// - Add to cart
// - Remove from cart
// - Increase quantity
// - Decrease quantity
// - Cart sidebar
// - Cart totals
// - Account-specific cart
// - Save cart in localStorage
// - Checkout
// - Payment method selection
// - Paystack payment
// - Paystack payment verification
// - Order creation after successful payment
// ============================================================


// ============================================================
// PAYSTACK TEST CONFIGURATION
// ============================================================

const PAYSTACK_PUBLIC_KEY =
    "pk_test_e2d1c3b611a9aa14c8196ef2449fe6642530be21";


// ============================================================
// CART STORAGE
// ============================================================

const CART_STORAGE_PREFIX =
    "naijacart_cart_";


// ============================================================
// PAYSTACK SESSION STORAGE KEYS
// ============================================================

const PAYSTACK_REFERENCE_KEY =
    "naijaCartPaystackReference";

const PAYSTACK_PENDING_ORDER_KEY =
    "naijaCartPendingOrder";


// ============================================================
// API BASE URL
// ============================================================

const CART_API_BASE_URL =
    "http://127.0.0.1:5000/api";


// ============================================================
// GET CURRENT LOGGED-IN USER
// ============================================================

function getCartUser() {

    const savedUser =
        localStorage.getItem("naijaCartUser");

    if (!savedUser) {

        return null;

    }

    try {

        return JSON.parse(savedUser);

    }

    catch (error) {

        console.error(
            "Could not read current cart user:",
            error
        );

        return null;

    }

}


// ============================================================
// GET USER CART STORAGE KEY
// ============================================================

function getCartStorageKey() {

    const user =
        getCartUser();

    if (!user) {

        return null;

    }

    if (user.customer_id) {

        return (
            CART_STORAGE_PREFIX +
            "customer_" +
            user.customer_id
        );

    }

    if (user.user_id) {

        return (
            CART_STORAGE_PREFIX +
            "user_" +
            user.user_id
        );

    }

    if (user.id) {

        return (
            CART_STORAGE_PREFIX +
            "user_" +
            user.id
        );

    }

    if (user.email) {

        return (
            CART_STORAGE_PREFIX +
            "email_" +
            encodeURIComponent(
                user.email.toLowerCase()
            )
        );

    }

    return null;

}


// ============================================================
// LOAD CART FOR CURRENT USER
// ============================================================

function loadCartForCurrentUser() {

    const storageKey =
        getCartStorageKey();

    if (!storageKey) {

        return [];

    }

    const savedCart =
        localStorage.getItem(storageKey);

    if (!savedCart) {

        return [];

    }

    try {

        const parsedCart =
            JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) {

            return [];

        }

        return parsedCart;

    }

    catch (error) {

        console.error(
            "Could not load saved cart:",
            error
        );

        localStorage.removeItem(
            storageKey
        );

        return [];

    }

}


// ============================================================
// CART DATA
// ============================================================

let cart =
    loadCartForCurrentUser();


// ============================================================
// TRACK CURRENT CART USER
// ============================================================

let currentCartStorageKey =
    getCartStorageKey();


// ============================================================
// SYNCHRONIZE CART WITH CURRENT ACCOUNT
// ============================================================

function syncCartWithCurrentUser() {

    const newStorageKey =
        getCartStorageKey();

    if (
        newStorageKey ===
        currentCartStorageKey
    ) {

        return;

    }

    currentCartStorageKey =
        newStorageKey;

    cart =
        loadCartForCurrentUser();

    updateCartDisplayOnly();

}


// ============================================================
// CART ELEMENTS
// ============================================================

const cartButton =
    document.getElementById("cartButton");

const cartSidebar =
    document.getElementById("cartSidebar");

const cartClose =
    document.getElementById("cartClose");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartItemCount =
    document.getElementById("cartItemCount");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartDelivery =
    document.getElementById("cartDelivery");

const cartTotal =
    document.getElementById("cartTotal");

const cartShoppingButton =
    document.getElementById("cartShoppingButton");

const checkoutButton =
    document.getElementById("checkoutButton");


// ============================================================
// FORMAT PRICE
// ============================================================

function formatCartPrice(price) {

    return (
        "₦" +
        Number(price).toLocaleString("en-NG")
    );

}


// ============================================================
// OPEN CART
// ============================================================

function openCart() {

    syncCartWithCurrentUser();

    if (!cartSidebar) {

        return;

    }

    if (!getCartStorageKey()) {

        alert(
            "Please sign in before using your cart."
        );

        return;

    }

    cartSidebar.classList.add("open");

    cartSidebar.setAttribute(
        "aria-hidden",
        "false"
    );

}


// ============================================================
// CLOSE CART
// ============================================================

function closeCart() {

    if (!cartSidebar) {

        return;

    }

    cartSidebar.classList.remove("open");

    cartSidebar.setAttribute(
        "aria-hidden",
        "true"
    );

}


// ============================================================
// ADD PRODUCT TO CART
// ============================================================

function addToCart(productId) {

    syncCartWithCurrentUser();

    const storageKey =
        getCartStorageKey();

    if (!storageKey) {

        alert(
            "Please sign in before adding products to your cart."
        );

        return;

    }

    if (
        typeof products === "undefined" ||
        !Array.isArray(products)
    ) {

        console.error(
            "Products are not available."
        );

        return;

    }

    const product =
        products.find(function (item) {

            return (
                Number(item.id) ===
                Number(productId)
            );

        });

    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;

    }

    const existingItem =
        cart.find(function (item) {

            return (
                Number(item.id) ===
                Number(productId)
            );

        });


    // --------------------------------------------------------
    // PRODUCT ALREADY IN CART
    // --------------------------------------------------------

    if (existingItem) {

        if (
            Number(existingItem.quantity) <
            Number(product.stock)
        ) {

            existingItem.quantity++;

        }

        else {

            alert(
                "You cannot add more than the available stock."
            );

            return;

        }

    }


    // --------------------------------------------------------
    // NEW PRODUCT
    // --------------------------------------------------------

    else {

        if (
            Number(product.stock) <= 0
        ) {

            alert(
                "This product is out of stock."
            );

            return;

        }

        cart.push({

            id:
                product.id,

            name:
                product.name,

            price:
                Number(product.price),

            image:
                product.image || "",

            stock:
                Number(product.stock),

            quantity:
                1

        });

    }

    updateCart();

}


// ============================================================
// DISPLAY CART
// ============================================================

function displayCart() {

    if (!cartItems) {

        return;

    }

    cartItems.innerHTML = "";


    // --------------------------------------------------------
    // EMPTY CART
    // --------------------------------------------------------

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🛒
                </div>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some products to your cart.
                </p>

                <button
                    class="continue-shopping"
                    id="emptyContinueShopping"
                    type="button">

                    Continue Shopping

                </button>

            </div>

        `;


        const emptyButton =
            document.getElementById(
                "emptyContinueShopping"
            );


        if (emptyButton) {

            emptyButton.addEventListener(
                "click",
                closeCart
            );

        }

        return;

    }


    // --------------------------------------------------------
    // DISPLAY CART PRODUCTS
    // --------------------------------------------------------

    cart.forEach(function (item) {

        const cartItem =
            document.createElement("div");

        cartItem.classList.add(
            "cart-item"
        );


        cartItem.innerHTML = `

            <div class="cart-item-image">

                <img
                    src="${item.image || ""}"
                    alt="${item.name || "Product"}">

            </div>


            <div class="cart-item-info">

                <h3>
                    ${item.name || "Product"}
                </h3>


                <p class="cart-item-price">
                    ${formatCartPrice(item.price)}
                </p>


                <div class="cart-item-controls">

                    <button
                        class="quantity-button decrease"
                        type="button"
                        data-product-id="${item.id}">

                        −

                    </button>


                    <span class="cart-quantity">
                        ${item.quantity}
                    </span>


                    <button
                        class="quantity-button increase"
                        type="button"
                        data-product-id="${item.id}">

                        +

                    </button>

                </div>


                <button
                    class="remove-cart-item"
                    type="button"
                    data-product-id="${item.id}">

                    Remove

                </button>

            </div>

        `;


        cartItems.appendChild(
            cartItem
        );

    });

}


// ============================================================
// INCREASE QUANTITY
// ============================================================

function increaseQuantity(productId) {

    syncCartWithCurrentUser();

    const item =
        cart.find(function (cartItem) {

            return (
                Number(cartItem.id) ===
                Number(productId)
            );

        });


    if (!item) {

        return;

    }


    if (
        Number(item.quantity) <
        Number(item.stock)
    ) {

        item.quantity++;

    }

    else {

        alert(
            "You cannot add more than the available stock."
        );

        return;

    }

    updateCart();

}


// ============================================================
// DECREASE QUANTITY
// ============================================================

function decreaseQuantity(productId) {

    syncCartWithCurrentUser();

    const item =
        cart.find(function (cartItem) {

            return (
                Number(cartItem.id) ===
                Number(productId)
            );

        });


    if (!item) {

        return;

    }


    item.quantity--;


    if (item.quantity <= 0) {

        cart =
            cart.filter(function (cartItem) {

                return (
                    Number(cartItem.id) !==
                    Number(productId)
                );

            });

    }


    updateCart();

}


// ============================================================
// REMOVE FROM CART
// ============================================================

function removeFromCart(productId) {

    syncCartWithCurrentUser();

    cart =
        cart.filter(function (item) {

            return (
                Number(item.id) !==
                Number(productId)
            );

        });

    updateCart();

}


// ============================================================
// GET TOTAL ITEMS
// ============================================================

function getTotalItems() {

    return cart.reduce(
        function (total, item) {

            return (
                total +
                Number(item.quantity || 0)
            );

        },
        0
    );

}


// ============================================================
// GET SUBTOTAL
// ============================================================

function getSubtotal() {

    return cart.reduce(
        function (total, item) {

            return (
                total +
                (
                    Number(item.price || 0) *
                    Number(item.quantity || 0)
                )
            );

        },
        0
    );

}


// ============================================================
// UPDATE CART DISPLAY ONLY
// ============================================================

function updateCartDisplayOnly() {

    displayCart();


    const totalItems =
        getTotalItems();


    if (cartCount) {

        cartCount.textContent =
            totalItems;

    }


    if (cartItemCount) {

        cartItemCount.textContent =
            totalItems;

    }


    const subtotal =
        getSubtotal();


    if (cartSubtotal) {

        cartSubtotal.textContent =
            formatCartPrice(
                subtotal
            );

    }


    // --------------------------------------------------------
    // DELIVERY
    // --------------------------------------------------------

    let delivery = 0;


    if (subtotal === 0) {

        if (cartDelivery) {

            cartDelivery.textContent =
                "Calculated at checkout";

        }

    }


    else if (subtotal >= 50000) {

        delivery = 0;

        if (cartDelivery) {

            cartDelivery.textContent =
                "FREE";

        }

    }


    else {

        if (cartDelivery) {

            cartDelivery.textContent =
                "Calculated at checkout";

        }

    }


    // --------------------------------------------------------
    // TOTAL
    // --------------------------------------------------------

    const total =
        subtotal + delivery;


    if (cartTotal) {

        cartTotal.textContent =
            formatCartPrice(
                total
            );

    }

}


// ============================================================
// UPDATE CART + SAVE
// ============================================================

function updateCart() {

    syncCartWithCurrentUser();

    const storageKey =
        getCartStorageKey();


    if (storageKey) {

        localStorage.setItem(
            storageKey,
            JSON.stringify(cart)
        );

    }


    updateCartDisplayOnly();

}


// ============================================================
// ADD TO CART BUTTONS
// ============================================================

document.addEventListener(
    "click",
    function (event) {

        const addButton =
            event.target.closest(
                ".add-cart-button"
            );


        if (!addButton) {

            return;

        }


        const productId =
            Number(
                addButton.dataset.productId
            );


        if (!getCartStorageKey()) {

            alert(
                "Please sign in before adding products to your cart."
            );

            return;

        }


        addToCart(productId);


        const originalText =
            addButton.textContent;


        addButton.textContent =
            "Added ✓";


        addButton.disabled =
            true;


        setTimeout(
            function () {

                addButton.textContent =
                    originalText;

                addButton.disabled =
                    false;

            },
            1000
        );

    }
);


// ============================================================
// CART ITEM BUTTONS
// ============================================================

document.addEventListener(
    "click",
    function (event) {


        // ----------------------------------------------------
        // INCREASE
        // ----------------------------------------------------

        const increaseButton =
            event.target.closest(
                ".quantity-button.increase"
            );


        if (increaseButton) {

            const productId =
                Number(
                    increaseButton.dataset.productId
                );


            increaseQuantity(
                productId
            );

            return;

        }


        // ----------------------------------------------------
        // DECREASE
        // ----------------------------------------------------

        const decreaseButton =
            event.target.closest(
                ".quantity-button.decrease"
            );


        if (decreaseButton) {

            const productId =
                Number(
                    decreaseButton.dataset.productId
                );


            decreaseQuantity(
                productId
            );

            return;

        }


        // ----------------------------------------------------
        // REMOVE
        // ----------------------------------------------------

        const removeButton =
            event.target.closest(
                ".remove-cart-item"
            );


        if (removeButton) {

            const productId =
                Number(
                    removeButton.dataset.productId
                );


            removeFromCart(
                productId
            );

        }

    }
);


// ============================================================
// CART BUTTON
// ============================================================

if (cartButton) {

    cartButton.addEventListener(
        "click",
        openCart
    );

}


// ============================================================
// CART CLOSE BUTTON
// ============================================================

if (cartClose) {

    cartClose.addEventListener(
        "click",
        closeCart
    );

}


// ============================================================
// CART OVERLAY
// ============================================================

if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        closeCart
    );

}


// ============================================================
// CONTINUE SHOPPING
// ============================================================

if (cartShoppingButton) {

    cartShoppingButton.addEventListener(
        "click",
        closeCart
    );

}


// ============================================================
// CHECKOUT ELEMENTS
// ============================================================

const checkoutModal =
    document.getElementById(
        "checkoutModal"
    );

const checkoutClose =
    document.getElementById(
        "checkoutClose"
    );

const checkoutOverlay =
    document.querySelector(
        ".checkout-overlay"
    );

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );

const checkoutMessage =
    document.getElementById(
        "checkoutMessage"
    );

const paymentMethod =
    document.getElementById(
        "paymentMethod"
    );


// ============================================================
// PAYMENT OPTIONS
// ============================================================

const paymentOptions =
    document.querySelectorAll(
        ".payment-option"
    );


paymentOptions.forEach(
    function (option) {

        option.addEventListener(
            "click",
            function () {

                paymentOptions.forEach(
                    function (item) {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                option.classList.add(
                    "selected"
                );


                if (paymentMethod) {

                    paymentMethod.value =
                        option.dataset.payment || "";

                }


                console.log(
                    "Payment method selected:",
                    paymentMethod
                        ? paymentMethod.value
                        : ""
                );

            }
        );

    }
);


// ============================================================
// RENDER CHECKOUT ITEMS
// ============================================================

function renderCheckoutItems() {

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );

    const checkoutSubtotal =
        document.getElementById(
            "checkoutSubtotal"
        );

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );

    const checkoutDelivery =
        document.getElementById(
            "checkoutDelivery"
        );


    if (!checkoutItems) {

        return;

    }


    checkoutItems.innerHTML = "";


    // --------------------------------------------------------
    // EMPTY
    // --------------------------------------------------------

    if (!cart || cart.length === 0) {

        checkoutItems.innerHTML = `

            <p style="
                color:#888;
                font-size:12px;
                text-align:center;
                padding:20px 0;
            ">

                Your cart is empty.

            </p>

        `;


        if (checkoutSubtotal) {

            checkoutSubtotal.textContent =
                "₦0";

        }


        if (checkoutTotal) {

            checkoutTotal.textContent =
                "₦0";

        }


        return;

    }


    let subtotal = 0;


    // --------------------------------------------------------
    // PRODUCTS
    // --------------------------------------------------------

    cart.forEach(
        function (item) {

            const quantity =
                Number(
                    item.quantity ||
                    item.qty ||
                    1
                );


            const price =
                Number(
                    item.price || 0
                );


            const itemTotal =
                price * quantity;


            subtotal +=
                itemTotal;


            const checkoutItem =
                document.createElement(
                    "div"
                );


            checkoutItem.className =
                "checkout-summary-item";


            checkoutItem.innerHTML = `

                <div class="checkout-summary-image">

                    <img
                        src="${item.image || ""}"
                        alt="${item.name || "Product"}">

                </div>


                <div class="checkout-summary-info">

                    <h4>
                        ${item.name || "Product"}
                    </h4>

                    <p>
                        Qty: ${quantity}
                    </p>

                </div>


                <div class="checkout-summary-price">

                    ₦${itemTotal.toLocaleString("en-NG")}

                </div>

            `;


            checkoutItems.appendChild(
                checkoutItem
            );

        }
    );


    // --------------------------------------------------------
    // DELIVERY
    // --------------------------------------------------------

    let delivery = 0;


    if (subtotal >= 50000) {

        delivery = 0;


        if (checkoutDelivery) {

            checkoutDelivery.textContent =
                "FREE";

        }

    }

    else {

        if (checkoutDelivery) {

            checkoutDelivery.textContent =
                "Calculated at checkout";

        }

    }


    // --------------------------------------------------------
    // TOTAL
    // --------------------------------------------------------

    const total =
        subtotal + delivery;


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            `₦${subtotal.toLocaleString("en-NG")}`;

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            `₦${total.toLocaleString("en-NG")}`;

    }

}


// ============================================================
// OPEN CHECKOUT
// ============================================================

function openCheckout() {

    syncCartWithCurrentUser();


    if (!getCartStorageKey()) {

        alert(
            "Please sign in before checkout."
        );

        return;

    }


    if (!cart || cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    renderCheckoutItems();


    if (checkoutModal) {

        checkoutModal.hidden =
            false;

        checkoutModal.classList.add(
            "show"
        );

        document.body.classList.add(
            "checkout-open"
        );

    }


    if (checkoutMessage) {

        checkoutMessage.textContent =
            "";

    }

}


// ============================================================
// CHECKOUT BUTTON
// ============================================================

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        openCheckout
    );

}


// ============================================================
// CLOSE CHECKOUT
// ============================================================

function closeCheckout() {

    if (!checkoutModal) {

        return;

    }


    checkoutModal.hidden =
        true;


    checkoutModal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "checkout-open"
    );

}


// ============================================================
// CHECKOUT CLOSE BUTTON
// ============================================================

if (checkoutClose) {

    checkoutClose.addEventListener(
        "click",
        closeCheckout
    );

}


// ============================================================
// CHECKOUT OVERLAY
// ============================================================

if (checkoutOverlay) {

    checkoutOverlay.addEventListener(
        "click",
        closeCheckout
    );

}


// ============================================================
// ESCAPE KEY
// ============================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            checkoutModal &&
            !checkoutModal.hidden
        ) {

            closeCheckout();

        }

    }
);


// ============================================================
// CREATE ORDER AFTER PAYMENT
// ============================================================

async function createOrderAfterPayment(
    orderData,
    token
) {

    const response =
        await fetch(
            `${CART_API_BASE_URL}/orders`,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token

                },

                body:
                    JSON.stringify(
                        orderData
                    )

            }
        );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.error ||
            "Could not create order."
        );

    }


    return result;

}


// ============================================================
// CLEAR CURRENT CART
// ============================================================

function clearCurrentCart() {

    cart = [];


    const storageKey =
        getCartStorageKey();


    if (storageKey) {

        localStorage.removeItem(
            storageKey
        );

    }


    updateCartDisplayOnly();

}


// ============================================================
// CLEAR PAYSTACK SESSION
// ============================================================

function clearPaystackSession() {

    sessionStorage.removeItem(
        PAYSTACK_REFERENCE_KEY
    );


    sessionStorage.removeItem(
        PAYSTACK_PENDING_ORDER_KEY
    );

}


// ============================================================
// HANDLE PAYSTACK RETURN
// ============================================================

async function handlePaystackReturn() {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const reference =
        urlParams.get(
            "reference"
        );


    if (!reference) {

        return;

    }


    const token =
        localStorage.getItem(
            "naijaCartToken"
        );


    if (!token) {

        console.error(
            "No login token available for Paystack verification."
        );

        return;

    }


    const savedReference =
        sessionStorage.getItem(
            PAYSTACK_REFERENCE_KEY
        );


    const savedOrder =
        sessionStorage.getItem(
            PAYSTACK_PENDING_ORDER_KEY
        );


    if (
        !savedReference ||
        !savedOrder
    ) {

        console.warn(
            "Paystack reference or pending order was not found."
        );

        return;

    }


    if (
        reference !==
        savedReference
    ) {

        console.error(
            "Paystack reference mismatch."
        );

        return;

    }


    let pendingOrder;


    try {

        pendingOrder =
            JSON.parse(
                savedOrder
            );

    }

    catch (error) {

        console.error(
            "Could not read pending order:",
            error
        );

        clearPaystackSession();

        return;

    }


    try {

        // ----------------------------------------------------
        // OPEN CHECKOUT MODAL
        // ----------------------------------------------------

        if (checkoutModal) {

            checkoutModal.hidden =
                false;

            checkoutModal.classList.add(
                "show"
            );

            document.body.classList.add(
                "checkout-open"
            );

        }


        // ----------------------------------------------------
        // SHOW VERIFYING MESSAGE
        // ----------------------------------------------------

        if (checkoutMessage) {

            checkoutMessage.textContent =
                "Verifying your Paystack payment...";

        }


        // ----------------------------------------------------
        // VERIFY PAYMENT
        // ----------------------------------------------------

        const verificationResponse =
            await fetch(
                `${CART_API_BASE_URL}/payments/paystack/verify/${encodeURIComponent(reference)}`,
                {

                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }

                }
            );


        const verificationResult =
            await verificationResponse.json();


        // ----------------------------------------------------
        // VERIFICATION REQUEST FAILED
        // ----------------------------------------------------

        if (!verificationResponse.ok) {

            if (checkoutMessage) {

                checkoutMessage.textContent =
                    verificationResult.error ||
                    "Payment verification failed.";

            }

            return;

        }


        // ----------------------------------------------------
        // PAYMENT NOT PAID
        // ----------------------------------------------------

        if (
            !verificationResult.paid
        ) {

            if (checkoutMessage) {

                checkoutMessage.textContent =
                    "Payment was not completed.";

            }

            return;

        }


        // ----------------------------------------------------
        // PAYMENT VERIFIED
        // ----------------------------------------------------

        if (checkoutMessage) {

            checkoutMessage.textContent =
                "Payment verified. Creating your order...";

        }


        // ----------------------------------------------------
        // CREATE ORDER
        // ----------------------------------------------------

        const orderResult =
            await createOrderAfterPayment(
                pendingOrder,
                token
            );


        // ----------------------------------------------------
        // CLEAR CART
        // ----------------------------------------------------

        clearCurrentCart();


        // ----------------------------------------------------
        // CLEAR PAYSTACK SESSION
        // ----------------------------------------------------

        clearPaystackSession();


        // ----------------------------------------------------
        // SUCCESS MESSAGE
        // ----------------------------------------------------

        if (checkoutMessage) {

            checkoutMessage.textContent =
                `Payment successful! Order #${orderResult.order_id} has been placed.`;

        }


        renderCheckoutItems();


        console.log(
            "PAYSTACK PAYMENT VERIFIED:",
            verificationResult
        );


        console.log(
            "ORDER CREATED:",
            orderResult
        );


        // ----------------------------------------------------
        // CLEAN URL
        // ----------------------------------------------------

        const cleanUrl =
            window.location.origin +
            window.location.pathname;


        window.history.replaceState(
            {},
            document.title,
            cleanUrl
        );

    }


    catch (error) {

        console.error(
            "Paystack return error:",
            error
        );


        if (checkoutMessage) {

            checkoutMessage.textContent =
                "Payment verification could not be completed. Please contact support if money was deducted.";

        }

    }

}


// ============================================================
// CHECKOUT FORM SUBMISSION
// ============================================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ------------------------------------------------
            // LOGIN
            // ------------------------------------------------

            const token =
                localStorage.getItem(
                    "naijaCartToken"
                );


            if (!token) {

                if (checkoutMessage) {

                    checkoutMessage.textContent =
                        "Please sign in before checkout.";

                }

                return;

            }


            // ------------------------------------------------
            // PAYMENT METHOD
            // ------------------------------------------------

            if (
                !paymentMethod ||
                !paymentMethod.value
            ) {

                if (checkoutMessage) {

                    checkoutMessage.textContent =
                        "Please select a payment method.";

                }

                return;

            }


            // ------------------------------------------------
            // CART
            // ------------------------------------------------

            if (
                !cart ||
                cart.length === 0
            ) {

                if (checkoutMessage) {

                    checkoutMessage.textContent =
                        "Your cart is empty.";

                }

                return;

            }


            // ------------------------------------------------
            // CUSTOMER INFORMATION
            // ------------------------------------------------

            const nameInput =
                document.getElementById(
                    "checkoutName"
                );


            const emailInput =
                document.getElementById(
                    "checkoutEmail"
                );


            const locationInput =
                document.getElementById(
                    "checkoutLocation"
                );


            const phoneInput =
                document.getElementById(
                    "checkoutPhone"
                );


            if (
                !nameInput ||
                !emailInput ||
                !locationInput
            ) {

                if (checkoutMessage) {

                    checkoutMessage.textContent =
                        "Checkout fields are missing.";

                }

                return;

            }


            const fullName =
                nameInput.value.trim();


            const email =
                emailInput.value.trim();


            const location =
                locationInput.value.trim();


            const phone =
                phoneInput
                    ? phoneInput.value.trim()
                    : "";


            if (
                !fullName ||
                !email ||
                !location
            ) {

                if (checkoutMessage) {

                    checkoutMessage.textContent =
                        "Please complete all delivery information.";

                }

                return;

            }


            // ------------------------------------------------
            // CALCULATE TOTAL
            // ------------------------------------------------

            const subtotal =
                getSubtotal();


            let delivery = 0;


            if (subtotal >= 50000) {

                delivery = 0;

            }


            const total =
                subtotal + delivery;


            if (total <= 0) {

                if (checkoutMessage) {

                    checkoutMessage.textContent =
                        "Invalid checkout total.";

                }

                return;

            }


            // ------------------------------------------------
            // PREPARE ORDER DATA
            // ------------------------------------------------

            const orderData = {

                full_name:
                    fullName,

                email:
                    email,

                location:
                    location,

                phone:
                    phone,

                payment_method:
                    paymentMethod.value,

                items:
                    cart.map(
                        function (item) {

                            return {

                                product_id:
                                    Number(
                                        item.id
                                    ),

                                product_name:
                                    item.name,

                                unit_price:
                                    Number(
                                        item.price
                                    ),

                                qty:
                                    Number(
                                        item.quantity ||
                                        item.qty ||
                                        1
                                    )

                            };

                        }
                    )

            };


            // ------------------------------------------------
            // SUBMIT BUTTON
            // ------------------------------------------------

            const submitButton =
                checkoutForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

            }


            // =================================================
            // PAYSTACK
            // =================================================

            if (
                paymentMethod.value ===
                "paystack"
            ) {

                try {

                    if (checkoutMessage) {

                        checkoutMessage.textContent =
                            "Preparing secure payment...";

                    }


                    // ------------------------------------------------
                    // INITIALIZE PAYSTACK
                    // ------------------------------------------------

                    const paymentResponse =
                        await fetch(
                            `${CART_API_BASE_URL}/payments/paystack/initialize`,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        "Bearer " + token

                                },

                                body:
                                    JSON.stringify({

                                        email:
                                            email,

                                        amount:
                                            total,

                                        callback_url:
                                            window.location.href

                                    })

                            }
                        );


                    const paymentResult =
                        await paymentResponse.json();


                    // ------------------------------------------------
                    // INITIALIZATION ERROR
                    // ------------------------------------------------

                    if (!paymentResponse.ok) {

                        if (checkoutMessage) {

                            checkoutMessage.textContent =
                                paymentResult.error ||
                                "Could not initialize Paystack payment.";

                        }


                        if (submitButton) {

                            submitButton.disabled =
                                false;

                        }


                        return;

                    }


                    // ------------------------------------------------
                    // PAYSTACK RESPONSE
                    // ------------------------------------------------

                    const authorizationUrl =
                        paymentResult.authorization_url;


                    const reference =
                        paymentResult.reference;


                    if (
                        !authorizationUrl ||
                        !reference
                    ) {

                        if (checkoutMessage) {

                            checkoutMessage.textContent =
                                "Paystack did not return valid payment information.";

                        }


                        if (submitButton) {

                            submitButton.disabled =
                                false;

                        }


                        return;

                    }


                    // ------------------------------------------------
                    // SAVE PAYSTACK REFERENCE
                    // ------------------------------------------------

                    sessionStorage.setItem(
                        PAYSTACK_REFERENCE_KEY,
                        reference
                    );


                    // ------------------------------------------------
                    // SAVE PENDING ORDER
                    // ------------------------------------------------

                    sessionStorage.setItem(
                        PAYSTACK_PENDING_ORDER_KEY,
                        JSON.stringify(
                            orderData
                        )
                    );


                    // ------------------------------------------------
                    // REDIRECT TO PAYSTACK
                    // ------------------------------------------------

                    if (checkoutMessage) {

                        checkoutMessage.textContent =
                            "Redirecting to secure payment...";

                    }


                    window.location.href =
                        authorizationUrl;


                    return;

                }


                catch (error) {

                    console.error(
                        "Paystack initialization error:",
                        error
                    );


                    if (checkoutMessage) {

                        checkoutMessage.textContent =
                            "Could not connect to Paystack.";

                    }


                    if (submitButton) {

                        submitButton.disabled =
                            false;

                    }


                    return;

                }

            }


            // =================================================
            // OTHER PAYMENT METHODS
            // =================================================

            try {

                if (checkoutMessage) {

                    checkoutMessage.textContent =
                        "Placing your order...";

                }


                const result =
                    await createOrderAfterPayment(
                        orderData,
                        token
                    );


                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------

                if (checkoutMessage) {

                    checkoutMessage.textContent =
                        `Order placed successfully! Order #${result.order_id}`;

                }


                clearCurrentCart();

                renderCheckoutItems();


                console.log(
                    "ORDER CREATED:",
                    result
                );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                }

            }


            catch (error) {

                console.error(
                    "Checkout error:",
                    error
                );


                if (checkoutMessage) {

                    checkoutMessage.textContent =
                        error.message ||
                        "Could not connect to the server.";

                }


                if (submitButton) {

                    submitButton.disabled =
                        false;

                }

            }

        }
    );

}


// ============================================================
// SIGN-IN DETECTION
// ============================================================

document.addEventListener(
    "submit",
    function (event) {

        if (
            event.target &&
            event.target.id === "signinForm"
        ) {

            setTimeout(
                function () {

                    syncCartWithCurrentUser();

                },
                500
            );

        }

    }
);


// ============================================================
// SIGN-OUT DETECTION
// ============================================================

document.addEventListener(
    "click",
    function (event) {

        const logoutButton =
            event.target.closest(
                "#logoutButton"
            );


        if (!logoutButton) {

            return;

        }


        setTimeout(
            function () {

                syncCartWithCurrentUser();

                closeCart();

            },
            100
        );

    }
);


// ============================================================
// INITIALIZE CART
// ============================================================

updateCartDisplayOnly();


// ============================================================
// CHECK FOR PAYSTACK RETURN
// ============================================================

handlePaystackReturn();


// ============================================================
// STATUS
// ============================================================

console.log(
    "NaijaCart cart.js is working correctly."
);