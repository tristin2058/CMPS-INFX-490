import { auth, db } from "./firebase-config.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Select the table body where exercise history will be displayed
const exerciseTableBody = document.getElementById("exerciseTableBody");

// Function to load and display historical exercise data for both Cardio and Workouts
const loadExerciseHistory = async (uid) => {
    try {
        // References to Cardio and Workouts collections
        const cardioQuery = collection(db, `Exercise Log/Cardio/User's Exercise/${uid}/Exercises`);
        const workoutsQuery = collection(db, `Exercise Log/Workouts/User's Exercise/${uid}/Exercises`);

        // Fetch data from both collections
        const [cardioSnapshot, workoutsSnapshot] = await Promise.all([
            getDocs(cardioQuery),
            getDocs(workoutsQuery)
        ]);

        exerciseTableBody.innerHTML = ""; // Clear existing rows

        // Display Cardio exercises
        cardioSnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${data.date}</td>
                <td>Cardio</td>
                <td>${data.exercise}</td>
                <td>${data.duration || 0} km</td>
                <td>-</td>
                <td>-</td>
            `;

            exerciseTableBody.appendChild(row);
        });

        // Display Workouts exercises
        workoutsSnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${data.date}</td>
                <td>Workout</td>
                <td>${data.exercise}</td>
                <td>-</td>
                <td>${data.reps || 0}</td>
                <td>${data.sets || 0}</td>
            `;

            exerciseTableBody.appendChild(row);
        });

        // If no exercises are found, display a message
        if (exerciseTableBody.innerHTML === "") {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="6">No exercise history found.</td>`;
            exerciseTableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading exercise history: ", error);
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="6">Failed to load exercise history.</td>`;
        exerciseTableBody.appendChild(row);
    }
};

// Monitor authentication state and load exercise history
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadExerciseHistory(user.uid);
    } else {
        window.location.href = "sign-in.html"; // Redirect to login if not authenticated
    }
});