// ============================================================
// NAIJA CART — slider.js
// Handles:
// - Automatic hero slider
// - Previous / Next buttons
// - Slider dots
// - Pause when mouse is over slider
// ============================================================


// ============================================================
// GET SLIDER ELEMENTS
// ============================================================

const slider = document.querySelector(".hero-slider");

const slides = document.querySelectorAll(".hero-slide");

const prevButton = document.querySelector(".slider-prev");

const nextButton = document.querySelector(".slider-next");

const sliderDots = document.querySelectorAll(".slider-dot");


// ============================================================
// SLIDER STATE
// ============================================================

let currentSlide = 0;

let sliderTimer = null;

const slideInterval = 5000;


// ============================================================
// SHOW SLIDE
// ============================================================

function showSlide(index) {

    if (slides.length === 0) {
        return;
    }


    // --------------------------------------------------------
    // HANDLE INDEX
    // --------------------------------------------------------

    if (index >= slides.length) {
        currentSlide = 0;
    }

    else if (index < 0) {
        currentSlide = slides.length - 1;
    }

    else {
        currentSlide = index;
    }


    // --------------------------------------------------------
    // REMOVE ACTIVE FROM ALL SLIDES
    // --------------------------------------------------------

    slides.forEach(function (slide) {

        slide.classList.remove("active");

    });


    // --------------------------------------------------------
    // REMOVE ACTIVE FROM ALL DOTS
    // --------------------------------------------------------

    sliderDots.forEach(function (dot) {

        dot.classList.remove("active");

    });


    // --------------------------------------------------------
    // ACTIVATE CURRENT SLIDE
    // --------------------------------------------------------

    slides[currentSlide].classList.add("active");


    // --------------------------------------------------------
    // ACTIVATE CURRENT DOT
    // --------------------------------------------------------

    if (sliderDots[currentSlide]) {

        sliderDots[currentSlide].classList.add("active");

    }

}


// ============================================================
// NEXT SLIDE
// ============================================================

function nextSlide() {

    showSlide(currentSlide + 1);

}


// ============================================================
// PREVIOUS SLIDE
// ============================================================

function previousSlide() {

    showSlide(currentSlide - 1);

}


// ============================================================
// START AUTOMATIC SLIDER
// ============================================================

function startSlider() {

    stopSlider();


    sliderTimer = setInterval(

        function () {

            nextSlide();

        },

        slideInterval

    );

}


// ============================================================
// STOP AUTOMATIC SLIDER
// ============================================================

function stopSlider() {

    if (sliderTimer) {

        clearInterval(sliderTimer);

        sliderTimer = null;

    }

}


// ============================================================
// NEXT BUTTON
// ============================================================

if (nextButton) {

    nextButton.addEventListener(

        "click",

        function () {

            nextSlide();

            startSlider();

        }

    );

}


// ============================================================
// PREVIOUS BUTTON
// ============================================================

if (prevButton) {

    prevButton.addEventListener(

        "click",

        function () {

            previousSlide();

            startSlider();

        }

    );

}


// ============================================================
// SLIDER DOTS
// ============================================================

sliderDots.forEach(

    function (dot, index) {

        dot.addEventListener(

            "click",

            function () {

                showSlide(index);

                startSlider();

            }

        );

    }

);


// ============================================================
// PAUSE WHEN MOUSE IS OVER SLIDER
// ============================================================

if (slider) {

    slider.addEventListener(

        "mouseenter",

        function () {

            stopSlider();

        }

    );


    slider.addEventListener(

        "mouseleave",

        function () {

            startSlider();

        }

    );

}


// ============================================================
// INITIALIZE SLIDER
// ============================================================

if (slides.length > 0) {

    showSlide(0);

    startSlider();

}


// ============================================================
// STATUS
// ============================================================

console.log("slider.js is working correctly.");