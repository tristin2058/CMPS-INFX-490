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
    addDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Select input fields and buttons
const exerciseTypeSelect = document.getElementById("exerciseType");
const dynamicInputs = document.getElementById("dynamicInputs");
const saveExerciseButton = document.querySelector(".btn-save-exercise");
const undoExerciseButton = document.querySelector(".btn-undo-exercise");

// Profile and logout elements
const profileNav = document.getElementById("profileNav");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const logoutButton = document.getElementById("logoutButton");
const userEmailDisplay = document.getElementById("userEmail");

// Previous state for undo functionality
let previousExerciseState = {};

// Function to format the date as YYYY-MM-DD
function getFormattedDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Function to load and display saved exercise data
const loadExerciseData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const exerciseType = exerciseTypeSelect.value;
    const userDocRef = doc(db, `Exercise Log/${exerciseType}/User's Exercise`, user.uid); // Use UID as document ID
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
        const data = userSnap.data();

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
    const formattedDate = getFormattedDate(new Date()); // Use the formatted date
    const userDocRef = doc(db, `Exercise Log/${exerciseType}/User's Exercise/${user.uid}/Exercises`, formattedDate); // Use the formatted date as the document ID

    try {
        // Retrieve current data first
        const userSnap = await getDoc(userDocRef);
        let currentData = userSnap.exists() ? userSnap.data() : {};

        // Parse existing values, default to 0 if missing
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
            date: formattedDate
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

        alert("Exercise data updated successfully!");

        // Show the undo button
        undoExerciseButton.style.display = "inline-block";

        // Clear input fields after saving
        document.getElementById("exercise").value = "";
        if (document.getElementById("duration")) document.getElementById("duration").value = "";
        if (document.getElementById("reps")) document.getElementById("reps").value = "";
        if (document.getElementById("sets")) document.getElementById("sets").value = "";

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

    if (!confirm("Are you sure you want to undo the last exercise entry?")) {
        return;
    }

    const exerciseType = exerciseTypeSelect.value;
    const exerciseHistoryCollection = collection(db, `Exercise Log/${exerciseType}/User's Exercise/${user.uid}/Exercises`);

    try {
        // Fetch the most recent entry
        const querySnapshot = await getDocs(exerciseHistoryCollection);
        if (querySnapshot.empty) {
            alert("No entries to undo.");
            return;
        }

        // Find the most recent entry
        let mostRecentDoc = null;
        querySnapshot.forEach((doc) => {
            if (!mostRecentDoc || doc.id > mostRecentDoc.id) {
                mostRecentDoc = doc;
            }
        });

        if (mostRecentDoc) {
            // Delete the most recent entry
            const mostRecentDocRef = doc(db, `Exercise Log/${exerciseType}/User's Exercise/${user.uid}/Exercises`, mostRecentDoc.id);
            await deleteDoc(mostRecentDocRef);

            alert("Last exercise entry undone successfully!");

            // Hide the undo button
            undoExerciseButton.style.display = "none";

        } else {
            alert("No entries to undo.");
        }
    } catch (error) {
        console.error("Error undoing last exercise entry: ", error);
        alert("Failed to undo last exercise entry.");
    }
};

// Function to update input fields based on exercise type
const updateInputFields = () => {
    const exerciseType = exerciseTypeSelect.value;

    if (exerciseType === "Cardio") {
        dynamicInputs.innerHTML = `
            <div class="input-box">
                <label for="exercise">Type of Cardio:</label>
                <input type="text" id="exercise" placeholder="Enter type of cardio">
            </div>
            <div class="input-box">
                <label for="duration">Distance (km):</label>
                <input type="number" id="duration" placeholder="Enter distance in km">
            </div>
        `;
    } else if (exerciseType === "Workouts") {
        dynamicInputs.innerHTML = `
            <div class="input-box">
                <label for="exercise">Type of Workout:</label>
                <input type="text" id="exercise" placeholder="Enter type of workout">
            </div>
            <div class="input-box">
                <label for="reps">Reps:</label>
                <input type="number" id="reps" placeholder="Enter number of reps">
            </div>
            <div class="input-box">
                <label for="sets">Sets:</label>
                <input type="number" id="sets" placeholder="Enter number of sets">
            </div>
        `;
    }
};

// Array of exercise types, muscle groups, and difficulties that the API accepts
const exerciseTypes = ["cardio", "strength", "olympic_weightlifting", "plyometrics", "powerlifting", "stretching", "strongman"];
const muscleGroups = ["abdominals", "abductors", "adductors", "biceps", "calves", "chest", "forearms", "glutes", "hamstrings", "lats",
    "lower_back", "middle_back", "neck", "quadriceps", "traps", "triceps"];
const difficulties = ["beginner", "intermediate", "expert"];

// Function to fetch exercises from the API
const fetchExercise = async () => {
    const apiUrlBase = `https://api.api-ninjas.com/v1/exercises?`;
    const apiKey = 'FczpYHvvGE/ZFZDn55+wvQ==vj8Ydg6keRgZUrX9';
    const queryParams = [];

    const name = document.getElementById("lookupExerciseName").value.trim();
    const type = document.getElementById("lookupExerciseType").value.trim();
    const muscle = document.getElementById("lookupMuscle").value.trim();
    const difficulty = document.getElementById("lookupDifficulty").value.trim();

    if (name) queryParams.push(`name=${encodeURIComponent(name)}`);
    if (type) queryParams.push(`type=${encodeURIComponent(type)}`);
    if (muscle) queryParams.push(`muscle=${encodeURIComponent(muscle)}`);
    if (difficulty) queryParams.push(`difficulty=${encodeURIComponent(difficulty)}`);

    // Check if all input fields are empty
    if (queryParams.length === 0) {
        const exerciseOutput = document.getElementById("exerciseOutput");
        exerciseOutput.innerHTML = "<p>No exercises found.</p>";
        return;
    }

    const apiUrl = apiUrlBase + queryParams.join("&");

    try {
        const response = await fetch(apiUrl, {
            headers: { 'X-Api-Key': apiKey }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch exercise data');
        }

        const exercises = await response.json();
        displayExercises(exercises);
    } catch (error) {
        console.error("Error fetching exercise data: ", error);
        alert("Failed to fetch exercise data.");
    }
};

// Pagination variables
let currentPage = 0;
let exercises = [];

// Function to display fetched exercises with pagination
const displayExercises = (fetchedExercises) => {
    exercises = fetchedExercises;
    currentPage = 0;
    showExercisePage(currentPage);
};

// Function to show a specific exercise page
const showExercisePage = (page) => {
    const exerciseOutput = document.getElementById("exerciseOutput");
    exerciseOutput.innerHTML = "";

    if (exercises.length === 0) {
        exerciseOutput.innerHTML = "<p>No exercises found.</p>";
        return;
    }

    const exercise = exercises[page];
    const exerciseItem = document.createElement("div");
    exerciseItem.classList.add("exercise-item");

    exerciseItem.innerHTML = `
        <h3>${exercise.name}</h3>
        <p>Type: ${exercise.type}</p>
        <p>Muscle: ${exercise.muscle}</p>
        <p>Difficulty: ${exercise.difficulty}</p>
        <p>Instructions: ${exercise.instructions}</p>
    `;

    exerciseOutput.appendChild(exerciseItem);

    // Add pagination controls
    const paginationControls = document.createElement("div");
    paginationControls.classList.add("pagination-controls");

    if (page > 0) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.onclick = () => showExercisePage(page - 1);
        paginationControls.appendChild(prevButton);
    }

    if (page < exercises.length - 1) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.onclick = () => showExercisePage(page + 1);
        paginationControls.appendChild(nextButton);
    }

    exerciseOutput.appendChild(paginationControls);
};

// Function to show suggestions for input fields
function showSuggestions(inputElement, category) {
    let suggestionsDiv = document.getElementById(`${category}Suggestions`);
    suggestionsDiv.innerHTML = ""; // Clear previous suggestions
    let query = inputElement.value.toLowerCase();

    if (query.length === 0) {
        suggestionsDiv.style.display = "none";
        return;
    }

    let options = [];
    if (category === "type") options = exerciseTypes;
    else if (category === "muscle") options = muscleGroups;
    else if (category === "difficulty") options = difficulties;

    let filteredOptions = options.filter(option => option.toLowerCase().startsWith(query));

    if (filteredOptions.length > 0) {
        filteredOptions.forEach(option => {
            let suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.textContent = option;
            suggestionItem.onclick = () => {
                inputElement.value = option; // Auto-fill input
                suggestionsDiv.style.display = "none"; // Hide suggestions
            };
            suggestionsDiv.appendChild(suggestionItem);
        });
        suggestionsDiv.style.display = "block";
    } else {
        suggestionsDiv.style.display = "none";
    }
}

// Attach event listener to fetch exercise button
document.querySelector(".btn-fetch-exercise").addEventListener("click", fetchExercise);

// Attach event listeners to input fields for suggestions
document.getElementById("lookupExerciseType").addEventListener("input", (e) => showSuggestions(e.target, "type"));
document.getElementById("lookupMuscle").addEventListener("input", (e) => showSuggestions(e.target, "muscle"));
document.getElementById("lookupDifficulty").addEventListener("input", (e) => showSuggestions(e.target, "difficulty"));

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