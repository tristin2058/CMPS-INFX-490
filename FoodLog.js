document.addEventListener("DOMContentLoaded", () => {
    const submitMealsButton = document.querySelector("#submit-meals-button");
    const historyLog = document.querySelector("#mealHistory");
    const calorieTotalDisplay = document.getElementById("calories-consumed");
    const dailySummaryDisplay = document.getElementById("summaryDisplay");
    const mealEntryInputs = document.querySelectorAll("textarea");
    const calendarContainer = document.querySelector(".calendar");

    let totalCalories = 0;
    let selectedDate = getFormattedDate(new Date());
    let mealHistory = JSON.parse(localStorage.getItem("mealHistory")) || {};

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
        if (foodResults.length > 0) {
            const selectedFood = foodResults[0];
            const calories = selectedFood.foodNutrients.find(n => n.nutrientName.toLowerCase().includes("energy"))?.value || 0;
            return `<strong>${foodName}</strong> - ${selectedFood.description} - ${calories} kcal`;
        } else {
            return `<strong>${foodName}</strong> - No USDA data found`;
        }
    }

    submitMealsButton.addEventListener("click", async () => {
        let mealHistoryEntry = "";
        totalCalories = 0;

        for (let input of mealEntryInputs) {
            const foodEntries = input.value.trim().split("\n").slice(0, 5); // Allow max 5 entries per meal type

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
                    const apiCalories = apiEntry.match(/(\d+) kcal/);
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

        localStorage.setItem("mealHistory", JSON.stringify(mealHistory));

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
            }

            dayElement.addEventListener("click", () => {
                selectedDate = dateKey;
                updateMealHistory();
            });

            calendarContainer.appendChild(dayElement);
        }
    }

    renderCalendar();
    updateMealHistory();
});
