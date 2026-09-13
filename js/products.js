// ============================================================
// NAIJA CART — products.js
// Handles:
// - Loading products from Flask
// - Product cards
// - Category filtering
// - Product search
// - Product sorting
// - Wishlist
// - Account-specific wishlist
// ============================================================


// ============================================================
// PRODUCTS
// ============================================================

let products = [];


// ============================================================
// PRODUCTS GRID
// ============================================================

const productsGrid =
    document.getElementById("productsGrid");


// ============================================================
// CATEGORY SELECT
// ============================================================

const categorySelect =
    document.querySelector(".category-select");


// ============================================================
// SEARCH ELEMENTS
// ============================================================

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.querySelector(".search-button");


// ============================================================
// SORT PRODUCTS
// ============================================================

const sortProducts =
    document.getElementById("sortProducts");


// ============================================================
// CURRENT FILTER
// ============================================================

let currentCategory = "all";

let currentSearch = "";


// ============================================================
// FORMAT PRICE
// ============================================================

function formatPrice(price) {

    return (
        "₦" +
        Number(price || 0).toLocaleString("en-NG")
    );

}


// ============================================================
// CREATE REVIEWS
// ============================================================

function createReviews(rating) {

    rating = Number(rating) || 0;

    rating = Math.max(
        0,
        Math.min(
            5,
            Math.round(rating)
        )
    );


    const fullStars =
        "★".repeat(rating);

    const emptyStars =
        "☆".repeat(5 - rating);


    return `
        <span class="stars">
            ${fullStars}${emptyStars}
        </span>

        <span class="review-count">
            (${rating}/5)
        </span>
    `;

}


// ============================================================
// NORMALIZE PRODUCT
// ============================================================
// Makes the frontend work whether Flask returns:
//
// id
// OR product_id
//
// category
// OR category_name
//
// reviews
// OR rating
// ============================================================

function normalizeProduct(product) {

    return {

        id:
            Number(
                product.id ??
                product.product_id
            ),

        name:
            product.name ??
            product.product_name ??
            "Unnamed Product",

        price:
            Number(
                product.price || 0
            ),

        category:
            product.category ??
            product.category_name ??
            "Product",

        stock:
            Number(
                product.stock || 0
            ),

        image:
            product.image ||
            "",

        reviews:
            Number(
                product.reviews ??
                product.rating ??
                0
            )

    };

}


// ============================================================
// CREATE PRODUCT CARD
// ============================================================

function createProductCard(product) {

    const card =
        document.createElement("article");


    card.classList.add(
        "product-card"
    );


    const productId =
        Number(product.id);


    const productName =
        product.name || "Product";


    const productStock =
        Number(product.stock || 0);


    card.innerHTML = `

        <!-- PRODUCT IMAGE -->

        <div class="product-image">

            <img
                src="${product.image || ""}"
                alt="${productName}"
                loading="lazy"
            >


            <!-- WISHLIST -->

            <button
                class="wishlist-button"
                type="button"
                data-product-id="${productId}"
                aria-label="Add ${productName} to wishlist"
                title="Add to wishlist"
            >

                ♡

            </button>

        </div>


        <!-- PRODUCT INFORMATION -->

        <div class="product-info">


            <!-- CATEGORY -->

            <p class="product-category">

                ${product.category || "Product"}

            </p>


            <!-- NAME -->

            <h3>

                ${productName}

            </h3>


            <!-- REVIEWS -->

            <div class="product-reviews">

                ${createReviews(product.reviews)}

            </div>


            <!-- PRICE -->

            <p class="product-price">

                ${formatPrice(product.price)}

            </p>


            <!-- STOCK -->

            <p class="product-stock">

                ${
                    productStock > 0
                        ? `${productStock} in stock`
                        : "Out of stock"
                }

            </p>


            <!-- ADD TO CART -->

            <button
                class="add-cart-button"
                type="button"
                data-product-id="${productId}"

                ${
                    productStock <= 0
                        ? "disabled"
                        : ""
                }
            >

                ${
                    productStock > 0
                        ? "Add to Cart"
                        : "Out of Stock"
                }

            </button>


        </div>

    `;


    return card;

}


// ============================================================
// DISPLAY PRODUCTS
// ============================================================

function displayProducts(productList) {

    if (!productsGrid) {

        console.error(
            "productsGrid was not found."
        );

        return;

    }


    productsGrid.innerHTML = "";


    if (
        !Array.isArray(productList) ||
        productList.length === 0
    ) {

        productsGrid.innerHTML = `

            <div class="no-products">

                <div class="no-products-icon">
                    🛍️
                </div>

                <h3>
                    No Products Found
                </h3>

                <p>
                    There are currently no products
                    matching your search or category.
                </p>

            </div>

        `;

        return;

    }


    productList.forEach(
        function (product) {

            productsGrid.appendChild(
                createProductCard(product)
            );

        }
    );


    updateWishlistButtons();

}


// ============================================================
// FILTER BY CATEGORY
// ============================================================

function filterProducts(category) {

    currentCategory =
        category || "all";


    applyProductFilters();

}


// ============================================================
// SEARCH PRODUCTS
// ============================================================

function searchProducts() {

    if (!searchInput) {

        return;

    }


    currentSearch =
        searchInput.value
            .trim()
            .toLowerCase();


    applyProductFilters();

}


// ============================================================
// APPLY CATEGORY + SEARCH + SORT
// ============================================================

function applyProductFilters() {

    let filteredProducts =
        [...products];


    // ========================================================
    // CATEGORY
    // ========================================================

    if (
        currentCategory !== "all"
    ) {

        filteredProducts =
            filteredProducts.filter(
                function (product) {

                    return (
                        String(
                            product.category
                        )
                        .toLowerCase()
                        ===
                        String(
                            currentCategory
                        )
                        .toLowerCase()
                    );

                }
            );

    }


    // ========================================================
    // SEARCH
    // ========================================================

    if (currentSearch) {

        filteredProducts =
            filteredProducts.filter(
                function (product) {

                    const name =
                        String(
                            product.name || ""
                        )
                        .toLowerCase();

                    const category =
                        String(
                            product.category || ""
                        )
                        .toLowerCase();

                    const description =
                        String(
                            product.description || ""
                        )
                        .toLowerCase();


                    return (
                        name.includes(
                            currentSearch
                        ) ||

                        category.includes(
                            currentSearch
                        ) ||

                        description.includes(
                            currentSearch
                        )
                    );

                }
            );

    }


    // ========================================================
    // SORT
    // ========================================================

    const sortValue =
        sortProducts
            ? sortProducts.value
            : "default";


    if (
        sortValue === "price-low"
    ) {

        filteredProducts.sort(
            function (a, b) {

                return (
                    Number(a.price) -
                    Number(b.price)
                );

            }
        );

    }


    else if (
        sortValue === "price-high"
    ) {

        filteredProducts.sort(
            function (a, b) {

                return (
                    Number(b.price) -
                    Number(a.price)
                );

            }
        );

    }


    else if (
        sortValue === "name-az"
    ) {

        filteredProducts.sort(
            function (a, b) {

                return String(a.name)
                    .localeCompare(
                        String(b.name)
                    );

            }
        );

    }


    else if (
        sortValue === "name-za"
    ) {

        filteredProducts.sort(
            function (a, b) {

                return String(b.name)
                    .localeCompare(
                        String(a.name)
                    );

            }
        );

    }


    else if (
        sortValue === "newest"
    ) {

        filteredProducts.sort(
            function (a, b) {

                return (
                    Number(b.id) -
                    Number(a.id)
                );

            }
        );

    }


    displayProducts(
        filteredProducts
    );

}


// ============================================================
// CATEGORY BUTTONS
// ============================================================

const categoryButtons =
    document.querySelectorAll(
        ".category-button"
    );


categoryButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const selectedCategory =
                    this.dataset.category;


                // Remove active

                categoryButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                // Add active

                this.classList.add(
                    "active"
                );


                // Filter

                filterProducts(
                    selectedCategory
                );


                // Synchronize category dropdown

                if (categorySelect) {

                    categorySelect.dataset.category =
                        selectedCategory;

                }


                // Update dropdown text

                updateCategorySelectText(
                    selectedCategory
                );


                scrollToProducts();

            }
        );

    }
);


// ============================================================
// UPDATE CATEGORY SELECT TEXT
// ============================================================

function updateCategorySelectText(category) {

    if (!categorySelect) {

        return;

    }


    const categoryNames = {

        "all":
            "All Categories",

        "Jalabias & Caps":
            "Jalabias & Caps",

        "Prayer Necessities & Perfumes":
            "Prayer Necessities & Perfumes",

        "Turbans":
            "Turbans",

        "Miswaks & Islamic Gift Sets":
            "Miswaks & Islamic Gift Sets"

    };


    const selectedName =
        categoryNames[category] ||
        "All Categories";


    categorySelect.innerHTML = `

        ${selectedName}

        <span>⌄</span>

    `;

}


// ============================================================
// SCROLL TO PRODUCTS
// ============================================================

function scrollToProducts() {

    const productsSection =
        document.getElementById(
            "products"
        );


    if (!productsSection) {

        return;

    }


    productsSection.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


// ============================================================
// SEARCH BUTTON
// ============================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        function () {

            searchProducts();

            scrollToProducts();

        }
    );

}


// ============================================================
// SEARCH INPUT
// ============================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );


    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                searchProducts();

                scrollToProducts();

            }

        }
    );

}


// ============================================================
// SORT
// ============================================================

if (sortProducts) {

    sortProducts.addEventListener(
        "change",
        function () {

            applyProductFilters();

        }
    );

}


// ============================================================
// WISHLIST
// ============================================================

const WISHLIST_STORAGE_PREFIX =
    "naijacart_wishlist_";


// ============================================================
// GET CURRENT USER
// ============================================================

function getWishlistUser() {

    const savedUser =
        localStorage.getItem(
            "naijaCartUser"
        );


    if (!savedUser) {

        return null;

    }


    try {

        const user =
            JSON.parse(
                savedUser
            );


        if (
            !user ||
            typeof user !== "object"
        ) {

            return null;

        }


        return user;

    }

    catch (error) {

        console.error(
            "Could not read wishlist user:",
            error
        );

        return null;

    }

}


// ============================================================
// GET WISHLIST STORAGE KEY
// ============================================================

function getWishlistStorageKey() {

    const user =
        getWishlistUser();


    if (!user) {

        return null;

    }


    // CUSTOMER ID

    if (user.customer_id) {

        return (
            WISHLIST_STORAGE_PREFIX +
            "customer_" +
            user.customer_id
        );

    }


    // USER ID

    if (user.user_id) {

        return (
            WISHLIST_STORAGE_PREFIX +
            "user_" +
            user.user_id
        );

    }


    // GENERIC ID

    if (user.id) {

        return (
            WISHLIST_STORAGE_PREFIX +
            "user_" +
            user.id
        );

    }


    // EMAIL FALLBACK

    if (user.email) {

        return (
            WISHLIST_STORAGE_PREFIX +
            "email_" +
            encodeURIComponent(
                String(user.email)
                    .trim()
                    .toLowerCase()
            )
        );

    }


    return null;

}


// ============================================================
// LOAD WISHLIST
// ============================================================

function loadWishlistForCurrentUser() {

    const storageKey =
        getWishlistStorageKey();


    if (!storageKey) {

        return [];

    }


    const savedWishlist =
        localStorage.getItem(
            storageKey
        );


    if (!savedWishlist) {

        return [];

    }


    try {

        const parsedWishlist =
            JSON.parse(
                savedWishlist
            );


        if (
            !Array.isArray(
                parsedWishlist
            )
        ) {

            return [];

        }


        return parsedWishlist
            .map(
                function (id) {

                    return Number(id);

                }
            )
            .filter(
                function (id) {

                    return (
                        !Number.isNaN(id)
                    );

                }
            );

    }

    catch (error) {

        console.error(
            "Could not load wishlist:",
            error
        );


        localStorage.removeItem(
            storageKey
        );


        return [];

    }

}


// ============================================================
// WISHLIST DATA
// ============================================================

let wishlist =
    loadWishlistForCurrentUser();


// ============================================================
// TRACK ACCOUNT
// ============================================================

let currentWishlistStorageKey =
    getWishlistStorageKey();


// ============================================================
// SYNC WISHLIST WITH CURRENT USER
// ============================================================

function syncWishlistWithCurrentUser() {

    const newStorageKey =
        getWishlistStorageKey();


    // ========================================================
    // USER IS LOGGED OUT
    // ========================================================

    if (!newStorageKey) {

        currentWishlistStorageKey = null;

        wishlist = [];

        updateWishlistCount();

        updateWishlistButtons();

        return;

    }


    // ========================================================
    // SAME ACCOUNT — NOTHING TO CHANGE
    // ========================================================

    if (
        newStorageKey ===
        currentWishlistStorageKey
    ) {

        return;

    }


    // ========================================================
    // NEW ACCOUNT
    // ========================================================

    currentWishlistStorageKey =
        newStorageKey;


    wishlist =
        loadWishlistForCurrentUser();


    updateWishlistCount();

    updateWishlistButtons();

}

// ============================================================
// REFRESH WISHLIST FOR USER
// ============================================================

function refreshWishlistForUser() {

    currentWishlistStorageKey = "";

    syncWishlistWithCurrentUser();

}


// ============================================================
// UPDATE WISHLIST COUNT
// ============================================================

function updateWishlistCount() {

    const wishlistCount =
        document.getElementById(
            "wishlistCount"
        );


    if (wishlistCount) {

        wishlistCount.textContent =
            wishlist.length;

    }

}


// ============================================================
// SAVE WISHLIST
// ============================================================

function saveWishlist() {

    const storageKey =
        getWishlistStorageKey();


    if (!storageKey) {

        return;

    }


    localStorage.setItem(

        storageKey,

        JSON.stringify(
            wishlist
        )

    );


    updateWishlistCount();

}


// ============================================================
// CHECK WISHLIST
// ============================================================

function isInWishlist(productId) {

    return wishlist.includes(
        Number(productId)
    );

}


// ============================================================
// UPDATE WISHLIST BUTTONS
// ============================================================

function updateWishlistButtons() {

    const wishlistButtons =
        document.querySelectorAll(
            ".wishlist-button"
        );


    wishlistButtons.forEach(
        function (button) {

            const productId =
                Number(
                    button.dataset.productId
                );


            if (
                isInWishlist(
                    productId
                )
            ) {

                button.textContent =
                    "♥";


                button.classList.add(
                    "active"
                );


                button.setAttribute(
                    "aria-label",
                    "Remove from wishlist"
                );


                button.setAttribute(
                    "title",
                    "Remove from wishlist"
                );

            }

            else {

                button.textContent =
                    "♡";


                button.classList.remove(
                    "active"
                );


                button.setAttribute(
                    "aria-label",
                    "Add to wishlist"
                );


                button.setAttribute(
                    "title",
                    "Add to wishlist"
                );

            }

        }
    );

}


// ============================================================
// WISHLIST BUTTON CLICK
// ============================================================

document.addEventListener(
    "click",
    function (event) {

        const wishlistButton =
            event.target.closest(
                ".wishlist-button"
            );


        if (!wishlistButton) {

            return;

        }


        syncWishlistWithCurrentUser();


        const storageKey =
            getWishlistStorageKey();


        // LOGIN REQUIRED

        if (!storageKey) {

            alert(
                "Please sign in before adding products to your wishlist."
            );

            return;

        }


        const productId =
            Number(
                wishlistButton.dataset.productId
            );


        // ====================================================
        // REMOVE
        // ====================================================

        if (
            isInWishlist(
                productId
            )
        ) {

            wishlist =
                wishlist.filter(
                    function (id) {

                        return (
                            id !==
                            productId
                        );

                    }
                );


            saveWishlist();

            updateWishlistButtons();


            if (
                typeof showSuccess ===
                "function"
            ) {

                showSuccess(
                    "Product removed from wishlist."
                );

            }

        }


        // ====================================================
        // ADD
        // ====================================================

        else {

            wishlist.push(
                productId
            );


            saveWishlist();

            updateWishlistButtons();


            if (
                typeof showSuccess ===
                "function"
            ) {

                showSuccess(
                    "Product added to wishlist."
                );

            }

        }

    }
);


// ============================================================
// WISHLIST HEADER BUTTON
// ============================================================

const wishlistHeaderButton =
    document.getElementById(
        "wishlistButton"
    );


if (wishlistHeaderButton) {

    wishlistHeaderButton.addEventListener(
        "click",
        function () {

            syncWishlistWithCurrentUser();


            if (
                !getWishlistStorageKey()
            ) {

                alert(
                    "Please sign in to view your wishlist."
                );

                return;

            }


            if (
                wishlist.length === 0
            ) {

                alert(
                    "Your wishlist is empty."
                );

                return;

            }


            // For now the header button
            // displays the number.
            // A dedicated wishlist page
            // can be connected later.

            console.log(
                "Current wishlist:",
                wishlist
            );

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
            event.target.id ===
            "signinForm"
        ) {

            setTimeout(
                function () {

                    refreshWishlistForUser();

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

                refreshWishlistForUser();

            },
            200
        );

    }
);


// ============================================================
// LOAD PRODUCTS FROM FLASK
// ============================================================

async function loadProducts() {

    try {

        const response =
            await fetchProducts();


        if (
            !Array.isArray(response)
        ) {

            console.error(
                "fetchProducts() did not return an array."
            );

            products = [];

            displayProducts([]);

            return;

        }


        // Normalize products

        products =
            response.map(
                function (product) {

                    return normalizeProduct(
                        product
                    );

                }
            );


        console.log(
            "Products loaded from database:",
            products
        );


        applyProductFilters();

    }

    catch (error) {

        console.error(
            "Could not load products:",
            error
        );


        products = [];


        displayProducts([]);

    }

}


// ============================================================
// INITIALIZE WISHLIST
// ============================================================

updateWishlistCount();

updateWishlistButtons();


// ============================================================
// START PRODUCTS
// ============================================================

loadProducts();


// ============================================================
// STATUS
// ============================================================

console.log(
    "products.js is working correctly."
);