import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Profile and logout elements
const userEmailDisplay = document.getElementById("userEmail");
const logoutButton = document.getElementById("logoutButton");

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmailDisplay.textContent = `Logged in as: ${user.email}`;
    } else {
        window.location.href = "sign-in.html"; // Redirect to login if not authenticated
    }
});

// Logout Functionality
logoutButton.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            alert("Logged out successfully!");
            window.location.href = "sign-in.html";
        })
        .catch((error) => {
            console.error("Error logging out:", error);
        });
});