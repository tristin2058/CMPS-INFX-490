function createTaskbar() {
    const taskbarHTML = `
        <style>
            * {
                box-sizing: border-box;
            }

            body {
                padding-top: 60px;
                margin: 0;
                overflow-x: hidden;
            }

            .taskbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: rgba(15, 32, 39, 0.9);
                padding: 10px 40px;
                color: #E2E8F0;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                width: 100%;
                position: fixed;
                top: 0;
                z-index: 1000;
            }
            .taskbar-left {
                display: flex;
                align-items: center;
                color: #E2E8F0;
                text-decoration: none;
                font-weight: bold;
                font-size: 25px;
                white-space: nowrap;
                padding: 10px;
                border-radius: 5px;
                transition: background-color 0.3s ease, transform 0.2s ease;
            }

            .taskbar-left:hover {
                background-color: #63B3ED;
                color: #0f2027;
                transform: translateY(-1px);
            }
            .nav-links {
                display: flex;
                gap: 25px;
                align-items: center;
                flex-wrap: nowrap; /* Prevent links from wrapping */
            }

            .nav-links a {
                color: #E2E8F0;
                text-decoration: none;
                font-weight: bold;
                padding: 10px;
                transition: background-color 0.3s ease;
                border-radius: 5px;
                font-size: 16px;
                white-space: nowrap; /* Prevent text from wrapping */
            }

            .nav-links a:hover {
                background-color: #63B3ED;
            }

            .dropdown {
                position: relative;
            }

            .dropdown button {
                background: none;
                border: none;
                color: #E2E8F0;
                font-weight: bold;
                padding: 10px;
                cursor: pointer;
                font-size: 16px;
            }

            .taskbar-left {
                color: #63B3ED;
                text-decoration: none;
                font-weight: bold;
                transition: background-color 0.3s ease;
                border-radius: 5px;
                font-size: 25px;
                white-space: nowrap; /* Prevent text from wrapping */
            }

            .dropdown-menu {
                display: none;
                position: absolute;
                background-color: #1A202C;
                border-radius: 5px;
                overflow: hidden;
                top: 100%;
                left: 0;
                min-width: 150px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            }

            .dropdown-menu a {
                display: block;
                padding: 10px;
                color: #E2E8F0;
                text-decoration: none;
                font-size: 16px;
            }

            .dropdown-menu a:hover {
                background-color: #2D3748;
            }

            .dropdown:hover .dropdown-menu {
                display: block;
            }

            .sign-out {
                color: #E53E3E;
            }

            /* Responsive Design for Smaller Screens */
            @media (max-width: 768px) {
                .taskbar {
                    flex-wrap: wrap; /* Allow wrapping for smaller screens */
                    padding: 10px 20px;
                }

                .nav-links {
                    flex-direction: column; /* Stack links vertically */
                    gap: 10px;
                    width: 100%;
                    align-items: flex-start;
                }

                .dropdown-menu {
                    position: static; /* Ensure dropdowns display properly */
                    box-shadow: none;
                }
            }
        </style>
        <div class="taskbar">
            <a href="about.html" class="taskbar-left" style="display: flex; align-items: center; text-decoration: none;">
                    <img src="360m.png" alt="Logo" style="width: 50px; height: 50px; vertical-align: middle; margin-right: 10px;">
                    <span>Thrive360</span>
            </a>
            <div class="nav-links">
                <a href="dashboard.html">Dashboard</a>
                <div class="dropdown">
                    <button>Log▼</button>
                    <div class="dropdown-menu">
                        <a href="FoodLog.html">Food Log</a>
                        <a href="exercise-logging.html">Exercise Log</a>
                    </div>
                </div>
                <div class="dropdown">
                    <button>History▼</button>
                    <div class="dropdown-menu">
                        <a href="FoodHistory.html">Food History</a>
                        <a href="ExerciseHistory.html">Exercise History</a>
                    </div>
                </div>
                <a href="Profile.html">Profile</a>
                <a href="sign-in.html" class="sign-out">Sign Out</a>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("afterbegin", taskbarHTML);
}

createTaskbar();


