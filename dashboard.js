import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const dashboardNav = document.getElementById("dashboardNav");
const profileNav = document.getElementById("profileNav");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");

// Show Profile Modal
profileNav.addEventListener("click", () => {
    profileModal.classList.add("show");
});

// Close Profile Modal
closeProfile.addEventListener("click", () => {
    profileModal.classList.remove("show");
});

// Logout Functionality
const logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            alert("Logged out successfully!");
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Error logging out:", error);
        });
});

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("userEmail").innerText = `Logged in as: ${user.email}`;
    } else {
        window.location.href = "index.html";
    }
});



