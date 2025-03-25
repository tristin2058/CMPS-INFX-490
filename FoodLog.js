document.addEventListener('DOMContentLoaded', () => {
    const submitMealsButton = document.querySelector('#submit-meals-button');
    const historyLog = document.querySelector('.history-log p');
    const calorieTotalDisplay = document.getElementById('calories-consumed');
    const dailySummaryDisplay = document.getElementById('daily-summary');
    const mealEntryInputs = document.querySelectorAll('textarea');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotResponse = document.getElementById('chatbot-response');

    let totalCalories = 0;
    const USDA_API_KEY = 'TlJi5aBkuJ2ur7CEppmSTrKsCKCdNftjRWJhLrd5';
    const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

    async function getChatbotResponse(userMessage) {
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `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`, 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: userMessage }],
                    max_tokens: 100
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error("Error getting chatbot response:", error);
            return "I'm sorry, I couldn't process that request. Please try again.";
        }
    }

    chatbotSend.addEventListener('click', async () => {
        const userMessage = chatbotInput.value.trim();
        if (!userMessage) return;

        chatbotResponse.innerHTML = "<p>Thinking...</p>";
        const botReply = await getChatbotResponse(userMessage);
        chatbotResponse.innerHTML = `<p><strong>AI Bot:</strong> ${botReply}</p>`;
    });

    async function searchUSDAFood(query) {
        try {
            const response = await fetch(`${USDA_API_URL}?query=${query}&api_key=${USDA_API_KEY}`);
            const data = await response.json();
            return data.foods || [];
        } catch (error) {
            console.error('Error fetching food data:', error);
            return [];
        }
    }

    submitMealsButton.addEventListener('click', async () => {
        let mealHistory = '';
        totalCalories = 0;

        for (let input of mealEntryInputs) {
            const mealType = input.id;
            const foodEntries = input.value.trim().split('\\n').slice(0, 5);

            for (let entry of foodEntries) {
                const [foodName, calories] = entry.split('-').map(str => str.trim());
                if (!foodName || isNaN(calories)) continue;
                totalCalories += Number(calories);
                mealHistory += `<strong>${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</strong>: ${foodName} - ${calories} kcal<br>`;
            }
        }

        historyLog.innerHTML = mealHistory || 'No entries yet.';
        calorieTotalDisplay.textContent = `${totalCalories} kcal`;
        dailySummaryDisplay.textContent = `Today's Summary: ${totalCalories} kcal consumed.`;
    });

    const calendarDiv = document.querySelector('.calendar');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    function renderCalendar(month, year) {
        const firstDay = new Date(year, month).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        let calendarHTML = '';

        for (let i = 0; i < firstDay; i++) {
            calendarHTML += `<div class="empty"></div>`;
        }

        for (let day = 1; day <= lastDate; day++) {
            calendarHTML += `<div class="day">${day}</div>`;
        }

        calendarDiv.innerHTML = calendarHTML;
    }

    renderCalendar(currentMonth, currentYear);
});
