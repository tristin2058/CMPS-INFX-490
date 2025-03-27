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
    updateDoc,
    query,
    where,
    getDocs
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
const historyList = document.getElementById("historyList");

// Profile and logout elements
const profileNav = document.getElementById("profileNav");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const logoutButton = document.getElementById("logoutButton");
const userEmailDisplay = document.getElementById("userEmail");

// Previous state for undo functionality
let previousState = {};

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

    const userDocRef = doc(db, "users", user.uid); // Use UID as document ID
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        
        // Check if the data is from today
        const lastUpdateDate = new Date(data.date);
        const today = new Date();
        if (lastUpdateDate.toDateString() !== today.toDateString()) {
            // If the data is not from today, reset the values
            await setDoc(userDocRef, {
                steps: 0,
                caloriesBurned: 0,
                waterIntake: 0,
                date: today.toISOString()
            }, { merge: true });

            stepsDisplay.textContent = `🚶 0`;
            caloriesDisplay.textContent = `🔥 0 kcal`;
            waterDisplay.textContent = `💧 0L`;
        } else {
            // Display the stored values (use default 0 if missing)
            stepsDisplay.textContent = `🚶 ${data.steps || 0}`;
            caloriesDisplay.textContent = `🔥 ${data.caloriesBurned || 0} kcal`;
            waterDisplay.textContent = `💧 ${data.waterIntake || 0}L`;
        }

        // Save the current state for undo functionality
        previousState = { ...data };
    }

    // Load and display historical data
    loadHistoricalData(user.uid);
};

// Function to load and display historical data
const loadHistoricalData = async (uid) => {
    const historyQuery = query(collection(db, `users/${uid}/history`));
    const querySnapshot = await getDocs(historyQuery);

    historyList.innerHTML = ""; // Clear existing history

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = new Date(data.date).toDateString();

        // Skip today's data
        if (date === new Date().toDateString()) return;

        const historyItem = document.createElement("div");
        historyItem.classList.add("history-item");
        historyItem.innerHTML = `
            <h3>${date}</h3>
            <p>Steps: 🚶 ${data.steps || 0}</p>
            <p>Calories Burned: 🔥 ${data.caloriesBurned || 0} kcal</p>
            <p>Water Intake: 💧 ${data.waterIntake || 0}L</p>
        `;
        historyList.appendChild(historyItem);
    });
};

// Function to save and update cumulative health data
const saveHealthData = async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("User not authenticated. Please log in.");
        return;
    }

    const userDocRef = doc(db, "users", user.uid); // Use UID as document ID

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

        // Save historical data
        const historyDocRef = doc(collection(db, `users/${user.uid}/history`), new Date().toISOString());
        await setDoc(historyDocRef, {
            steps: updatedSteps,
            caloriesBurned: updatedCalories,
            waterIntake: updatedWater,
            date: new Date().toISOString()
        });

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

    const userDocRef = doc(db, "users", user.uid); // Use UID as document ID

    try {
        // Restore the previous state
        await setDoc(userDocRef, previousState, { merge: true });

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
        loadHealthData();
    } else {
        window.location.href = "sign-in.html"; // Redirect to login if not authenticated
    }
});

// Attach event listeners to buttons
saveButton.addEventListener("click", () => {
    console.log("Save button clicked"); // Debug log
    saveHealthData();
});
undoButton.addEventListener("click", () => {
    console.log("Undo button clicked"); // Debug log
    undoLastEntry();
});