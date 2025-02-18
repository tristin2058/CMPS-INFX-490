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
const waterAmountInput = document.getElementById("waterAmount");
const waterUnitSelect = document.getElementById("waterUnit");
const saveButton = document.querySelector(".btn-save");
const undoButton = document.querySelector(".btn-undo");

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

// Previous state for undo functionality
let previousState = {};

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

// Function to convert water intake to liters
const convertWaterToLiters = (amount, unit) => {
    switch (unit) {
        case "cups":
            return amount * 0.24; // 1 cup = 0.24 liters
        case "gallons":
            return amount * 3.785; // 1 gallon = 3.785 liters
        case "liters":
        default:
            return amount;
    }
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

        // Save the current state for undo functionality
        previousState = { ...data };
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
        let newWaterAmount = parseFloat(waterAmountInput.value) || 0;

        // Validate inputs to ensure no negative values
        if (newSteps < 0 || newWaterAmount < 0) {
            alert("Steps and water intake cannot be negative.");
            return;
        }

        let newCalories = calculateCaloriesFromSteps(newSteps);
        let newWaterUnit = waterUnitSelect.value;
        let newWater = convertWaterToLiters(newWaterAmount, newWaterUnit);

        // Add new values to the existing totals
        let updatedSteps = previousSteps + newSteps;
        let updatedCalories = previousCalories + newCalories;
        let updatedWater = previousWater + newWater;

        // Save the current state for undo functionality
        previousState = { steps: previousSteps, caloriesBurned: previousCalories, waterIntake: previousWater };

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
        waterDisplay.textContent = `💧 ${updatedWater.toFixed(2)}L`;

        // Show the undo button
        undoButton.style.display = "inline-block";

        // Clear input fields after saving
        stepsInput.value = "";
        waterAmountInput.value = "";
        waterUnitSelect.value = "liters";

    } catch (error) {
        console.error("Error saving data: ", error);
        alert("Failed to save data.");
    }
};

// Function to undo the last entry
const undoLastEntry = async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("User not authenticated. Please log in.");
        return;
    }

    const userId = user.uid;
    const userDocRef = doc(db, "users", userId);

    try {
        // Restore the previous state
        await setDoc(userDocRef, previousState, { merge: true });

        alert("Last entry undone successfully!");

        // Update the displayed values
        stepsDisplay.textContent = `🚶 ${previousState.steps || 0}`;
        caloriesDisplay.textContent = `🔥 ${previousState.caloriesBurned.toFixed(2) || 0} kcal`;
        waterDisplay.textContent = `💧 ${previousState.waterIntake.toFixed(2) || 0}L`;

        // Hide the undo button
        undoButton.style.display = "none";

    } catch (error) {
        console.error("Error undoing last entry: ", error);
        alert("Failed to undo last entry.");
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

// Attach event listeners to buttons
saveButton.addEventListener("click", saveHealthData);
undoButton.addEventListener("click", undoLastEntry);