function createTaskbar() {
    const taskbarHTML = `
        <style>
            .taskbar {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                background-color: rgba(15, 32, 39, 0.9); /* Updated background color */
                padding: 15px 50px; /* Increased right padding */
                color: #E2E8F0;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                width: 100%;
                position: fixed;
                top: 0;
                left: -65px; /* Shifted taskbar to the left by 100px */
                z-index: 1000;
            }
            .nav-links {
                display: flex;
                gap: 40px;
                align-items: center;
            }
            .nav-links a {
                color: #E2E8F0;
                text-decoration: none;
                font-weight: bold;
                padding: 10px;
                transition: background-color 0.3s ease;
                border-radius: 5px;
                font-size: 16px;
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
            body {
                padding-top: 70px;
            }
        </style>
        <div class="taskbar">
            <div class="nav-links">
                <a href="dashboard.html">Dashboard</a>
                <div class="dropdown">
                    <button>Log History ▼</button>
                    <div class="dropdown-menu">
                        <a href="FoodLog.html">Food Log</a>
                        <a href="exercise-logging.html">Exercise Log</a>
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
