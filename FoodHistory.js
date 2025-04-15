import { auth, db } from "./firebase-config.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Select the table body where food history will be displayed
const foodTableBody = document.getElementById("foodTableBody");

// Function to load and display food history
const loadFoodHistory = async (uid, date) => {
    try {
        // Reference to the Food History collection
        const foodQuery = collection(db, `Food Log/${uid}/Entries`);

        // Fetch data from the collection
        const foodSnapshot = await getDocs(foodQuery);

        foodTableBody.innerHTML = ""; // Clear existing rows

        // Display food entries
        foodSnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");

            // Use the correct field names from Firestore
            row.innerHTML = `
                <td>${doc.id}</td> <!-- Use the document ID as the date -->
                <td>${data.meals || "No meals recorded"}</td>
            `;

            foodTableBody.appendChild(row);
        });

        // If no food entries are found, display a message
        if (foodTableBody.innerHTML === "") {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="2">No food history found.</td>`;
            foodTableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading food history: ", error);
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="2">Failed to load food history.</td>`;
        foodTableBody.appendChild(row);
    }
};

// Monitor authentication state and load food history
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadFoodHistory(user.uid);
    } else {
        window.location.href = "sign-in.html"; // Redirect to login if not authenticated
    }
});