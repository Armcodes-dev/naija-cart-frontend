// ============================================================
// NAIJA CART — ui.js
// Handles:
// - Category dropdown
// - Product search
// - Toast messages
// - UI modals
// ============================================================


// ============================================================
// CATEGORY DROPDOWN
// ============================================================

const categorySelect =
    document.querySelector(".category-select");

const categoryDropdown =
    document.getElementById("categoryDropdown");

const categoryOptions =
    document.querySelectorAll(".category-option");


// ============================================================
// OPEN / CLOSE CATEGORY DROPDOWN
// ============================================================

if (categorySelect && categoryDropdown) {

    categorySelect.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            const isOpen =
                categoryDropdown.classList.contains("show");

            if (isOpen) {

                categoryDropdown.classList.remove("show");

                categoryDropdown.style.display = "none";

            } else {

                categoryDropdown.classList.add("show");

                categoryDropdown.style.display = "block";

            }

        }
    );

}


// ============================================================
// CATEGORY OPTIONS
// ============================================================

categoryOptions.forEach(
    function (option) {

        option.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                const selectedCategory =
                    this.dataset.category;


                // ------------------------------------------------
                // CHANGE CATEGORY BUTTON TEXT
                // ------------------------------------------------

                if (categorySelect) {

                    categorySelect.innerHTML = `
                        ${this.textContent.trim()}
                        <span>⌄</span>
                    `;

                    categorySelect.dataset.category =
                        selectedCategory;

                }


                // ------------------------------------------------
                // REMOVE ACTIVE FROM ALL OPTIONS
                // ------------------------------------------------

                categoryOptions.forEach(
                    function (item) {

                        item.classList.remove("active");

                    }
                );


                // ------------------------------------------------
                // ACTIVATE SELECTED OPTION
                // ------------------------------------------------

                this.classList.add("active");


                // ------------------------------------------------
                // FILTER PRODUCTS
                // ------------------------------------------------

                if (
                    typeof filterProducts ===
                    "function"
                ) {

                    filterProducts(
                        selectedCategory
                    );

                }


                // ------------------------------------------------
                // CLOSE DROPDOWN
                // ------------------------------------------------

                if (categoryDropdown) {

                    categoryDropdown.classList.remove(
                        "show"
                    );

                    categoryDropdown.style.display =
                        "none";

                }


                // ------------------------------------------------
                // SCROLL TO PRODUCTS
                // ------------------------------------------------

                const productsGrid =
                    document.getElementById(
                        "productsGrid"
                    );

                if (productsGrid) {

                    productsGrid.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    }
);


// ============================================================
// CLOSE DROPDOWN WHEN CLICKING OUTSIDE
// ============================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            categoryDropdown &&
            categorySelect &&
            !categoryDropdown.contains(
                event.target
            ) &&
            !categorySelect.contains(
                event.target
            )
        ) {

            categoryDropdown.classList.remove(
                "show"
            );

            categoryDropdown.style.display =
                "none";

        }

    }
);


// ============================================================
// INITIAL DROPDOWN STATE
// ============================================================

if (categoryDropdown) {

    categoryDropdown.classList.remove("show");

    categoryDropdown.style.display = "none";

}


// ============================================================
// PRODUCT SEARCH
// ============================================================

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchButton =
    document.querySelector(
        ".search-button"
    );


// ============================================================
// SEARCH PRODUCTS
// ============================================================

function searchProducts() {

    if (!searchInput) {

        return;

    }


    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    // --------------------------------------------------------
    // EMPTY SEARCH
    // --------------------------------------------------------

    if (searchTerm === "") {

        if (
            typeof displayProducts ===
            "function"
        ) {

            displayProducts(products);

        }

        return;

    }


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    const results =
        products.filter(
            function (product) {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();

                const category =
                    String(
                        product.category || ""
                    ).toLowerCase();

                const description =
                    String(
                        product.description || ""
                    ).toLowerCase();

                return (
                    name.includes(searchTerm) ||
                    category.includes(searchTerm) ||
                    description.includes(searchTerm)
                );

            }
        );


    // --------------------------------------------------------
    // DISPLAY RESULTS
    // --------------------------------------------------------

    if (
        typeof displayProducts ===
        "function"
    ) {

        displayProducts(results);

    }


    // --------------------------------------------------------
    // SCROLL TO PRODUCTS
    // --------------------------------------------------------

    const productsGrid =
        document.getElementById(
            "productsGrid"
        );

    if (productsGrid) {

        productsGrid.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    console.log(
        "Searching for:",
        searchTerm
    );

}


// ============================================================
// SEARCH BUTTON
// ============================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


// ============================================================
// SEARCH WITH ENTER
// ============================================================

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                searchProducts();

            }

        }
    );

}


// ============================================================
// SHOW TOAST
// ============================================================

function showToast(
    message,
    type = "success"
) {

    let toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id = "toast";

        toast.className = "toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;

    toast.className =
        `toast ${type} show`;


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


// ============================================================
// SHOW MODAL
// ============================================================

function showModal(
    title,
    message
) {

    let modal =
        document.getElementById(
            "uiModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id = "uiModal";

        modal.className =
            "ui-modal";


        modal.innerHTML = `

            <div class="ui-modal-content">

                <button
                    class="ui-modal-close"
                    type="button"
                    aria-label="Close">

                    ×

                </button>

                <h2
                    class="ui-modal-title">
                </h2>

                <p
                    class="ui-modal-message">
                </p>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        const closeButton =
            modal.querySelector(
                ".ui-modal-close"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeModal
            );

        }


        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeModal();

                }

            }
        );

    }


    modal.querySelector(
        ".ui-modal-title"
    ).textContent =
        title;


    modal.querySelector(
        ".ui-modal-message"
    ).textContent =
        message;


    modal.classList.add(
        "show"
    );

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {

    const modal =
        document.getElementById(
            "uiModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    showToast(
        message,
        "error"
    );

}


// ============================================================
// SHOW SUCCESS
// ============================================================

function showSuccess(message) {

    showToast(
        message,
        "success"
    );

}


// ============================================================
// STATUS
// ============================================================

console.log(
    "ui.js is working correctly."
);
