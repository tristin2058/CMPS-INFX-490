import { auth, db } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Select input fields and buttons
const stepsInput = document.getElementById("steps");
const waterInput = document.getElementById("waterIntake");
const saveButton = document.querySelector(".btn-save");

// Display elements
const stepsDisplay = document.getElementById("stepsDisplay");
const caloriesDisplay = document.getElementById("caloriesBurnedDisplay");
const waterDisplay = document.getElementById("waterIntakeDisplay");

// Profile and logout elements
const profileNav = document.getElementById("profileNav");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const logoutButton = document.getElementById("logoutButton");
const userEmailDisplay = document.getElementById("userEmail");

// Show Profile Modal
profileNav.addEventListener("click", () => {
    profileModal.classList.add("show");
});

// Close Profile Modal
closeProfile.addEventListener("click", () => {
    profileModal.classList.remove("show");
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

// Function to calculate calories burned from steps
const calculateCaloriesFromSteps = (steps) => {
    const caloriesPerStep = 0.04; // Average calories burned per step
    return steps * caloriesPerStep;
};

// Function to load and display saved health data
const loadHealthData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        
        // Display the stored values (use default 0 if missing)
        stepsDisplay.textContent = `🚶 ${data.steps || 0}`;
        caloriesDisplay.textContent = `🔥 ${data.caloriesBurned || 0} kcal`;
        waterDisplay.textContent = `💧 ${data.waterIntake || 0}L`;
    }
};

// Function to save and update cumulative health data
const saveHealthData = async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("User not authenticated. Please log in.");
        return;
    }

    const userId = user.uid;
    const userDocRef = doc(db, "users", userId);

    try {
        // Retrieve current data first
        const userSnap = await getDoc(userDocRef);
        let currentData = userSnap.exists() ? userSnap.data() : {};

        // Parse existing values, default to 0 if missing
        let previousSteps = parseInt(currentData.steps) || 0;
        let previousCalories = parseInt(currentData.caloriesBurned) || 0;
        let previousWater = parseFloat(currentData.waterIntake) || 0;

        // Get new values from input fields
        let newSteps = parseInt(stepsInput.value) || 0;
        let newCalories = calculateCaloriesFromSteps(newSteps);
        let newWater = parseFloat(waterInput.value) || 0;

        // Add new values to the existing totals
        let updatedSteps = previousSteps + newSteps;
        let updatedCalories = previousCalories + newCalories;
        let updatedWater = previousWater + newWater;

        // Update Firestore with new cumulative data
        await setDoc(userDocRef, {
            steps: updatedSteps,
            caloriesBurned: updatedCalories,
            waterIntake: updatedWater,
            date: new Date().toISOString()
        }, { merge: true });

        alert("Data updated successfully!");

        // Update the displayed values
        stepsDisplay.textContent = `🚶 ${updatedSteps}`;
        caloriesDisplay.textContent = `🔥 ${updatedCalories.toFixed(2)} kcal`;
        waterDisplay.textContent = `💧 ${updatedWater}L`;

        // Clear input fields after saving
        stepsInput.value = "";
        waterInput.value = "";

    } catch (error) {
        console.error("Error saving data: ", error);
        alert("Failed to save data.");
    }
};

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmailDisplay.textContent = `Logged in as: ${user.email}`;
        loadHealthData();
    } else {
        window.location.href = "sign-in.html"; // Redirect to login if not authenticated
    }
});

// Attach event listener to save button
saveButton.addEventListener("click", saveHealthData);