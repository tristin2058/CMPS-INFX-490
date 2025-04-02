document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const currentDate = new Date();
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Sample data - in a real app, this would come from a database or API
    const userData = {
        steps: 7500,
        stepGoal: 10000,
        distance: 3.2, // miles
        activeMinutes: 45,
        caloriesConsumed: 1850,
        calorieGoal: 2000,
        protein: 120,
        carbs: 210,
        fat: 65,
        currentWeight: 165.4,
        weightHistory: [168, 167.2, 166.5, 166, 165.8, 165.5, 165.4],
        sleepDuration: 7.5,
        sleepQuality: 85,
        totalCaloriesBurned: 520,
        exerciseCalories: 320,
        waterGlasses: 5,
        weeklyActivity: [7500, 8200, 6000, 9100, 10500, 7800, 6500] // steps for each day of the week
    };

    // Update metrics with user data
    updateMetrics(userData);

    // Initialize charts
    initializeCharts(userData);

    // Water intake functionality
    setupWaterIntake(userData.waterGlasses);

    // Weight modal functionality
    setupWeightModal();

    // Quick action buttons (placeholder functionality)
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert(`${this.querySelector('span').textContent} functionality would be implemented here.`);
        });
    });
});

function updateMetrics(data) {
    // Steps and activity
    const stepsPercent = (data.steps / data.stepGoal) * 100;
    document.getElementById('steps-progress').style.width = `${Math.min(stepsPercent, 100)}%`;
    document.getElementById('steps-text').textContent = `${data.steps.toLocaleString()}/${data.stepGoal.toLocaleString()}`;
    document.getElementById('distance').textContent = data.distance.toFixed(1);
    document.getElementById('active-time').textContent = data.activeMinutes;

    // Nutrition
    const caloriesPercent = (data.caloriesConsumed / data.calorieGoal) * 100;
    document.getElementById('calories-progress').style.width = `${Math.min(caloriesPercent, 100)}%`;
    document.getElementById('calories-text').textContent = `${data.caloriesConsumed}/${data.calorieGoal}`;
    document.getElementById('protein').textContent = data.protein;
    document.getElementById('carbs').textContent = data.carbs;
    document.getElementById('fat').textContent = data.fat;

    // Weight
    document.getElementById('current-weight').textContent = data.currentWeight.toFixed(1);
    if (data.weightHistory.length > 1) {
        const weightChange = data.currentWeight - data.weightHistory[data.weightHistory.length - 2];
        const changeElement = document.getElementById('weight-change-amount');
        const directionElement = document.getElementById('weight-change-direction');
        
        changeElement.textContent = Math.abs(weightChange).toFixed(1);
        
        if (weightChange > 0) {
            directionElement.innerHTML = '<i class="fas fa-arrow-up" style="color: var(--danger-color)"></i>';
        } else if (weightChange < 0) {
            directionElement.innerHTML = '<i class="fas fa-arrow-down" style="color: var(--success-color)"></i>';
        } else {
            directionElement.innerHTML = '<i class="fas fa-equals" style="color: var(--info-color)"></i>';
        }
    }

    // Sleep
    document.getElementById('sleep-duration').textContent = data.sleepDuration.toFixed(1);
    document.getElementById('sleep-quality').textContent = `${data.sleepQuality}%`;
    document.getElementById('sleep-score').textContent = Math.round(data.sleepQuality);
    document.querySelector('.circular-progress').style.background = 
        `conic-gradient(var(--accent-color) ${data.sleepQuality}%, #e9ecef ${data.sleepQuality}%)`;

    // Calories burned
    document.getElementById('total-burned').textContent = data.totalCaloriesBurned;
    document.getElementById('exercise-burned').textContent = data.exerciseCalories;
}

function initializeCharts(data) {
    // Weight history chart
    const weightCtx = document.getElementById('weight-chart').getContext('2d');
    const weightChart = new Chart(weightCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: data.weightHistory.length}, (_, i) => `${i + 1} day${i > 0 ? 's' : ''} ago`).reverse(),
            datasets: [{
                label: 'Weight (lbs)',
                data: data.weightHistory,
                borderColor: '#00bcd4',
                backgroundColor: 'rgba(0, 188, 212, 0.1)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#00bcd4',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#00bcd4',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `Weight: ${context.parsed.y} lbs`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Weight (lbs)',
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });

    // Weekly activity chart
    const activityCtx = document.getElementById('activity-chart').getContext('2d');
    const activityChart = new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                label: 'Steps',
                data: data.weeklyActivity,
                backgroundColor: 'rgba(0, 188, 212, 0.7)',
                borderColor: 'rgba(0, 188, 212, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#00bcd4',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `Steps: ${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Steps',
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

function setupWaterIntake(initialGlasses) {
    const glasses = document.querySelectorAll('.glass');
    const waterText = document.getElementById('water-text');
    const addWaterBtn = document.getElementById('add-water-btn');
    
    let currentGlasses = initialGlasses;
    
    // Initialize glasses
    updateWaterDisplay();
    
    // Add water button functionality
    addWaterBtn.addEventListener('click', function() {
        if (currentGlasses < 8) {
            currentGlasses++;
            updateWaterDisplay();
        } else {
            alert("You've reached your daily water goal!");
        }
    });
    
    // Click on individual glasses
    glasses.forEach((glass, index) => {
        glass.addEventListener('click', function() {
            currentGlasses = index + 1;
            updateWaterDisplay();
        });
    });
    
    function updateWaterDisplay() {
        glasses.forEach((glass, index) => {
            glass.dataset.filled = index < currentGlasses;
        });
        waterText.textContent = `${currentGlasses}/8 glasses`;
    }
}

function setupWeightModal() {
    const modal = document.getElementById('weight-modal');
    const logBtn = document.getElementById('log-weight-btn');
    const closeBtn = document.querySelector('.close-btn');
    const submitBtn = document.getElementById('submit-weight-btn');
    const weightInput = document.getElementById('weight-input');
    
    logBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
    });
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    submitBtn.addEventListener('click', function() {
        const newWeight = parseFloat(weightInput.value);
        if (!isNaN(newWeight)) {
            // In a real app, you would save this to your database
            alert(`Weight logged: ${newWeight} lbs. In a real app, this would update your data.`);
            modal.style.display = 'none';
            weightInput.value = '';
        } else {
            alert('Please enter a valid weight');
        }
    });
}