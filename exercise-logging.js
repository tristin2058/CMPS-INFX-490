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
const exerciseTypeSelect = document.getElementById("exerciseType");
const dynamicInputs = document.getElementById("dynamicInputs");
const saveExerciseButton = document.querySelector(".btn-save-exercise");
const undoExerciseButton = document.querySelector(".btn-undo-exercise");

// Display elements
const exerciseDisplay = document.getElementById("exerciseDisplay");
const durationDisplay = document.getElementById("durationDisplay");

// Profile and logout elements
const profileNav = document.getElementById("profileNav");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const logoutButton = document.getElementById("logoutButton");
const userEmailDisplay = document.getElementById("userEmail");

// Previous state for undo functionality
let previousExerciseState = {};

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

// Function to load and display saved exercise data
const loadExerciseData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "exercise-logging", user.email); // Use email as document ID
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        
        // Display the stored values (use default 0 if missing)
        exerciseDisplay.textContent = `🏋️ ${data.exercise || "None"}`;
        durationDisplay.textContent = `⏱️ ${data.duration || 0} mins`;

        // Save the current state for undo functionality
        previousExerciseState = { ...data };
    }
};

// Function to save and update exercise data
const saveExerciseData = async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("User not authenticated. Please log in.");
        return;
    }

    const exerciseType = exerciseTypeSelect.value;
    const userDocRef = doc(db, `exercise-logging/${exerciseType}`, user.email); // Use email as document ID

    try {
        // Retrieve current data first
        const userSnap = await getDoc(userDocRef);
        let currentData = userSnap.exists() ? userSnap.data() : {};

        // Parse existing values, default to 0 if missing
        let previousExercise = currentData.exercise || "None";
        let previousDuration = parseInt(currentData.duration) || 0;

        // Get new values from input fields
        let newExercise = document.getElementById("exercise").value || "None";
        let newDuration = parseInt(document.getElementById("duration").value) || 0;

        // Validate inputs to ensure no negative values
        if (newDuration < 0) {
            alert("Duration cannot be negative.");
            return;
        }

        // Add new values to the existing totals
        let updatedExercise = newExercise;
        let updatedDuration = previousDuration + newDuration;

        // Save the current state for undo functionality
        previousExerciseState = { exercise: previousExercise, duration: previousDuration };

        // Update Firestore with new cumulative data
        await setDoc(userDocRef, {
            exercise: updatedExercise,
            duration: updatedDuration,
            date: new Date().toISOString()
        }, { merge: true });

        alert("Exercise data updated successfully!");

        // Update the displayed values
        exerciseDisplay.textContent = `🏋️ ${updatedExercise}`;
        durationDisplay.textContent = `⏱️ ${updatedDuration} mins`;

        // Show the undo button
        undoExerciseButton.style.display = "inline-block";

        // Clear input fields after saving
        document.getElementById("exercise").value = "";
        document.getElementById("duration").value = "";

    } catch (error) {
        console.error("Error saving exercise data: ", error);
        alert("Failed to save exercise data.");
    }
};

// Function to undo the last exercise entry
const undoLastExerciseEntry = async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("User not authenticated. Please log in.");
        return;
    }

    const exerciseType = exerciseTypeSelect.value;
    const userDocRef = doc(db, `exercise-logging/${exerciseType}`, user.email); // Use email as document ID

    try {
        // Restore the previous state
        await setDoc(userDocRef, previousExerciseState, { merge: true });

        alert("Last exercise entry undone successfully!");

        // Update the displayed values
        exerciseDisplay.textContent = `🏋️ ${previousExerciseState.exercise || "None"}`;
        durationDisplay.textContent = `⏱️ ${previousExerciseState.duration || 0} mins`;

        // Hide the undo button
        undoExerciseButton.style.display = "none";

    } catch (error) {
        console.error("Error undoing last exercise entry: ", error);
        alert("Failed to undo last exercise entry.");
    }
};

// Function to update input fields based on exercise type
const updateInputFields = () => {
    const exerciseType = exerciseTypeSelect.value;
    dynamicInputs.innerHTML = ""; // Clear existing inputs

    if (exerciseType === "cardio") {
        dynamicInputs.innerHTML = `
            <div class="input-box">
                <label for="exercise">Type of Cardio:</label>
                <input type="text" id="exercise" placeholder="Enter type of cardio" required>
            </div>
            <div class="input-box">
                <label for="duration">Distance (km):</label>
                <input type="number" id="duration" placeholder="Enter distance" required>
            </div>
        `;
    } else if (exerciseType === "workouts") {
        dynamicInputs.innerHTML = `
            <div class="input-box">
                <label for="exercise">Type of Workout:</label>
                <input type="text" id="exercise" placeholder="Enter type of workout" required>
            </div>
            <div class="input-box">
                <label for="reps">Reps:</label>
                <input type="number" id="reps" placeholder="Enter reps" required>
            </div>
            <div class="input-box">
                <label for="sets">Sets:</label>
                <input type="number" id="sets" placeholder="Enter sets" required>
            </div>
        `;
    }
};

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmailDisplay.textContent = `Logged in as: ${user.email}`;
        loadExerciseData();
    } else {
        window.location.href = "sign-in.html"; // Redirect to login if not authenticated
    }
});

// Attach event listeners to buttons
saveExerciseButton.addEventListener("click", saveExerciseData);
undoExerciseButton.addEventListener("click", undoLastExerciseEntry);
exerciseTypeSelect.addEventListener("change", updateInputFields);

// Initialize input fields based on default exercise type
updateInputFields();