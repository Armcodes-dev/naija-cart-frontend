// =========================================================
// NAIJACART — app.js
// Main application entry point
//
// Handles:
// - Application startup
// - User synchronization
// - Cart synchronization
// - Wishlist synchronization
// - Hero slider
// - Shop Now button
// - Explore Categories button
//
// NOTE:
// Cart, Checkout and Paystack are handled by cart.js
// =========================================================


// =========================================================
// GET CART
// Compatibility helper for other JavaScript files
// =========================================================

function getCart() {

    if (typeof cart !== "undefined" && Array.isArray(cart)) {

        return cart;

    }

    return [];

}


// =========================================================
// UPDATE CHECKOUT DISPLAY
// Compatibility helper
// cart.js handles the actual checkout rendering
// =========================================================

function updateCheckoutDisplay() {

    if (
        typeof renderCheckoutItems ===
        "function"
    ) {

        renderCheckoutItems();

    }

}


// =========================================================
// APPLICATION START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "NaijaCart application started"
        );


        // =====================================================
        // CHECK CURRENT USER
        // =====================================================

        const user =
            typeof getCurrentUser ===
            "function"
                ? getCurrentUser()
                : null;


        if (user) {

            console.log(
                "Welcome back, " +
                (user.name || user.email || "Customer")
            );

        }

        else {

            console.log(
                "No user is currently signed in."
            );

        }


        // =====================================================
        // SYNCHRONIZE CART
        // =====================================================

        if (
            typeof syncCartWithCurrentUser ===
            "function"
        ) {

            syncCartWithCurrentUser();

        }


        // =====================================================
        // SYNCHRONIZE WISHLIST
        // =====================================================

        if (
            typeof syncWishlistWithCurrentUser ===
            "function"
        ) {

            syncWishlistWithCurrentUser();

        }


        // =====================================================
        // UPDATE CART DISPLAY
        // =====================================================

        if (
            typeof updateCartDisplayOnly ===
            "function"
        ) {

            updateCartDisplayOnly();

        }


        // =====================================================
        // UPDATE WISHLIST COUNT
        // =====================================================

        if (
            typeof updateWishlistCount ===
            "function"
        ) {

            updateWishlistCount();

        }


        // =====================================================
        // UPDATE WISHLIST BUTTONS
        // =====================================================

        if (
            typeof updateWishlistButtons ===
            "function"
        ) {

            updateWishlistButtons();

        }


        // =====================================================
        // HERO SLIDER
        // =====================================================

        const slides =
            document.querySelectorAll(
                ".hero-slide"
            );

        const previousButton =
            document.getElementById(
                "sliderPrevious"
            );

        const nextButton =
            document.getElementById(
                "sliderNext"
            );

        const sliderDots =
            document.querySelectorAll(
                ".slider-dot"
            );

        const heroSlider =
            document.querySelector(
                ".hero-slider"
            );


        let currentSlide = 0;

        let sliderInterval = null;


        // =====================================================
        // SHOW SLIDE
        // =====================================================

        function showSlide(index) {

            if (!slides.length) {

                return;

            }


            // -----------------------------------------------
            // KEEP INDEX IN RANGE
            // -----------------------------------------------

            if (index >= slides.length) {

                currentSlide = 0;

            }

            else if (index < 0) {

                currentSlide =
                    slides.length - 1;

            }

            else {

                currentSlide = index;

            }


            // -----------------------------------------------
            // REMOVE ACTIVE FROM ALL SLIDES
            // -----------------------------------------------

            slides.forEach(
                function (slide) {

                    slide.classList.remove(
                        "active"
                    );

                }
            );


            // -----------------------------------------------
            // REMOVE ACTIVE FROM ALL DOTS
            // -----------------------------------------------

            sliderDots.forEach(
                function (dot) {

                    dot.classList.remove(
                        "active"
                    );

                }
            );


            // -----------------------------------------------
            // ACTIVATE CURRENT SLIDE
            // -----------------------------------------------

            if (slides[currentSlide]) {

                slides[currentSlide].classList.add(
                    "active"
                );

            }


            // -----------------------------------------------
            // ACTIVATE CURRENT DOT
            // -----------------------------------------------

            if (sliderDots[currentSlide]) {

                sliderDots[currentSlide].classList.add(
                    "active"
                );

            }

        }


        // =====================================================
        // NEXT SLIDE
        // =====================================================

        function nextSlide() {

            showSlide(
                currentSlide + 1
            );

        }


        // =====================================================
        // PREVIOUS SLIDE
        // =====================================================

        function previousSlide() {

            showSlide(
                currentSlide - 1
            );

        }


        // =====================================================
        // START SLIDER
        // =====================================================

        function startSlider() {

            if (slides.length <= 1) {

                return;

            }


            clearInterval(
                sliderInterval
            );


            sliderInterval =
                setInterval(
                    function () {

                        nextSlide();

                    },
                    5000
                );

        }


        // =====================================================
        // RESTART SLIDER
        // =====================================================

        function restartSlider() {

            clearInterval(
                sliderInterval
            );

            startSlider();

        }


        // =====================================================
        // NEXT BUTTON
        // =====================================================

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                function () {

                    nextSlide();

                    restartSlider();

                }
            );

        }


        // =====================================================
        // PREVIOUS BUTTON
        // =====================================================

        if (previousButton) {

            previousButton.addEventListener(
                "click",
                function () {

                    previousSlide();

                    restartSlider();

                }
            );

        }


        // =====================================================
        // SLIDER DOTS
        // =====================================================

        sliderDots.forEach(
            function (dot, index) {

                dot.addEventListener(
                    "click",
                    function () {

                        showSlide(index);

                        restartSlider();

                    }
                );

            }
        );


        // =====================================================
        // PAUSE SLIDER ON HOVER
        // =====================================================

        if (heroSlider) {

            heroSlider.addEventListener(
                "mouseenter",
                function () {

                    clearInterval(
                        sliderInterval
                    );

                }
            );


            heroSlider.addEventListener(
                "mouseleave",
                function () {

                    startSlider();

                }
            );

        }


        // =====================================================
        // INITIAL SLIDE
        // =====================================================

        if (slides.length) {

            showSlide(0);

            startSlider();

        }


        // =====================================================
        // SHOP NOW BUTTON
        // =====================================================

        const shopButton =
            document.querySelector(
                ".shop-button"
            );


        if (shopButton) {

            shopButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const productsSection =
                        document.getElementById(
                            "products"
                        );


                    if (productsSection) {

                        productsSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        }


        // =====================================================
        // EXPLORE CATEGORIES BUTTON
        // =====================================================

        const exploreButton =
            document.querySelector(
                ".explore-button"
            );


        if (exploreButton) {

            exploreButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const categoriesSection =
                        document.getElementById(
                            "categories"
                        );


                    if (categoriesSection) {

                        categoriesSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        }


        // =====================================================
        // APPLICATION READY
        // =====================================================

        console.log(
            "NaijaCart is ready."
        );

    }
);