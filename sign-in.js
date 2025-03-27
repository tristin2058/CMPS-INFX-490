import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ✅ Prevent unauthorized access to the dashboard
onAuthStateChanged(auth, (user) => {
    const isOnDashboard = window.location.pathname.includes("dashboard.html");
    const isOnLoginPage = window.location.pathname.includes("index.html") || window.location.pathname === "/";

    if (user) {
        if (isOnLoginPage) {
            window.location.href = "dashboard.html"; // Redirect to dashboard if logged in
        }
    } else {
        if (isOnDashboard) {
            window.location.href = "index.html"; // Redirect to login if not logged in
        }
    }
});

// ✅ Toggle between Login & Signup forms
document.getElementById("showLogin")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("registerForm").reset(); // Clear register form inputs
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
});

document.getElementById("showRegister")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("loginForm").reset(); // Clear login form inputs
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "block";
});

// ✅ Register User
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;

        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert("User registered successfully!");
                window.location.href = "dashboard.html"; // Redirect to dashboard
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

// ✅ Login User
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert("Logged in successfully!");
                window.location.href = "dashboard.html"; // Redirect to dashboard
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

// ✅ Logout User
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.style.display = "block"; // Ensure logout button is visible
    logoutButton.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                alert("Logged out successfully!");
                window.location.href = "index.html"; // Redirect to login page
            })
            .catch((error) => {
                alert(error.message);
            });
    });

}

document.addEventListener("DOMContentLoaded", async () => {
    const quoteDisplay = document.getElementById('quoteDisplay');

    try {
        // ✅ Prevent API caching by adding a timestamp to the URL
        let response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://zenquotes.io/api/random')}?nocache=${new Date().getTime()}`);
        let data = await response.json();
        let parsedData = JSON.parse(data.contents); // Parse the JSON from the proxy

        console.log("ZenQuotes API Response:", parsedData); // Debugging

        if (parsedData && Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].q && parsedData[0].a) {
            quoteDisplay.innerText = `"${parsedData[0].q}" - ${parsedData[0].a}`;
        } else {
            throw new Error("Invalid data format from ZenQuotes");
        }
    } catch (error) {
        console.error("Error fetching quote from ZenQuotes:", error);

        // ✅ Fallback to Quotable API
        try {
            let response = await fetch(`https://api.quotable.io/random?nocache=${new Date().getTime()}`);
            let data = await response.json();

            console.log("Quotable API Response:", data); // Debugging

            if (data && data.content && data.author) {
                quoteDisplay.innerText = `"${data.content}" - ${data.author}`;
            } else {
                throw new Error("Invalid data format from Quotable API");
            }
        } catch (fallbackError) {
            console.error("Error fetching quote from Quotable API:", fallbackError);

            // ✅ Show a hardcoded motivational message as a last resort
            quoteDisplay.innerText = "Keep pushing towards your goals! 💪";
        }
    }
});

