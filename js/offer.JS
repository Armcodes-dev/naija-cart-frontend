// ============================================================
// NAIJA CART — OFFER COUNTDOWN
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Offer countdown JS connected!");

    const daysElement =
        document.getElementById("offerDays");

    const hoursElement =
        document.getElementById("offerHours");

    const minutesElement =
        document.getElementById("offerMinutes");

    const secondsElement =
        document.getElementById("offerSeconds");


    // Check that the HTML elements exist

    if (
        !daysElement ||
        !hoursElement ||
        !minutesElement ||
        !secondsElement
    ) {

        console.error(
            "Countdown elements were not found."
        );

        return;
    }


    // ========================================================
    // STARTING TIME
    // ========================================================

    let totalSeconds =
        (2 * 24 * 60 * 60) +
        (14 * 60 * 60) +
        (36 * 60) +
        48;


    // ========================================================
    // UPDATE TIMER
    // ========================================================

    function updateTimer() {

        const days =
            Math.floor(
                totalSeconds / (24 * 60 * 60)
            );


        const hours =
            Math.floor(
                (totalSeconds % (24 * 60 * 60)) /
                (60 * 60)
            );


        const minutes =
            Math.floor(
                (totalSeconds % (60 * 60)) /
                60
            );


        const seconds =
            totalSeconds % 60;


        // Display numbers

        daysElement.textContent =
            String(days).padStart(2, "0");

        hoursElement.textContent =
            String(hours).padStart(2, "0");

        minutesElement.textContent =
            String(minutes).padStart(2, "0");

        secondsElement.textContent =
            String(seconds).padStart(2, "0");


        console.log(
            days + "d " +
            hours + "h " +
            minutes + "m " +
            seconds + "s"
        );


        // ====================================================
        // COUNT DOWN
        // ====================================================

        if (totalSeconds > 0) {

            totalSeconds--;

        }

        else {

            clearInterval(countdown);

            console.log(
                "NaijaCart offer has ended."
            );

        }

    }


    // ========================================================
    // RUN IMMEDIATELY
    // ========================================================

    updateTimer();


    // ========================================================
    // RUN EVERY SECOND
    // ========================================================

    const countdown =
        setInterval(
            updateTimer,
            1000
        );

});