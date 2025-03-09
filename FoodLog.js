document.addEventListener('DOMContentLoaded', () => {
    const mealEntryInputs = document.querySelectorAll('textarea');
    const submitMealsButton = document.querySelector('#submit-meals-button'); // Ensure the correct button is selected
    const historyLog = document.querySelector('.history-log p');
    const calorieTotalDisplay = document.getElementById('calories-consumed');
    const dailySummaryDisplay = document.getElementById('daily-summary'); // Display for daily summary
    let totalCalories = 0;  // Initialize total calories to 0

    // Function to search USDA food data (mock example, replace with actual API if needed)
    async function searchUSDAFood(query) {
        console.log(`Searching for food: ${query}`);  // Log the food search query
        // For now, mock the API response for food items.
        // This is where you'd use the actual USDA API or mock data.
        return [{
            description: `${query} (mock data)`,
            calories: 100  // Mocking 100 calories for any food entered
        }];
    }

    // Event listener for Submit Meals Button
    submitMealsButton.addEventListener('click', async () => {
        console.log('Submit Meals Button clicked');  // Log when the button is clicked
        let mealHistory = '';  // Initialize meal history as an empty string
        totalCalories = 0;  // Reset total calories to 0 each time the button is pressed

        // Loop through each textarea to process meal entries
        for (let input of mealEntryInputs) {
            const entryDetails = input.value.trim().split('-');  // Format expected: MealName - Calories
            const foodName = entryDetails[0].trim();
            const calories = parseInt(entryDetails[1]) || 0;  // Parse calories; default to 0 if invalid

            console.log(`Processing meal: ${foodName}, Calories: ${calories}`);  // Log each meal being processed

            totalCalories += calories;  // Add the entered calories to the total

            if (foodName) {
                const foodResults = await searchUSDAFood(foodName);  // Search USDA for the food item
                if (foodResults && foodResults.length > 0) {
                    mealHistory += `<strong>${foodName}</strong> - ${foodResults[0].description} - ${calories} kcal<br>`;
                } else {
                    mealHistory += `<strong>${foodName}</strong> - No USDA data found - ${calories} kcal<br>`;
                }
            }
        }

        console.log(`Total Calories: ${totalCalories}`);  // Log the total calories after processing all meals

        // Update meal history log
        historyLog.innerHTML = mealHistory || 'No entries yet.';

        // Update total calories consumed display
        calorieTotalDisplay.textContent = `${totalCalories} kcal`;

        // Update daily summary display
        dailySummaryDisplay.textContent = `Today's Summary: ${totalCalories} kcal consumed.`;

        console.log('Meal submission complete.');  // Log that the meal submission process is complete
    });

    // Optional: Render the calendar for the month (Just an example, you can update this as needed)
    const calendar = document.querySelector('.calendar');
    for (let i = 1; i <= 30; i++) {
        const day = document.createElement('div');
        day.textContent = i;
        calendar.appendChild(day);
    }
});

