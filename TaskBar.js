function createTaskbar() {
    const taskbarHTML = `
        <style>
            .taskbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #2D3748;
                padding: 15px 30px;
                color: #E2E8F0;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                width: 100%;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 50;
            }
            .nav-links {
                display: flex;
                flex: 1;
                justify-content: center;
                gap: 40px;
            }
            .nav-links a {
                color: #E2E8F0;
                text-decoration: none;
                font-weight: bold;
                transition: color 0.3s ease;
            }
            .nav-links a:hover {
                color: #63B3ED;
            }
            .profile-dropdown {
                position: relative;
                margin-right: 40px;
            }
            .profile-button {
                background-color: #63B3ED;
                color: #2D3748;
                border: none;
                padding: 8px 15px;
                border-radius: 20px;
                cursor: pointer;
                font-weight: bold;
            }
            .dropdown-menu {
                display: none;
                position: absolute;
                right: 0;
                background-color: #1A202C;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 10px 0;
                z-index: 1;
            }
            .dropdown-menu a {
                display: block;
                padding: 10px 20px;
                color: #E2E8F0;
                text-decoration: none;
                transition: background-color 0.3s ease;
            }
            .dropdown-menu a:hover {
                background-color: #2D3748;
            }
            .profile-button:hover + .dropdown-menu,
            .dropdown-menu:hover {
                display: block;
            }
            body {
                padding-top: 70px; /* Ensures content is not hidden behind the taskbar */
            }
        </style>
        <div class="taskbar">
            <div class="nav-links">
                <a href="dashboard.html">Home</a>
                <a href="FoodLog.html">Food Log</a>
                <a href="exercise-logging.html">Exercise Log</a>
                <a href="#">History</a>
            </div>
            <div class="profile-dropdown">
                <button class="profile-button">Profile ▼</button>
                <div class="dropdown-menu">
                    <a href="Profile.html">View Profile</a>
                    <a href="sign-in.html">Logout</a>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("afterbegin", taskbarHTML);
}

createTaskbar();
