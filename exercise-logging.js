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
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Select input fields and buttons
const exerciseTypeSelect = document.getElementById("exerciseType");
const dynamicInputs = document.getElementById("dynamicInputs");
const saveExerciseButton = document.querySelector(".btn-save-exercise");
const undoExerciseButton = document.querySelector(".btn-undo-exercise");

// Display elements
const cardioTypeDisplay = document.getElementById("cardioTypeDisplay");
const cardioDistanceDisplay = document.getElementById("cardioDistanceDisplay");
const workoutTypeDisplay = document.getElementById("workoutTypeDisplay");
const workoutRepsDisplay = document.getElementById("workoutRepsDisplay");
const workoutSetsDisplay = document.getElementById("workoutSetsDisplay");
const exerciseList = document.getElementById("exerciseList");

// Profile and logout elements
const profileNav = document.getElementById("profileNav");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const logoutButton = document.getElementById("logoutButton");
const userEmailDisplay = document.getElementById("userEmail");

// Previous state for undo functionality
let previousExerciseState = {};

// Function to load and display saved exercise data
const loadExerciseData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const exerciseType = exerciseTypeSelect.value;
    const userDocRef = doc(db, `Exercise Log/${exerciseType}/User's Exercise`, user.uid); // Use UID as document ID
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        
        // Display the stored values (use default 0 if missing)
        if (exerciseType === "Cardio") {
            cardioTypeDisplay.textContent = data.exercise || "None";
            cardioDistanceDisplay.textContent = `${data.duration || 0} km`;
        } else if (exerciseType === "Workouts") {
            workoutTypeDisplay.textContent = data.exercise || "None";
            workoutRepsDisplay.textContent = data.reps || 0;
            workoutSetsDisplay.textContent = data.sets || 0;
        }

        // Save the current state for undo functionality
        previousExerciseState = { ...data };
    }

    // Load and display historical exercise data
    loadExerciseHistory(user.uid);
};

// Function to load and display historical exercise data for both Cardio and Workouts
const loadExerciseHistory = async (uid) => {
    const cardioQuery = collection(db, `Exercise Log/Cardio/User's Exercise/${uid}/exercises`);
    const workoutsQuery = collection(db, `Exercise Log/Workouts/User's Exercise/${uid}/exercises`);

    const [cardioSnapshot, workoutsSnapshot] = await Promise.all([
        getDocs(cardioQuery),
        getDocs(workoutsQuery)
    ]);

    exerciseList.innerHTML = ""; // Clear existing exercises

    // Display Cardio exercises
    cardioSnapshot.forEach((doc) => {
        const data = doc.data();
        const exerciseItem = document.createElement("div");
        exerciseItem.classList.add("exercise-item");

        exerciseItem.innerHTML = `
            <h3>${new Date(data.date).toLocaleString()}</h3>
            <p>Type of Cardio: ${data.exercise}</p>
            <p>Distance: ${data.duration} km</p>
        `;

        exerciseList.appendChild(exerciseItem);
    });

    // Display Workouts exercises
    workoutsSnapshot.forEach((doc) => {
        const data = doc.data();
        const exerciseItem = document.createElement("div");
        exerciseItem.classList.add("exercise-item");

        exerciseItem.innerHTML = `
            <h3>${new Date(data.date).toLocaleString()}</h3>
            <p>Type of Workout: ${data.exercise}</p>
            <p>Reps: ${data.reps}</p>
            <p>Sets: ${data.sets}</p>
        `;

        exerciseList.appendChild(exerciseItem);
    });
};

// Function to save and update exercise data
const saveExerciseData = async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("User not authenticated. Please log in.");
        return;
    }

    const exerciseType = exerciseTypeSelect.value;
    const userDocRef = doc(db, `Exercise Log/${exerciseType}/User's Exercise`, user.uid); // Use UID as document ID

    try {
        // Retrieve current data first
        const userSnap = await getDoc(userDocRef);
        let currentData = userSnap.exists() ? userSnap.data() : {};

        // Parse existing values, default to 0 if missing
        let previousExercise = currentData.exercise || "None";
        let previousDuration = parseInt(currentData.duration) || 0;
        let previousReps = parseInt(currentData.reps) || 0;
        let previousSets = parseInt(currentData.sets) || 0;

        // Get new values from input fields
        let newExercise = document.getElementById("exercise").value || "None";
        let newDuration = parseInt(document.getElementById("duration")?.value) || 0;
        let newReps = parseInt(document.getElementById("reps")?.value) || 0;
        let newSets = parseInt(document.getElementById("sets")?.value) || 0;

        // Validate inputs to ensure no negative values
        if (newDuration < 0 || newReps < 0 || newSets < 0) {
            alert("Duration, reps, and sets cannot be negative.");
            return;
        }

        // Prepare data to be saved based on exercise type
        let updatedData = {
            exercise: newExercise,
            date: new Date().toISOString()
        };

        if (exerciseType === "Cardio") {
            updatedData.duration = previousDuration + newDuration;
        } else if (exerciseType === "Workouts") {
            updatedData.reps = previousReps + newReps;
            updatedData.sets = previousSets + newSets;
        }

        // Save the current state for undo functionality
        previousExerciseState = { ...currentData };

        // Update Firestore with new cumulative data
        await setDoc(userDocRef, updatedData, { merge: true });

        console.log("Cumulative data saved:", updatedData);

        // Save historical exercise data
        const exerciseHistoryRef = collection(db, `Exercise Log/${exerciseType}/User's Exercise/${user.uid}/Previous Exercises`);
        await addDoc(exerciseHistoryRef, {
            exercise: newExercise,
            duration: newDuration,
            reps: newReps,
            sets: newSets,
            date: new Date().toISOString()
        });

        console.log("Historical data saved:", {
            exercise: newExercise,
            duration: newDuration,
            reps: newReps,
            sets: newSets,
            date: new Date().toISOString()
        });

        alert("Exercise data updated successfully!");

        // Update the displayed values
        if (exerciseType === "Cardio") {
            cardioTypeDisplay.textContent = newExercise;
            cardioDistanceDisplay.textContent = `${updatedData.duration} km`;
        } else if (exerciseType === "Workouts") {
            workoutTypeDisplay.textContent = newExercise;
            workoutRepsDisplay.textContent = updatedData.reps;
            workoutSetsDisplay.textContent = updatedData.sets;
        }

        // Show the undo button
        undoExerciseButton.style.display = "inline-block";

        // Clear input fields after saving
        document.getElementById("exercise").value = "";
        if (document.getElementById("duration")) document.getElementById("duration").value = "";
        if (document.getElementById("reps")) document.getElementById("reps").value = "";
        if (document.getElementById("sets")) document.getElementById("sets").value = "";

        // Reload exercise history
        loadExerciseHistory(user.uid);

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
    const userDocRef = doc(db, `Exercise_Log/${exerciseType}/User's_Exercise`, user.uid); // Use UID as document ID

    try {
        // Restore the previous state
        await setDoc(userDocRef, previousExerciseState, { merge: true });

        alert("Last exercise entry undone successfully!");

        // Update the displayed values
        if (exerciseType === "Cardio") {
            cardioTypeDisplay.textContent = previousExerciseState.exercise || "None";
            cardioDistanceDisplay.textContent = `${previousExerciseState.duration || 0} km`;
        } else if (exerciseType === "Workouts") {
            workoutTypeDisplay.textContent = previousExerciseState.exercise || "None";
            workoutRepsDisplay.textContent = previousExerciseState.reps || 0;
            workoutSetsDisplay.textContent = previousExerciseState.sets || 0;
        }

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

    if (exerciseType === "Cardio") {
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
    } else if (exerciseType === "Workouts") {
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

document.addEventListener("DOMContentLoaded", updateInputFields);
exerciseTypeSelect.addEventListener("change", updateInputFields);

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
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