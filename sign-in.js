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