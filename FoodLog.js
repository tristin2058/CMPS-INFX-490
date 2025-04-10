import { auth, db } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const submitMealsButton = document.querySelector("#submit-meals-button");
    const historyLog = document.querySelector("#mealHistory");
    const calorieTotalDisplay = document.getElementById("calories-consumed");
    const dailySummaryDisplay = document.querySelector("#summaryDisplay");
    const mealEntryInputs = document.querySelectorAll("textarea");
    const calendarContainer = document.querySelector(".calendar");
    const calendarMonth = document.querySelector("#calendar-month");

    let totalCalories = 0;
    let selectedDate = getFormattedDate(new Date());
    let mealHistory = {}; // Stores meals for the current session

    const USDA_API_KEY = "TlJi5aBkuJ2ur7CEppmSTrKsCKCdNftjRWJhLrd5";
    const USDA_API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

    function getFormattedDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    async function searchUSDAFood(query) {
        try {
            const response = await fetch(`${USDA_API_URL}?query=${query}&api_key=${USDA_API_KEY}`);
            const data = await response.json();
            return data.foods || [];
        } catch (error) {
            console.error("Error fetching food data:", error);
            return [];
        }
    }

    function handleManualEntry(foodName, calories) {
        return `<strong>${foodName}</strong> - Manual entry - ${calories} kcal`;
    }

    async function handleAPIEntry(foodName) {
        const foodResults = await searchUSDAFood(foodName);
        console.log("Food results for", foodName, foodResults); // Debug

        if (foodResults.length > 0) {
            const selectedFood = foodResults[0];
            const description = selectedFood.description || "No description";

            let calories = 0;
            if (selectedFood.foodNutrients && Array.isArray(selectedFood.foodNutrients)) {
                const energyNutrient = selectedFood.foodNutrients.find(n =>
                    n.nutrientName.toLowerCase().includes("energy") && n.unitName === "KCAL"
                );
                if (energyNutrient) {
                    calories = energyNutrient.value || 0;
                }
            }

            return `<strong>${foodName}</strong> - ${description} - ${calories} kcal`;
        } else {
            return `<strong>${foodName}</strong> - No USDA data found`;
        }
    }

    async function saveToFirestore(userId, date, data) {
        try {
            const userDocRef = doc(db, "users", userId, "mealLogs", date);
            await setDoc(userDocRef, data);
            console.log("Data saved to Firestore:", data);
        } catch (error) {
            console.error("Error saving to Firestore:", error);
        }
    }

    async function getMealHistoryFromFirestore(userId) {
        try {
            const userDocRef = doc(db, "users", userId, "mealLogs", selectedDate);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching from Firestore:", error);
            return null;
        }
    }

    async function getMealHistoryFromLocalStorage(userId) {
        const storedHistory = JSON.parse(localStorage.getItem(userId)) || {};
        return storedHistory;
    }

    async function saveMealHistoryToLocalStorage(userId, mealHistory) {
        localStorage.setItem(userId, JSON.stringify(mealHistory));
    }

    // This will handle saving meal data to localStorage and Firestore
    async function handleMealHistory(user, date, entry) {
        const userUid = user ? user.uid : null;
        if (userUid) {
            // Get the current history from localStorage
            const storedHistory = await getMealHistoryFromLocalStorage(userUid);

            // Add the new entry for the selected date
            storedHistory[date] = entry;

            // Save the updated meal history to localStorage
            await saveMealHistoryToLocalStorage(userUid, storedHistory);

            // Also save to Firestore
            await saveToFirestore(userUid, date, entry);
        }
    }

    // Set up the meal history after the user logs in
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userId = user.uid;
            console.log("User logged in:", userId);

            // Load all past meal entries from localStorage
            mealHistory = await getMealHistoryFromLocalStorage(userId);
            updateMealHistory();
            renderCalendar();
        } else {
            console.log("No user logged in");
        }
    });

    submitMealsButton.addEventListener("click", async () => {
        let mealHistoryEntry = "";
        totalCalories = 0;

        for (let input of mealEntryInputs) {
            const foodEntries = input.value.trim().split("\n").slice(0, 5);

            for (let entry of foodEntries) {
                if (!entry) continue;

                const manualEntryParts = entry.split(" - ").map(part => part.trim());
                if (manualEntryParts.length === 2 && !isNaN(manualEntryParts[1])) {
                    const mealEntry = handleManualEntry(manualEntryParts[0], parseInt(manualEntryParts[1]));
                    mealHistoryEntry += mealEntry + "<br>";
                    totalCalories += parseInt(manualEntryParts[1]);
                } else {
                    const apiEntry = await handleAPIEntry(entry);
                    mealHistoryEntry += apiEntry + "<br>";
                    const apiCalories = apiEntry.match(/(\d+)\s*kcal/);
                    if (apiCalories) {
                        totalCalories += parseInt(apiCalories[1]);
                    }
                }
            }
        }

        mealHistory[selectedDate] = {
            meals: mealHistoryEntry || "No entries yet.",
            calories: totalCalories
        };

        // Save to Firestore and localStorage
        onAuthStateChanged(auth, (user) => {
            if (user) {
                handleMealHistory(user, selectedDate, {
                    meals: mealHistoryEntry,
                    calories: totalCalories
                });
            }
        });

        updateMealHistory();
        renderCalendar();
    });

    function updateMealHistory() {
        if (mealHistory[selectedDate]) {
            historyLog.innerHTML = mealHistory[selectedDate].meals;
            dailySummaryDisplay.textContent = `Today's Summary: ${mealHistory[selectedDate].calories} kcal consumed.`;
        } else {
            historyLog.innerHTML = "No entries yet.";
            dailySummaryDisplay.textContent = "Enter your meals to see the summary.";
        }
    }

    function renderCalendar() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const todayFormatted = getFormattedDate(today);

        calendarContainer.innerHTML = "";
        calendarMonth.textContent = `${today.toLocaleString('default', { month: 'long' })} ${currentYear}`;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayElement = document.createElement("div");
            dayElement.classList.add("calendar-day");
            dayElement.textContent = day;

            if (dateKey === todayFormatted) {
                dayElement.classList.add("current-date");
            }

            if (mealHistory[dateKey]) {
                dayElement.classList.add("logged");
                if (dateKey < todayFormatted) {
                    dayElement.textContent = `${day} x`;
                }
            }

            dayElement.addEventListener("click", () => {
                selectedDate = dateKey;
                updateMealHistory();
            });

            calendarContainer.appendChild(dayElement);
        }
    }

    renderCalendar();
});





