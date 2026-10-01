// ============================================================
// NAIJA CART — auth.js
// Handles:
// - Registration
// - Login
// - Logout
// - Remembering the logged-in user
// - Authentication token
// - Checking the current user
// - Admin redirect
// - Account UI
// - Cart/wishlist auth notifications
// ============================================================


// ============================================================
// CURRENT USER
// ============================================================

let currentUser = null;


// ============================================================
// STORAGE KEYS
// ============================================================

const USER_STORAGE_KEY = "naijaCartUser";
const TOKEN_STORAGE_KEY = "naijaCartToken";


// ============================================================
// API BASE URL
// ============================================================
// Local computer:
//     http://127.0.0.1:5000/api
//
// Live website:
//     https://naija-cart-backend.onrender.com/api
// ============================================================

const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:5000/api"
        : "https://naija-cart-backend.onrender.com/api";


// ============================================================
// GET RETURN URL
// ============================================================

function getReturnUrl() {

    const currentPath =
        window.location.pathname +
        window.location.search +
        window.location.hash;

    // Never return an admin to the normal shop page
    if (
        currentPath.endsWith("/admin.html") ||
        currentPath.endsWith("admin.html")
    ) {
        return "index.html";
    }

    return currentPath;
}


// ============================================================
// SAVE RETURN URL
// ============================================================

function saveReturnUrl() {

    const returnUrl =
        getReturnUrl();

    sessionStorage.setItem(
        "naijaCartReturnUrl",
        returnUrl
    );
}


// ============================================================
// GET SAVED RETURN URL
// ============================================================

function getSavedReturnUrl() {

    return sessionStorage.getItem(
        "naijaCartReturnUrl"
    );
}


// ============================================================
// CLEAR SAVED RETURN URL
// ============================================================

function clearSavedReturnUrl() {

    sessionStorage.removeItem(
        "naijaCartReturnUrl"
    );
}


// ============================================================
// NOTIFY AUTH CHANGE
// ============================================================

function notifyAuthChanged() {

    document.dispatchEvent(
        new CustomEvent("authChanged")
    );
}


// ============================================================
// GET SAVED USER
// ============================================================

function getCurrentUser() {

    const savedUser =
        localStorage.getItem(
            USER_STORAGE_KEY
        );

    if (!savedUser) {

        currentUser = null;

        return null;
    }

    try {

        currentUser =
            JSON.parse(savedUser);

        return currentUser;

    }

    catch (error) {

        console.error(
            "Could not read saved user:",
            error
        );

        localStorage.removeItem(
            USER_STORAGE_KEY
        );

        currentUser = null;

        return null;
    }
}


// ============================================================
// GET SAVED TOKEN
// ============================================================

function getAuthToken() {

    return localStorage.getItem(
        TOKEN_STORAGE_KEY
    );
}


// ============================================================
// SAVE LOGIN SESSION
// ============================================================

function saveUser(user, token) {

    currentUser = user;

    localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(user)
    );

    localStorage.setItem(
        TOKEN_STORAGE_KEY,
        token
    );

    notifyAuthChanged();
}


// ============================================================
// LOG OUT USER
// ============================================================

function logoutUser() {

    currentUser = null;

    localStorage.removeItem(
        USER_STORAGE_KEY
    );

    localStorage.removeItem(
        TOKEN_STORAGE_KEY
    );

    console.log(
        "User logged out"
    );

    notifyAuthChanged();
}


// ============================================================
// CHECK LOGIN STATUS
// ============================================================

function isLoggedIn() {

    return (
        getCurrentUser() !== null &&
        getAuthToken() !== null
    );
}


// ============================================================
// CHECK IF CURRENT USER IS ADMIN
// ============================================================

function isAdmin() {

    const user =
        getCurrentUser();

    if (!user) {

        return false;
    }

    return user.is_admin === true;
}


// ============================================================
// REDIRECT AFTER LOGIN
// ============================================================

function redirectAfterLogin() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }

    // ADMIN
    if (user.is_admin === true) {

        clearSavedReturnUrl();

        window.location.href =
            "admin.html";

        return;
    }

    // CUSTOMER
    const returnUrl =
        getSavedReturnUrl();

    clearSavedReturnUrl();

    if (returnUrl) {

        window.location.href =
            returnUrl;

        return;
    }

    window.location.href =
        "index.html";
}


// ============================================================
// REGISTER USER
// ============================================================

async function registerUser(userData) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name:
                            userData.name,

                        email:
                            userData.email,

                        password:
                            userData.password,

                        address:
                            userData.address,

                        state:
                            userData.state
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Registration failed"
            );
        }

        console.log(
            "Registration successful:",
            data
        );

        return data;

    }

    catch (error) {

        console.error(
            "Registration error:",
            error
        );

        throw error;
    }
}


// ============================================================
// LOGIN USER
// ============================================================

async function loginUser(userData) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email:
                            userData.email,

                        password:
                            userData.password
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Login failed"
            );
        }

        // Save account and token
        saveUser(
            data.user,
            data.token
        );

        console.log(
            "Login successful:",
            data.user
        );

        return data;

    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );

        throw error;
    }
}


// ============================================================
// CHECK CURRENT USER WITH BACKEND
// ============================================================

async function checkCurrentUser() {

    const token =
        getAuthToken();

    if (!token) {

        return null;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/me`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            logoutUser();

            return null;
        }

        currentUser =
            data.user;

        localStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(data.user)
        );

        notifyAuthChanged();

        return data.user;

    }

    catch (error) {

        console.error(
            "Could not check current user:",
            error
        );

        return null;
    }
}


// ============================================================
// PROTECT ADMIN PAGE
// ============================================================

async function checkAdminAccess() {

    const token =
        getAuthToken();

    if (!token) {

        window.location.href =
            "index.html";

        return null;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/me`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            logoutUser();

            window.location.href =
                "index.html";

            return null;
        }

        currentUser =
            data.user;

        localStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(data.user)
        );

        // REAL ADMIN CHECK
        if (
            data.user.is_admin !== true
        ) {

            console.warn(
                "Admin access denied."
            );

            window.location.href =
                "index.html";

            return null;
        }

        console.log(
            "Admin access verified."
        );

        return data.user;

    }

    catch (error) {

        console.error(
            "Admin authentication check failed:",
            error
        );

        window.location.href =
            "index.html";

        return null;
    }
}


// ============================================================
// INITIALIZE AUTH
// ============================================================

getCurrentUser();

console.log(
    "auth.js is working correctly."
);


// ============================================================
// ACCOUNT ELEMENTS
// ============================================================

const accountButton =
    document.getElementById(
        "accountButton"
    );

const accountModal =
    document.getElementById(
        "accountModal"
    );

const accountClose =
    document.getElementById(
        "accountClose"
    );


// HEADER ACCOUNT TEXT

const accountName =
    document.getElementById(
        "accountName"
    );

const accountText =
    document.getElementById(
        "accountText"
    );


// ============================================================
// OPEN ACCOUNT MODAL
// ============================================================

if (
    accountButton &&
    accountModal
) {

    accountButton.addEventListener(
        "click",
        function () {

            if (!isLoggedIn()) {

                saveReturnUrl();
            }

            accountModal.hidden = false;

            document.body.classList.add(
                "account-open"
            );

            updateAccountUI();
        }
    );
}


// ============================================================
// CLOSE ACCOUNT MODAL
// ============================================================

if (
    accountClose &&
    accountModal
) {

    accountClose.addEventListener(
        "click",
        function () {

            accountModal.hidden = true;

            document.body.classList.remove(
                "account-open"
            );
        }
    );
}


// ============================================================
// ACCOUNT OVERLAY
// ============================================================

const accountOverlay =
    document.querySelector(
        ".account-modal-overlay"
    );

if (
    accountOverlay &&
    accountModal
) {

    accountOverlay.addEventListener(
        "click",
        function () {

            accountModal.hidden = true;

            document.body.classList.remove(
                "account-open"
            );
        }
    );
}


// ============================================================
// ACCOUNT PANELS
// ============================================================

const showRegister =
    document.getElementById(
        "showRegister"
    );

const showSignin =
    document.getElementById(
        "showSignin"
    );

const signinPanel =
    document.getElementById(
        "signinPanel"
    );

const registerPanel =
    document.getElementById(
        "registerPanel"
    );


// ============================================================
// SWITCH TO REGISTER
// ============================================================

if (
    showRegister &&
    signinPanel &&
    registerPanel
) {

    showRegister.addEventListener(
        "click",
        function () {

            signinPanel.hidden = true;

            registerPanel.hidden = false;
        }
    );
}


// ============================================================
// SWITCH BACK TO SIGN IN
// ============================================================

if (
    showSignin &&
    signinPanel &&
    registerPanel
) {

    showSignin.addEventListener(
        "click",
        function () {

            registerPanel.hidden = true;

            signinPanel.hidden = false;
        }
    );
}


// ============================================================
// REGISTER FORM
// ============================================================

const registerForm =
    document.getElementById(
        "registerForm"
    );

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById(
                    "registerName"
                ).value.trim();

            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "registerPassword"
                ).value;

            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;

            const address =
                document.getElementById(
                    "registerAddress"
                ).value.trim();

            const state =
                document.getElementById(
                    "registerState"
                ).value.trim();

            const registerMessage =
                document.getElementById(
                    "registerMessage"
                );

            // CHECK PASSWORDS

            if (
                password !==
                confirmPassword
            ) {

                registerMessage.textContent =
                    "Passwords do not match.";

                return;
            }

            try {

                registerMessage.textContent =
                    "Creating account...";

                const data =
                    await registerUser({

                        name:
                            name,

                        email:
                            email,

                        password:
                            password,

                        address:
                            address,

                        state:
                            state
                    });

                registerMessage.textContent =
                    data.message ||
                    "Account created successfully!";

                console.log(
                    "Account created:",
                    data
                );

                // Go back to sign in

                registerPanel.hidden =
                    true;

                signinPanel.hidden =
                    false;

            }

            catch (error) {

                registerMessage.textContent =
                    error.message;

                console.error(
                    "Registration failed:",
                    error
                );
            }
        }
    );
}


// ============================================================
// LOGGED-IN ACCOUNT ELEMENTS
// ============================================================

const loggedInPanel =
    document.getElementById(
        "loggedInPanel"
    );

const loggedInName =
    document.getElementById(
        "loggedInName"
    );

const loggedInEmail =
    document.getElementById(
        "loggedInEmail"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


// ============================================================
// UPDATE ACCOUNT UI
// ============================================================

function updateAccountUI() {

    const user =
        getCurrentUser();

    const token =
        getAuthToken();

    // USER IS LOGGED IN

    if (
        user &&
        token
    ) {

        // HEADER NAME

        if (accountName) {

            accountName.textContent =
                user.name;
        }

        // HEADER TEXT

        if (accountText) {

            accountText.textContent =
                "My Account";
        }

        // HIDE SIGN-IN PANEL

        if (signinPanel) {

            signinPanel.hidden =
                true;
        }

        // HIDE REGISTER PANEL

        if (registerPanel) {

            registerPanel.hidden =
                true;
        }

        // SHOW LOGGED-IN PANEL

        if (loggedInPanel) {

            loggedInPanel.hidden =
                false;
        }

        // USER NAME

        if (loggedInName) {

            loggedInName.textContent =
                user.name;
        }

        // USER EMAIL

        if (loggedInEmail) {

            loggedInEmail.textContent =
                user.email;
        }
    }

    // USER IS LOGGED OUT

    else {

        // RESTORE HEADER

        if (accountName) {

            accountName.textContent =
                "Sign In";
        }

        if (accountText) {

            accountText.textContent =
                "My Account";
        }

        // HIDE LOGGED-IN PANEL

        if (loggedInPanel) {

            loggedInPanel.hidden =
                true;
        }

        // SHOW SIGN-IN PANEL

        if (signinPanel) {

            signinPanel.hidden =
                false;
        }

        // HIDE REGISTER PANEL

        if (registerPanel) {

            registerPanel.hidden =
                true;
        }
    }
}


// ============================================================
// LOGOUT BUTTON
// ============================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            logoutUser();

            updateAccountUI();

            console.log(
                "Logged out successfully."
            );
        }
    );
}


// ============================================================
// SIGN IN FORM
// ============================================================

const signinForm =
    document.getElementById(
        "signinForm"
    );

const signinMessage =
    document.getElementById(
        "signinMessage"
    );

if (signinForm) {

    signinForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById(
                    "signinEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "signinPassword"
                ).value;

            try {

                if (signinMessage) {

                    signinMessage.textContent =
                        "Signing in...";
                }

                const data =
                    await loginUser({

                        email:
                            email,

                        password:
                            password
                    });

                console.log(
                    "LOGIN SUCCESS:",
                    data
                );

                if (signinMessage) {

                    signinMessage.textContent =
                        "Login successful!";
                }

                // Update account UI

                updateAccountUI();

                // Clear form

                signinForm.reset();

                // REDIRECT

                setTimeout(
                    function () {

                        redirectAfterLogin();

                    },
                    300
                );

            }

            catch (error) {

                console.error(
                    "LOGIN FAILED:",
                    error
                );

                if (signinMessage) {

                    signinMessage.textContent =
                        error.message;
                }
            }
        }
    );
}


// ============================================================
// FINAL UI UPDATE
// ============================================================

updateAccountUI();


// ============================================================
// INITIAL AUTH CHANGE NOTIFICATION
// ============================================================

setTimeout(
    function () {

        notifyAuthChanged();

    },
    0
);