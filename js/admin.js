// ============================================================
// NAIJA CART — admin.js
// ============================================================
// Handles:
// - Admin authentication
// - Dashboard statistics
// - Products
// - Categories
// - Orders
// - Customers
// - Product add/edit/delete
// - Category add
// - Order status updates
// - Admin navigation
//
// The HTML already contains all admin sections.
// This file does NOT create duplicate sections.
// ============================================================


// ============================================================
// API CONFIGURATION
// ============================================================

const ADMIN_API_BASE_URL =
    "https://naija-cart-backend.onrender.com/api";


// ============================================================
// DOM ELEMENTS
// ============================================================

const adminPageTitle =
    document.getElementById("adminPageTitle");

const adminUserName =
    document.getElementById("adminUserName");

const adminUserEmail =
    document.getElementById("adminUserEmail");

const adminUserAvatar =
    document.getElementById("adminUserAvatar");

const adminLogoutButton =
    document.getElementById("adminLogoutButton");

const adminMenuButton =
    document.getElementById("adminMenuButton");

const adminSidebar =
    document.querySelector(".admin-sidebar");

const adminNavItems =
    document.querySelectorAll(".admin-nav-item");


// ============================================================
// ADMIN SECTIONS
// ============================================================

const adminSections =
    document.querySelectorAll(".admin-section");


// ============================================================
// ADMIN STATE
// ============================================================

let adminUser = null;

let adminProducts = [];

let adminOrders = [];

let adminUsers = [];

let adminCategories = [];


// ============================================================
// GET AUTH TOKEN
// ============================================================

function getAdminToken() {

    return localStorage.getItem(
        "naijaCartToken"
    );

}


// ============================================================
// ADMIN API REQUEST
// ============================================================

async function adminFetch(
    endpoint,
    options = {}
) {

    const token =
        getAdminToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }

    const response =
        await fetch(
            `${ADMIN_API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

    let data = null;

    try {

        data =
            await response.json();

    } catch (error) {

        data = null;

    }

    if (!response.ok) {

        const message =
            data?.error ||
            data?.message ||
            `Request failed: ${response.status}`;

        throw new Error(message);

    }

    return data;

}


// ============================================================
// SHOW ADMIN ERROR
// ============================================================

function showAdminError(message) {

    console.error(
        "Naija Cart Admin Error:",
        message
    );

}


// ============================================================
// VERIFY ADMIN ACCESS
// ============================================================

async function verifyAdminAccess() {

    const token =
        getAdminToken();

    if (!token) {

        redirectToStore();

        return false;

    }

    try {

        const data =
            await adminFetch(
                "/auth/me"
            );

        if (
            !data ||
            !data.user
        ) {

            redirectToStore();

            return false;

        }

        const user =
            data.user;

        if (!user.is_admin) {

            alert(
                "Admin access required."
            );

            redirectToStore();

            return false;

        }

        adminUser =
            user;

        localStorage.setItem(
            "naijaCartUser",
            JSON.stringify(user)
        );

        updateAdminUserUI(
            user
        );

        return true;

    } catch (error) {

        console.error(
            "Admin authentication failed:",
            error
        );

        localStorage.removeItem(
            "naijaCartUser"
        );

        localStorage.removeItem(
            "naijaCartToken"
        );

        redirectToStore();

        return false;

    }

}


// ============================================================
// REDIRECT TO STORE
// ============================================================

function redirectToStore() {

    window.location.href =
        "index.html";

}


// ============================================================
// UPDATE ADMIN USER UI
// ============================================================

function updateAdminUserUI(user) {

    if (!user) {

        return;

    }

    if (adminUserName) {

        adminUserName.textContent =
            user.name || "Admin";

    }

    if (adminUserEmail) {

        adminUserEmail.textContent =
            user.email || "";

    }

    if (adminUserAvatar) {

        const firstLetter =
            user.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "A";

        adminUserAvatar.textContent =
            firstLetter;

    }

}


// ============================================================
// LOGOUT
// ============================================================

function adminLogout() {

    localStorage.removeItem(
        "naijaCartUser"
    );

    localStorage.removeItem(
        "naijaCartToken"
    );

    window.location.href =
        "index.html";

}


if (adminLogoutButton) {

    adminLogoutButton.addEventListener(
        "click",
        adminLogout
    );

}


// ============================================================
// MOBILE SIDEBAR
// ============================================================

if (adminMenuButton) {

    adminMenuButton.addEventListener(
        "click",
        function () {

            if (adminSidebar) {

                adminSidebar.classList.toggle(
                    "mobile-open"
                );

            }

        }
    );

}


// ============================================================
// CLOSE MOBILE SIDEBAR
// ============================================================

function closeMobileSidebar() {

    if (adminSidebar) {

        adminSidebar.classList.remove(
            "mobile-open"
        );

    }

}


// ============================================================
// GET SECTION TITLE
// ============================================================

function getSectionTitle(sectionId) {

    const titles = {

        dashboardSection: "Dashboard",

        productsSection: "Products",

        ordersSection: "Orders",

        customersSection: "Customers",

        categoriesSection: "Categories"

    };

    return (
        titles[sectionId] ||
        "Dashboard"
    );

}


// ============================================================
// SHOW ONE ADMIN SECTION
// ============================================================

function showAdminSection(sectionId) {

    adminSections.forEach(
        function (section) {

            const isTarget =
                section.id === sectionId;

            section.hidden =
                !isTarget;

            section.classList.toggle(
                "active",
                isTarget
            );

        }
    );

}


// ============================================================
// UPDATE ACTIVE NAV BUTTON
// ============================================================

function updateActiveNav(sectionId) {

    adminNavItems.forEach(
        function (item) {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionId
            );

        }
    );

}


// ============================================================
// NAVIGATION
// ============================================================

adminNavItems.forEach(
    function (button) {

        button.addEventListener(
            "click",
            async function () {

                const sectionId =
                    button.dataset.section;

                if (!sectionId) {

                    return;

                }

                updateActiveNav(
                    sectionId
                );

                closeMobileSidebar();

                await loadAdminSection(
                    sectionId
                );

            }
        );

    }
);


// ============================================================
// QUICK ACTION BUTTONS
// ============================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-section]"
            );

        if (!button) {

            return;

        }

        if (
            button.classList.contains(
                "admin-nav-item"
            )
        ) {

            return;

        }

        const sectionId =
            button.dataset.section;

        if (!sectionId) {

            return;

        }

        updateActiveNav(
            sectionId
        );

        closeMobileSidebar();

        loadAdminSection(
            sectionId
        );

    }
);


// ============================================================
// LOAD ADMIN SECTION
// ============================================================

async function loadAdminSection(sectionId) {

    showAdminSection(
        sectionId
    );

    setAdminPageTitle(
        getSectionTitle(sectionId)
    );

    switch (sectionId) {

        case "dashboardSection":

            await loadDashboard();

            break;

        case "productsSection":

            await loadProducts();

            break;

        case "ordersSection":

            await loadOrders();

            break;

        case "customersSection":

            await loadUsers();

            break;

        case "categoriesSection":

            await loadCategories();

            break;

        default:

            updateActiveNav(
                "dashboardSection"
            );

            showAdminSection(
                "dashboardSection"
            );

            setAdminPageTitle(
                "Dashboard"
            );

            await loadDashboard();

            break;

    }

}


// ============================================================
// PAGE TITLE
// ============================================================

function setAdminPageTitle(title) {

    if (adminPageTitle) {

        adminPageTitle.textContent =
            title;

    }

}


// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboard() {

    try {

        const data =
            await adminFetch(
                "/admin/dashboard"
            );

        const statProducts =
            document.getElementById(
                "statProducts"
            );

        if (statProducts) {

            statProducts.textContent =
                data?.products ?? 0;

        }


        const statUsers =
            document.getElementById(
                "statUsers"
            );

        if (statUsers) {

            statUsers.textContent =
                data?.users ?? 0;

        }


        const statOrders =
            document.getElementById(
                "statOrders"
            );

        if (statOrders) {

            statOrders.textContent =
                data?.orders ?? 0;

        }


        const statPendingOrders =
            document.getElementById(
                "statPendingOrders"
            );

        if (statPendingOrders) {

            statPendingOrders.textContent =
                data?.pending_orders ?? 0;

        }


        const statTotalSales =
            document.getElementById(
                "statTotalSales"
            );

        if (statTotalSales) {

            statTotalSales.textContent =
                formatCurrency(
                    data?.total_sales ?? 0
                );

        }


        const statSales =
            document.getElementById(
                "statSales"
            );

        if (statSales) {

            statSales.textContent =
                formatCurrency(
                    data?.total_sales ?? 0
                );

        }


        await loadDashboardRecentOrders();

        await loadDashboardProductOverview();

    } catch (error) {

        showAdminError(
            error.message
        );

    }

}


// ============================================================
// DASHBOARD RECENT ORDERS
// ============================================================

async function loadDashboardRecentOrders() {

    const container =
        document.getElementById(
            "dashboardRecentOrders"
        );

    if (!container) {

        return;

    }

    try {

        const data =
            await adminFetch(
                "/admin/orders"
            );

        const orders =
            Array.isArray(data)
                ? data
                : [];

        if (!orders.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <span>🛒</span>

                    <p>
                        No orders yet.
                    </p>

                </div>
            `;

            return;

        }

        const recentOrders =
            orders.slice(0, 5);

        container.innerHTML =
            recentOrders.map(
                function (order) {

                    return `
                        <div
                            class="dashboard-order-row"
                            style="
                                display:flex;
                                justify-content:space-between;
                                align-items:center;
                                gap:16px;
                                padding:12px 0;
                                border-bottom:1px solid #edf0ee;
                            "
                        >

                            <div>

                                <strong>
                                    #${escapeHtml(order.id)}
                                </strong>

                                <div
                                    style="
                                        font-size:13px;
                                        color:#89948e;
                                        margin-top:3px;
                                    "
                                >
                                    ${escapeHtml(
                                        order.customer_name ||
                                        "Unknown customer"
                                    )}
                                </div>

                            </div>

                            <div
                                style="
                                    text-align:right;
                                "
                            >

                                <strong>
                                    ${formatCurrency(
                                        order.total
                                    )}
                                </strong>

                                <div
                                    style="
                                        font-size:12px;
                                        color:#89948e;
                                        margin-top:3px;
                                    "
                                >
                                    ${escapeHtml(
                                        order.status ||
                                        "pending"
                                    )}
                                </div>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");

    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">

                <span>⚠️</span>

                <p>
                    Unable to load recent orders.
                </p>

            </div>
        `;

        console.error(
            error
        );

    }

}


// ============================================================
// DASHBOARD PRODUCT OVERVIEW
// ============================================================

async function loadDashboardProductOverview() {

    const container =
        document.getElementById(
            "dashboardProductOverview"
        );

    if (!container) {

        return;

    }

    try {

        const data =
            await adminFetch(
                "/admin/products"
            );

        const products =
            Array.isArray(data)
                ? data
                : [];

        if (!products.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <span>📦</span>

                    <p>
                        No products found.
                    </p>

                </div>
            `;

            return;

        }

        const totalStock =
            products.reduce(
                function (total, product) {

                    return (
                        total +
                        (Number(product.stock) || 0)
                    );

                },
                0
            );

        const lowStock =
            products.filter(
                function (product) {

                    return (
                        Number(product.stock) <= 5
                    );

                }
            ).length;

        container.innerHTML = `
            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(2,minmax(0,1fr));
                    gap:14px;
                "
            >

                <div>

                    <span
                        style="
                            display:block;
                            font-size:12px;
                            color:#89948e;
                            margin-bottom:4px;
                        "
                    >
                        Total products
                    </span>

                    <strong
                        style="
                            font-size:24px;
                        "
                    >
                        ${products.length}
                    </strong>

                </div>


                <div>

                    <span
                        style="
                            display:block;
                            font-size:12px;
                            color:#89948e;
                            margin-bottom:4px;
                        "
                    >
                        Total stock
                    </span>

                    <strong
                        style="
                            font-size:24px;
                        "
                    >
                        ${totalStock}
                    </strong>

                </div>


                <div>

                    <span
                        style="
                            display:block;
                            font-size:12px;
                            color:#89948e;
                            margin-bottom:4px;
                        "
                    >
                        Low stock
                    </span>

                    <strong
                        style="
                            font-size:24px;
                        "
                    >
                        ${lowStock}
                    </strong>

                </div>

            </div>
        `;

    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">

                <span>⚠️</span>

                <p>
                    Unable to load product overview.
                </p>

            </div>
        `;

        console.error(
            error
        );

    }

}


// ============================================================
// PRODUCTS
// ============================================================

async function loadProducts() {

    const tableBody =
        document.getElementById(
            "productsTableBody"
        );

    const emptyState =
        document.getElementById(
            "productsEmptyState"
        );

    if (!tableBody) {

        return;

    }

    tableBody.innerHTML = `
        <tr>

            <td
                colspan="6"
                style="
                    text-align:center;
                    padding:35px;
                    color:#89948e;
                "
            >
                Loading products...
            </td>

        </tr>
    `;

    if (emptyState) {

        emptyState.hidden = true;

    }

    try {

        const data =
            await adminFetch(
                "/admin/products"
            );

        adminProducts =
            Array.isArray(data)
                ? data
                : [];

        renderProductsTable(
            adminProducts
        );

        setupProductSearch();

        setupProductCategoryFilter();

    } catch (error) {

        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#c0392b;
                    "
                >
                    Failed to load products.
                </td>

            </tr>
        `;

        showAdminError(
            error.message
        );

    }

}


// ============================================================
// RENDER PRODUCTS
// ============================================================

function renderProductsTable(products) {

    const tableBody =
        document.getElementById(
            "productsTableBody"
        );

    const emptyState =
        document.getElementById(
            "productsEmptyState"
        );

    if (!tableBody) {

        return;

    }

    if (!products.length) {

        tableBody.innerHTML = "";

        if (emptyState) {

            emptyState.hidden = false;

        }

        return;

    }

    if (emptyState) {

        emptyState.hidden = true;

    }

    tableBody.innerHTML =
        products.map(
            function (product) {

                const imageHtml =
                    product.image
                        ? `
                            <img
                                class="admin-product-image"
                                src="${escapeAttribute(product.image)}"
                                alt="${escapeAttribute(product.name || "Product")}"
                            >
                        `
                        : `
                            <div
                                class="admin-product-image"
                                style="
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                "
                            >
                                📦
                            </div>
                        `;

                return `
                    <tr>

                        <td>

                            <div
                                class="admin-product-cell"
                            >

                                ${imageHtml}

                                <div>

                                    <div
                                        class="admin-product-name"
                                    >
                                        ${escapeHtml(
                                            product.name ||
                                            "Unnamed product"
                                        )}
                                    </div>

                                    <span
                                        class="admin-product-id"
                                    >
                                        ID #${escapeHtml(
                                            product.id
                                        )}
                                    </span>

                                </div>

                            </div>

                        </td>


                        <td>
                            ${escapeHtml(
                                product.category ||
                                "—"
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                product.price
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                product.stock ?? 0
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                product.reviews ?? 0
                            )}
                        </td>


                        <td>

                            <button
                                type="button"
                                class="table-action"
                                data-edit-product="${escapeAttribute(product.id)}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="table-action delete"
                                data-delete-product="${escapeAttribute(product.id)}"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>
                `;

            }
        )
        .join("");


    tableBody
        .querySelectorAll(
            "[data-edit-product]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                button.dataset.editProduct
                            );

                        openProductModal(
                            id
                        );

                    }
                );

            }
        );


    tableBody
        .querySelectorAll(
            "[data-delete-product]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                button.dataset.deleteProduct
                            );

                        deleteProduct(
                            id
                        );

                    }
                );

            }
        );

}


// ============================================================
// PRODUCT SEARCH
// ============================================================

function setupProductSearch() {

    const searchInput =
        document.getElementById(
            "productSearchInput"
        );

    if (!searchInput) {

        return;

    }

    searchInput.oninput =
        function () {

            filterProducts();

        };

}


// ============================================================
// PRODUCT CATEGORY FILTER
// ============================================================

function setupProductCategoryFilter() {

    const select =
        document.getElementById(
            "productCategoryFilter"
        );

    if (!select) {

        return;

    }

    const currentValue =
        select.value;

    const categories =
        [
            ...new Set(
                adminProducts
                    .map(
                        function (product) {

                            return product.category;

                        }
                    )
                    .filter(Boolean)
            )
        ];

    select.innerHTML = `
        <option value="">
            All Categories
        </option>
    `;

    categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            select.appendChild(
                option
            );

        }
    );

    select.value =
        currentValue;

    select.onchange =
        function () {

            filterProducts();

        };

}


// ============================================================
// FILTER PRODUCTS
// ============================================================

function filterProducts() {

    const searchInput =
        document.getElementById(
            "productSearchInput"
        );

    const categorySelect =
        document.getElementById(
            "productCategoryFilter"
        );

    const query =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const category =
        categorySelect
            ? categorySelect.value
            : "";

    const filtered =
        adminProducts.filter(
            function (product) {

                const productName =
                    String(
                        product.name || ""
                    )
                    .toLowerCase();

                const productCategory =
                    String(
                        product.category || ""
                    );

                const matchesSearch =
                    productName.includes(
                        query
                    );

                const matchesCategory =
                    !category ||
                    productCategory === category;

                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );

    renderProductsTable(
        filtered
    );

}


// ============================================================
// PRODUCT MODAL
// ============================================================

function openProductModal(
    productId = null
) {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (!modal) {

        return;

    }

    const form =
        document.getElementById(
            "productForm"
        );

    const title =
        document.getElementById(
            "productModalTitle"
        );

    const idInput =
        document.getElementById(
            "productId"
        );

    const nameInput =
        document.getElementById(
            "productName"
        );

    const priceInput =
        document.getElementById(
            "productPrice"
        );

    const stockInput =
        document.getElementById(
            "productStock"
        );

    const categoryInput =
        document.getElementById(
            "productCategory"
        );

    const imageInput =
        document.getElementById(
            "productImage"
        );

    const reviewsInput =
        document.getElementById(
            "productReviews"
        );

    const message =
        document.getElementById(
            "productFormMessage"
        );

    const product =
        productId
            ? adminProducts.find(
                function (item) {

                    return (
                        Number(item.id) ===
                        Number(productId)
                    );

                }
            )
            : null;

    if (form) {

        form.reset();

    }

    if (idInput) {

        idInput.value =
            product
                ? product.id
                : "";

    }

    if (nameInput) {

        nameInput.value =
            product?.name || "";

    }

    if (priceInput) {

        priceInput.value =
            product?.price ?? "";

    }

    if (stockInput) {

        stockInput.value =
            product?.stock ?? "";

    }

    if (categoryInput) {

        categoryInput.value =
            product?.category || "";

    }

    if (imageInput) {

        imageInput.value =
            product?.image || "";

    }

    if (reviewsInput) {

        reviewsInput.value =
            product?.reviews ?? 0;

    }

    if (title) {

        title.textContent =
            product
                ? "Edit Product"
                : "Add Product";

    }

    if (message) {

        message.textContent =
            "";

    }

    modal.hidden =
        false;

}


// ============================================================
// CLOSE PRODUCT MODAL
// ============================================================

function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (modal) {

        modal.hidden =
            true;

    }

}


// ============================================================
// PRODUCT MODAL EVENTS
// ============================================================

const closeProductModalButton =
    document.getElementById(
        "closeProductModal"
    );

const cancelProductButton =
    document.getElementById(
        "cancelProductButton"
    );

const productModal =
    document.getElementById(
        "productModal"
    );

if (closeProductModalButton) {

    closeProductModalButton.addEventListener(
        "click",
        closeProductModal
    );

}

if (cancelProductButton) {

    cancelProductButton.addEventListener(
        "click",
        closeProductModal
    );

}

if (productModal) {

    const overlay =
        productModal.querySelector(
            ".admin-modal-overlay"
        );

    if (overlay) {

        overlay.addEventListener(
            "click",
            closeProductModal
        );

    }

}


// ============================================================
// ADD PRODUCT BUTTON
// ============================================================

const addProductButton =
    document.getElementById(
        "addProductButton"
    );

if (addProductButton) {

    addProductButton.addEventListener(
        "click",
        function () {

            openProductModal();

        }
    );

}


// ============================================================
// PRODUCT FORM
// ============================================================

const productForm =
    document.getElementById(
        "productForm"
    );

if (productForm) {

    productForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await saveProduct();

        }
    );

}


// ============================================================
// SAVE PRODUCT
// ============================================================

async function saveProduct() {

    const idInput =
        document.getElementById(
            "productId"
        );

    const nameInput =
        document.getElementById(
            "productName"
        );

    const priceInput =
        document.getElementById(
            "productPrice"
        );

    const stockInput =
        document.getElementById(
            "productStock"
        );

    const categoryInput =
        document.getElementById(
            "productCategory"
        );

    const imageInput =
        document.getElementById(
            "productImage"
        );

    const reviewsInput =
        document.getElementById(
            "productReviews"
        );

    const message =
        document.getElementById(
            "productFormMessage"
        );

    const productId =
        idInput?.value
            ? Number(idInput.value)
            : null;

    const productData = {

        name:
            nameInput?.value.trim() || "",

        price:
            Number(
                priceInput?.value
            ) || 0,

        stock:
            Number(
                stockInput?.value
            ) || 0,

        category:
            categoryInput?.value.trim() || "",

        image:
            imageInput?.value.trim() || "",

        reviews:
            Number(
                reviewsInput?.value
            ) || 0

    };

    if (!productData.name) {

        if (message) {

            message.textContent =
                "Please enter a product name.";

        }

        return;

    }

    if (message) {

        message.textContent =
            "Saving product...";

    }

    try {

        if (productId) {

            await adminFetch(
                `/admin/products/${productId}`,
                {
                    method: "PUT",
                    body:
                        JSON.stringify(
                            productData
                        )
                }
            );

        } else {

            await adminFetch(
                "/admin/products",
                {
                    method: "POST",
                    body:
                        JSON.stringify(
                            productData
                        )
                }
            );

        }

        closeProductModal();

        await loadProducts();

        await loadDashboard();

    } catch (error) {

        if (message) {

            message.textContent =
                error.message;

        }

        console.error(
            error
        );

    }

}


// ============================================================
// DELETE PRODUCT
// ============================================================

async function deleteProduct(
    productId
) {

    const product =
        adminProducts.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(productId)
                );

            }
        );

    const productName =
        product?.name ||
        "this product";

    const confirmed =
        confirm(
            `Are you sure you want to delete ${productName}?`
        );

    if (!confirmed) {

        return;

    }

    try {

        await adminFetch(
            `/admin/products/${productId}`,
            {
                method: "DELETE"
            }
        );

        await loadProducts();

        await loadDashboard();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// ============================================================
// CATEGORIES
// ============================================================

async function loadCategories() {

    const container =
        document.getElementById(
            "categoriesGrid"
        );

    const emptyState =
        document.getElementById(
            "categoriesEmptyState"
        );

    if (!container) {

        return;

    }

    container.innerHTML = `
        <div
            class="empty-state"
            style="grid-column:1/-1"
        >
            <p>
                Loading categories...
            </p>
        </div>
    `;

    if (emptyState) {

        emptyState.hidden =
            true;

    }

    try {

        const data =
            await adminFetch(
                "/admin/categories"
            );

        adminCategories =
            Array.isArray(data)
                ? data
                : [];

        renderCategories();

    } catch (error) {

        container.innerHTML = `
            <div
                class="empty-state"
                style="grid-column:1/-1"
            >

                <span>⚠️</span>

                <p>
                    Failed to load categories.
                </p>

            </div>
        `;

        showAdminError(
            error.message
        );

    }

}


// ============================================================
// RENDER CATEGORIES
// ============================================================

function renderCategories() {

    const container =
        document.getElementById(
            "categoriesGrid"
        );

    const emptyState =
        document.getElementById(
            "categoriesEmptyState"
        );

    if (!container) {

        return;

    }

    if (!adminCategories.length) {

        container.innerHTML =
            "";

        if (emptyState) {

            emptyState.hidden =
                false;

        }

        return;

    }

    if (emptyState) {

        emptyState.hidden =
            true;

    }

    container.innerHTML =
        adminCategories.map(
            function (category) {

                const categoryName =
                    category.category ||
                    category.name ||
                    category.category_name ||
                    "Unnamed";

                const productCount =
                    category.product_count ??
                    category.products ??
                    0;

                return `
                    <div class="category-card">

                        <div class="category-icon">
                            🗂️
                        </div>

                        <h4>
                            ${escapeHtml(
                                categoryName
                            )}
                        </h4>

                        <p>
                            ${escapeHtml(
                                productCount
                            )}
                            product(s)
                        </p>

                    </div>
                `;

            }
        )
        .join("");

}


// ============================================================
// ADD CATEGORY BUTTON
// ============================================================

const addCategoryButton =
    document.getElementById(
        "addCategoryButton"
    );

if (addCategoryButton) {

    addCategoryButton.addEventListener(
        "click",
        openCategoryModal
    );

}


// ============================================================
// CATEGORY MODAL
// ============================================================

function openCategoryModal() {

    const modal =
        document.getElementById(
            "categoryModal"
        );

    const form =
        document.getElementById(
            "categoryForm"
        );

    const nameInput =
        document.getElementById(
            "categoryName"
        );

    const message =
        document.getElementById(
            "categoryFormMessage"
        );

    if (!modal) {

        return;

    }

    if (form) {

        form.reset();

    }

    if (nameInput) {

        nameInput.value =
            "";

    }

    if (message) {

        message.textContent =
            "";

    }

    modal.hidden =
        false;

}


// ============================================================
// CLOSE CATEGORY MODAL
// ============================================================

function closeCategoryModal() {

    const modal =
        document.getElementById(
            "categoryModal"
        );

    if (modal) {

        modal.hidden =
            true;

    }

}


// ============================================================
// CATEGORY MODAL EVENTS
// ============================================================

const closeCategoryModalButton =
    document.getElementById(
        "closeCategoryModal"
    );

const cancelCategoryButton =
    document.getElementById(
        "cancelCategoryButton"
    );

const categoryModal =
    document.getElementById(
        "categoryModal"
    );

if (closeCategoryModalButton) {

    closeCategoryModalButton.addEventListener(
        "click",
        closeCategoryModal
    );

}

if (cancelCategoryButton) {

    cancelCategoryButton.addEventListener(
        "click",
        closeCategoryModal
    );

}

if (categoryModal) {

    const overlay =
        categoryModal.querySelector(
            ".admin-modal-overlay"
        );

    if (overlay) {

        overlay.addEventListener(
            "click",
            closeCategoryModal
        );

    }

}


// ============================================================
// CATEGORY FORM
// ============================================================

const categoryForm =
    document.getElementById(
        "categoryForm"
    );

if (categoryForm) {

    categoryForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const nameInput =
                document.getElementById(
                    "categoryName"
                );

            const message =
                document.getElementById(
                    "categoryFormMessage"
                );

            const name =
                nameInput?.value.trim() || "";

            if (!name) {

                if (message) {

                    message.textContent =
                        "Please enter a category name.";

                }

                return;

            }

            if (message) {

                message.textContent =
                    "Adding category...";

            }

            try {

                await adminFetch(
                    "/admin/categories",
                    {
                        method: "POST",
                        body:
                            JSON.stringify({
                                name: name
                            })
                    }
                );

                closeCategoryModal();

                await loadCategories();

            } catch (error) {

                if (message) {

                    message.textContent =
                        error.message;

                }

            }

        }
    );

}


// ============================================================
// ORDERS
// ============================================================

async function loadOrders() {

    const tableBody =
        document.getElementById(
            "ordersTableBody"
        );

    const emptyState =
        document.getElementById(
            "ordersEmptyState"
        );

    if (!tableBody) {

        return;

    }

    tableBody.innerHTML = `
        <tr>

            <td
                colspan="7"
                style="
                    text-align:center;
                    padding:35px;
                    color:#89948e;
                "
            >
                Loading orders...
            </td>

        </tr>
    `;

    if (emptyState) {

        emptyState.hidden =
            true;

    }

    try {

        const data =
            await adminFetch(
                "/admin/orders"
            );

        adminOrders =
            Array.isArray(data)
                ? data
                : [];

        renderOrdersTable();

        setupOrderSearch();

        setupOrderStatusFilter();

    } catch (error) {

        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#c0392b;
                    "
                >
                    Failed to load orders.
                </td>

            </tr>
        `;

        showAdminError(
            error.message
        );

    }

}


// ============================================================
// RENDER ORDERS
// ============================================================

function renderOrdersTable(
    orders = adminOrders
) {

    const tableBody =
        document.getElementById(
            "ordersTableBody"
        );

    const emptyState =
        document.getElementById(
            "ordersEmptyState"
        );

    if (!tableBody) {

        return;

    }

    if (!orders.length) {

        tableBody.innerHTML =
            "";

        if (emptyState) {

            emptyState.hidden =
                false;

        }

        return;

    }

    if (emptyState) {

        emptyState.hidden =
            true;

    }

    tableBody.innerHTML =
        orders.map(
            function (order) {

                const status =
                    order.status ||
                    "pending";

                return `
                    <tr>

                        <td>
                            #${escapeHtml(order.id)}
                        </td>

                        <td>

                            <strong>
                                ${escapeHtml(
                                    order.customer_name ||
                                    "Unknown"
                                )}
                            </strong>

                            <br>

                            <small
                                style="
                                    color:#929c97;
                                "
                            >
                                ${escapeHtml(
                                    order.customer_email ||
                                    ""
                                )}
                            </small>

                        </td>

                        <td>
                            ${formatCurrency(
                                order.total
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.payment_method ||
                                "—"
                            )}
                        </td>

                        <td>

                            <span
                                class="status-badge status-${escapeAttribute(status)}"
                            >
                                ${escapeHtml(status)}
                            </span>

                        </td>

                        <td>
                            ${formatDate(
                                order.created_at
                            )}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="table-action"
                                data-view-order="${escapeAttribute(order.id)}"
                            >
                                View
                            </button>

                        </td>

                    </tr>
                `;

            }
        )
        .join("");


    tableBody
        .querySelectorAll(
            "[data-view-order]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                button.dataset.viewOrder
                            );

                        viewOrder(
                            id
                        );

                    }
                );

            }
        );

}


// ============================================================
// ORDER SEARCH
// ============================================================

function setupOrderSearch() {

    const input =
        document.getElementById(
            "orderSearchInput"
        );

    if (!input) {

        return;

    }

    input.oninput =
        function () {

            filterOrders();

        };

}


// ============================================================
// ORDER STATUS FILTER
// ============================================================

function setupOrderStatusFilter() {

    const select =
        document.getElementById(
            "orderStatusFilter"
        );

    if (!select) {

        return;

    }

    select.onchange =
        function () {

            filterOrders();

        };

}


// ============================================================
// FILTER ORDERS
// ============================================================

function filterOrders() {

    const searchInput =
        document.getElementById(
            "orderSearchInput"
        );

    const statusSelect =
        document.getElementById(
            "orderStatusFilter"
        );

    const query =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const status =
        statusSelect
            ? statusSelect.value
            : "";

    const filtered =
        adminOrders.filter(
            function (order) {

                const text =
                    `
                        ${order.id || ""}
                        ${order.customer_name || ""}
                        ${order.customer_email || ""}
                    `
                    .toLowerCase();

                const matchesSearch =
                    text.includes(
                        query
                    );

                const matchesStatus =
                    !status ||
                    order.status === status;

                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );

    renderOrdersTable(
        filtered
    );

}


// ============================================================
// VIEW ORDER
// ============================================================

async function viewOrder(
    orderId
) {

    try {

        const order =
            await adminFetch(
                `/admin/orders/${orderId}`
            );

        openOrderModal(
            order
        );

    } catch (error) {

        alert(
            error.message
        );

    }

}


// ============================================================
// OPEN ORDER MODAL
// ============================================================

function openOrderModal(
    order
) {

    const modal =
        document.getElementById(
            "orderModal"
        );

    const content =
        document.getElementById(
            "orderDetailsContent"
        );

    if (!modal || !content) {

        return;

    }

    const items =
        Array.isArray(order.items)
            ? order.items
            : [];

    const title =
        document.getElementById(
            "orderModalTitle"
        );

    if (title) {

        title.textContent =
            `Order #${order.id}`;

    }

    content.innerHTML = `

        <div class="order-detail-grid">

            <div class="order-detail-box">

                <span>
                    Customer
                </span>

                <strong>
                    ${escapeHtml(
                        order.customer_name ||
                        "Unknown"
                    )}
                </strong>

            </div>


            <div class="order-detail-box">

                <span>
                    Email
                </span>

                <strong>
                    ${escapeHtml(
                        order.customer_email ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="order-detail-box">

                <span>
                    Address
                </span>

                <strong>
                    ${escapeHtml(
                        order.address ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="order-detail-box">

                <span>
                    Payment
                </span>

                <strong>
                    ${escapeHtml(
                        order.payment_method ||
                        "—"
                    )}
                </strong>

            </div>

        </div>


        <div
            style="
                margin-bottom:18px;
            "
        >

            <label
                style="
                    display:block;
                    font-size:12px;
                    font-weight:700;
                    margin-bottom:7px;
                    color:#4a5951;
                "
            >
                Order status
            </label>

            <select
                id="orderStatusSelect"
                style="
                    width:100%;
                    height:44px;
                    border:1px solid #dce3df;
                    border-radius:9px;
                    padding:0 12px;
                    background:#fff;
                "
            >

                ${getStatusOptions(
                    order.status
                )}

            </select>

        </div>


        <h4
            style="
                margin-bottom:10px;
                color:#35453c;
                font-size:14px;
            "
        >
            Items
        </h4>


        <div class="order-items-list">

            ${
                items.length
                    ? items.map(
                        function (item) {

                            const quantity =
                                Number(
                                    item.qty
                                ) || 0;

                            const unitPrice =
                                Number(
                                    item.unit_price
                                ) || 0;

                            return `
                                <div
                                    class="order-item"
                                >

                                    <div>

                                        <div
                                            class="order-item-name"
                                        >
                                            ${escapeHtml(
                                                item.product_name ||
                                                "Product"
                                            )}
                                        </div>

                                        <div
                                            class="order-item-info"
                                        >
                                            Qty:
                                            ${quantity}
                                            ×
                                            ${formatCurrency(
                                                unitPrice
                                            )}
                                        </div>

                                    </div>

                                    <div
                                        class="order-item-price"
                                    >
                                        ${formatCurrency(
                                            unitPrice *
                                            quantity
                                        )}
                                    </div>

                                </div>
                            `;

                        }
                    ).join("")
                    : `
                        <div class="empty-state">

                            <p>
                                No order items found.
                            </p>

                        </div>
                    `
            }

        </div>


        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-top:18px;
                padding-top:16px;
                border-top:1px solid #e8ece9;
            "
        >

            <strong>
                Total
            </strong>

            <strong
                style="
                    color:#0b5d3b;
                    font-size:18px;
                "
            >
                ${formatCurrency(
                    order.total
                )}
            </strong>

        </div>


        <p
            id="orderStatusMessage"
            class="admin-form-message"
            style="margin-top:12px"
        ></p>

    `;

    modal.hidden =
        false;


    const actions =
        modal.querySelector(
            ".admin-modal-actions"
        );

    if (!actions) {

        return;

    }


    const oldButton =
        document.getElementById(
            "adminDynamicSaveOrderStatus"
        );

    if (oldButton) {

        oldButton.remove();

    }


    const saveButton =
        document.createElement(
            "button"
        );

    saveButton.type =
        "button";

    saveButton.id =
        "adminDynamicSaveOrderStatus";

    saveButton.className =
        "primary-admin-button";

    saveButton.textContent =
        "Save Status";

    actions.appendChild(
        saveButton
    );


    saveButton.addEventListener(
        "click",
        async function () {

            await saveOrderStatus(
                order.id
            );

        }
    );

}


// ============================================================
// CLOSE ORDER MODAL
// ============================================================

function closeOrderModal() {

    const modal =
        document.getElementById(
            "orderModal"
        );

    if (modal) {

        modal.hidden =
            true;

    }

}


// ============================================================
// ORDER MODAL EVENTS
// ============================================================

const closeOrderModalButton =
    document.getElementById(
        "closeOrderModal"
    );

const closeOrderDetailsButton =
    document.getElementById(
        "closeOrderDetailsButton"
    );

const orderModal =
    document.getElementById(
        "orderModal"
    );

if (closeOrderModalButton) {

    closeOrderModalButton.addEventListener(
        "click",
        closeOrderModal
    );

}

if (closeOrderDetailsButton) {

    closeOrderDetailsButton.addEventListener(
        "click",
        closeOrderModal
    );

}

if (orderModal) {

    const overlay =
        orderModal.querySelector(
            ".admin-modal-overlay"
        );

    if (overlay) {

        overlay.addEventListener(
            "click",
            closeOrderModal
        );

    }

}


// ============================================================
// SAVE ORDER STATUS
// ============================================================

async function saveOrderStatus(
    orderId
) {

    const select =
        document.getElementById(
            "orderStatusSelect"
        );

    const message =
        document.getElementById(
            "orderStatusMessage"
        );

    const status =
        select
            ? select.value
            : "pending";

    if (message) {

        message.textContent =
            "Updating status...";

    }

    try {

        await adminFetch(
            `/admin/orders/${orderId}/status`,
            {
                method: "PUT",
                body:
                    JSON.stringify({
                        status: status
                    })
            }
        );

        closeOrderModal();

        await loadOrders();

        await loadDashboard();

    } catch (error) {

        if (message) {

            message.textContent =
                error.message;

        }

    }

}


// ============================================================
// ORDER STATUS OPTIONS
// ============================================================

function getStatusOptions(
    currentStatus
) {

    const statuses = [

        "pending",

        "processing",

        "shipped",

        "finished",

        "cancelled"

    ];

    return statuses.map(
        function (status) {

            const selected =
                status === currentStatus
                    ? "selected"
                    : "";

            const label =
                status
                    .charAt(0)
                    .toUpperCase() +
                status.slice(1);

            return `
                <option
                    value="${escapeAttribute(status)}"
                    ${selected}
                >
                    ${escapeHtml(label)}
                </option>
            `;

        }
    )
    .join("");

}


// ============================================================
// CUSTOMERS
// ============================================================

async function loadUsers() {

    const tableBody =
        document.getElementById(
            "customersTableBody"
        );

    const emptyState =
        document.getElementById(
            "customersEmptyState"
        );

    if (!tableBody) {

        return;

    }

    tableBody.innerHTML = `
        <tr>

            <td
                colspan="4"
                style="
                    text-align:center;
                    padding:35px;
                    color:#89948e;
                "
            >
                Loading customers...
            </td>

        </tr>
    `;

    if (emptyState) {

        emptyState.hidden =
            true;

    }

    try {

        const data =
            await adminFetch(
                "/admin/users"
            );

        adminUsers =
            Array.isArray(data)
                ? data
                : [];

        renderUsersTable();

        setupCustomerSearch();

    } catch (error) {

        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#c0392b;
                    "
                >
                    Failed to load customers.
                </td>

            </tr>
        `;

        showAdminError(
            error.message
        );

    }

}


// ============================================================
// RENDER CUSTOMERS
// ============================================================

function renderUsersTable(
    users = adminUsers
) {

    const tableBody =
        document.getElementById(
            "customersTableBody"
        );

    const emptyState =
        document.getElementById(
            "customersEmptyState"
        );

    if (!tableBody) {

        return;

    }

    if (!users.length) {

        tableBody.innerHTML =
            "";

        if (emptyState) {

            emptyState.hidden =
                false;

        }

        return;

    }

    if (emptyState) {

        emptyState.hidden =
            true;

    }

    tableBody.innerHTML =
        users.map(
            function (user) {

                const initial =
                    user.name
                        ? user.name
                            .charAt(0)
                            .toUpperCase()
                        : "U";

                const accountType =
                    user.is_admin
                        ? "Admin"
                        : "Customer";

                const accountClass =
                    user.is_admin
                        ? "status-finished"
                        : "status-processing";

                return `
                    <tr>

                        <td>

                            <div
                                class="admin-product-cell"
                            >

                                <div
                                    class="admin-user-avatar"
                                >
                                    ${escapeHtml(
                                        initial
                                    )}
                                </div>

                                <div>

                                    <div
                                        class="admin-product-name"
                                    >
                                        ${escapeHtml(
                                            user.name ||
                                            "Unknown"
                                        )}
                                    </div>

                                </div>

                            </div>

                        </td>


                        <td>
                            ${escapeHtml(
                                user.email ||
                                "—"
                            )}
                        </td>


                        <td>

                            <span
                                class="status-badge ${accountClass}"
                            >
                                ${accountType}
                            </span>

                        </td>


                        <td>
                            #${escapeHtml(
                                user.id
                            )}
                        </td>

                    </tr>
                `;

            }
        )
        .join("");

}


// ============================================================
// CUSTOMER SEARCH
// ============================================================

function setupCustomerSearch() {

    const input =
        document.getElementById(
            "customerSearchInput"
        );

    if (!input) {

        return;

    }

    input.oninput =
        function () {

            const query =
                input.value
                    .trim()
                    .toLowerCase();

            const filtered =
                adminUsers.filter(
                    function (user) {

                        return (
                            String(
                                user.name || ""
                            )
                            .toLowerCase()
                            .includes(query)

                            ||

                            String(
                                user.email || ""
                            )
                            .toLowerCase()
                            .includes(query)

                            ||

                            String(
                                user.id || ""
                            )
                            .includes(query)
                        );

                    }
                );

            renderUsersTable(
                filtered
            );

        };

}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(value) {

    const number =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 2
        }
    ).format(number);

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {

    if (!value) {

        return "—";

    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }

    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(value) {

    return escapeHtml(
        value
    );

}


// ============================================================
// INITIALIZE ADMIN
// ============================================================

async function initializeAdmin() {

    const hasAccess =
        await verifyAdminAccess();

    if (!hasAccess) {

        return;

    }

    updateActiveNav(
        "dashboardSection"
    );

    await loadAdminSection(
        "dashboardSection"
    );

}


// ============================================================
// START ADMIN
// ============================================================

initializeAdmin();


// ============================================================
// ADMIN.JS LOADED
// ============================================================

console.log(
    "Naija Cart admin.js is working correctly."
);