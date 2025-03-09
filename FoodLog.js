document.addEventListener('DOMContentLoaded', () => {
    const caloriesConsumed = document.getElementById('calories-consumed');
    const caloriesBurned = document.getElementById('calories-burned');

    // Calendar generation
    const calendar = document.querySelector('.calendar');
    const days = 31;  // Assume maximum 31 days for simplicity
    for (let i = 1; i <= days; i++) {
        const day = document.createElement('div');
        day.textContent = i;
        calendar.appendChild(day);
        day.addEventListener('click', () => {
            alert(`Details for Day ${i}`);
        });
    }

    // Example logic for calorie tracking (to be expanded with real API data)
    const mealEntries = document.querySelectorAll('textarea');
    mealEntries.forEach(entry => {
        entry.addEventListener('input', () => {
            const calories = Math.floor(Math.random() * 500); // Mock calorie value
            caloriesConsumed.textContent = parseInt(caloriesConsumed.textContent) + calories;
        });
    });
});
