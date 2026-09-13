// ============================================================
// NAIJA CART — api.js
// Handles communication with Flask backend
// ============================================================


// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL = "https://naija-cart-backend.onrender.com/api";


// ============================================================
// IMAGE PATH
// ============================================================

function getProductImagePath(image) {

    if (!image) {
        return "";
    }

    const imagePath =
        String(image).trim();


    // --------------------------------------------------------
    // ALREADY A FULL URL
    // --------------------------------------------------------

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {

        return imagePath;

    }


    // --------------------------------------------------------
    // ALREADY STARTS WITH /
    // --------------------------------------------------------

    if (imagePath.startsWith("/")) {

        return imagePath;

    }


    // --------------------------------------------------------
    // PRODUCT IMAGE PATH FROM DATABASE
    // --------------------------------------------------------

    if (
        imagePath.includes("assents/") ||
        imagePath.includes("assets/")
    ) {

        return imagePath;

    }


    // --------------------------------------------------------
    // IMAGE FILE NAME ONLY
    // --------------------------------------------------------

    return `assents/images/${imagePath}`;

}


// ============================================================
// GET ALL PRODUCTS
// ============================================================

async function fetchProducts() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/products`
            );


        // ----------------------------------------------------
        // CHECK RESPONSE
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                `Failed to fetch products: ${response.status}`
            );

        }


        // ----------------------------------------------------
        // CONVERT RESPONSE TO JSON
        // ----------------------------------------------------

        const data =
            await response.json();


        console.log(
            "RAW PRODUCTS FROM BACKEND:",
            data
        );


        // ----------------------------------------------------
        // MAKE SURE DATA IS AN ARRAY
        // ----------------------------------------------------

        if (!Array.isArray(data)) {

            console.error(
                "Backend did not return an array:",
                data
            );

            return [];

        }


        // ====================================================
        // NORMALIZE PRODUCT DATA
        // ====================================================

        const normalizedProducts =
            data.map(
                function (product) {

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

                        description:
                            product.description ??
                            "",

                        price:
                            Number(
                                product.price ?? 0
                            ),

                        stock:
                            Number(
                                product.stock ?? 0
                            ),

                        image:
                            getProductImagePath(
                                product.image
                            ),

                        category:
                            product.category ??
                            product.category_name ??
                            "",

                        reviews:
                            Number(
                                product.reviews ??
                                product.rating ??
                                0
                            )

                    };

                }
            );


        console.log(
            "NORMALIZED PRODUCTS:",
            normalizedProducts
        );


        return normalizedProducts;

    }


    catch (error) {

        console.error(
            "Error fetching products:",
            error
        );

        return [];

    }

}


// ============================================================
// STATUS
// ============================================================

console.log(
    "api.js is working correctly."
);