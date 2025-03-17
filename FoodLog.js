document.addEventListener('DOMContentLoaded', () => {
    const submitMealsButton = document.querySelector('#submit-meals-button');
    const historyLog = document.querySelector('.history-log p');
    const calorieTotalDisplay = document.getElementById('calories-consumed');
    const dailySummaryDisplay = document.getElementById('daily-summary');
    const mealEntryInputs = document.querySelectorAll('.meal-input'); // Changed to match input class
    let totalCalories = 0;

    const USDA_API_KEY = 'TlJi5aBkuJ2ur7CEppmSTrKsCKCdNftjRWJhLrd5'; // API Key
    const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

    // Function to fetch data from the USDA API
    async function searchUSDAFood(query) {
        try {
            const response = await fetch(`${USDA_API_URL}?query=${query}&api_key=${USDA_API_KEY}`);
            const data = await response.json();
            console.log(`USDA API Response for '${query}':`, data);
            return data.foods || [];
        } catch (error) {
            console.error('Error fetching food data:', error);
            return [];
        }
    }

    // Function to handle meal entry using manual calories
    function handleManualEntry(foodName, calories) {
        return `<strong>${foodName}</strong> - Manual entry - ${calories} kcal`;
    }

    // Function to handle API search and get calorie data
    async function handleAPIEntry(foodName) {
        const foodResults = await searchUSDAFood(foodName);
        if (foodResults.length > 0) {
            const selectedFood = foodResults[0]; // Take the first result
            const calories = selectedFood.foodNutrients.find(n => n.nutrientName.toLowerCase().includes('energy'))?.value || 0;
            return `<strong>${foodName}</strong> - ${selectedFood.description} - ${calories} kcal`;
        } else {
            return `<strong>${foodName}</strong> - No USDA data found`;
        }
    }

    submitMealsButton.addEventListener('click', async () => {
        let mealHistory = '';
        totalCalories = 0;

        // Loop through all the meal input fields
        for (let input of mealEntryInputs) {
            const foodName = input.value.trim();
            if (!foodName) continue;

            // Check if the input is in the format "food name - calories" (manual entry)
            const manualEntryParts = foodName.split(' - ').map(part => part.trim());
            if (manualEntryParts.length === 2 && !isNaN(manualEntryParts[1])) {
                const mealEntry = handleManualEntry(manualEntryParts[0], parseInt(manualEntryParts[1]));
                mealHistory += mealEntry + '<br>';
                totalCalories += parseInt(manualEntryParts[1]);
            } else {
                // Else, call the API to fetch the food data
                const apiEntry = await handleAPIEntry(foodName);
                mealHistory += apiEntry + '<br>';

                // Extract calories from the API response and update totalCalories
                const apiCalories = apiEntry.match(/(\d+) kcal/);
                if (apiCalories) {
                    totalCalories += parseInt(apiCalories[1]);
                }
            }
        }

        // Display the meal history and total calories
        historyLog.innerHTML = mealHistory || 'No entries yet.';
        calorieTotalDisplay.textContent = `${totalCalories} kcal`;
        dailySummaryDisplay.textContent = `Today's Summary: ${totalCalories} kcal consumed.`;
    });
});