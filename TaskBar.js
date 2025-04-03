function createTaskbar() {
    const taskbarHTML = `
        <style>
            .taskbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(15, 32, 39, 0.9);
                padding: 10px 20px; /* Reduced padding for better fit */
                color: white;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                width: 100%; /* Ensures the taskbar spans the full width of the screen */
                position: fixed; /* Makes the taskbar stick to the top of the page */
                top: 0; /* Pushes the taskbar to the top */
                left: 0; /* Ensures it starts from the left edge */
                z-index: 1000; /* Keeps the taskbar above other elements */
            }
            .logo {
                display: flex;
                align-items: center;
                cursor: pointer;
            }
            .logo img {
                width: 50px;
                height: 50px;
                margin-right: 10px;
            }
            .logo span {
                font-size: 20px;
                color: #00bcd4;
                font-weight: bold;
            }
            .nav-links {
                display: flex;
                gap: 20px; /* Adds spacing between links */
                flex-wrap: wrap; /* Ensures links wrap to the next line if they exceed the width */
                justify-content: flex-end; /* Aligns links to the right */
                max-width: calc(100% - 100px); /* Prevents links from overflowing the taskbar */
                overflow: hidden; /* Hides overflowing content */
            }
            .nav-links a {
                color: white;
                text-decoration: none;
                font-weight: 500;
                transition: text-decoration 0.3s ease;
            }
            .nav-links a:hover {
                text-decoration: underline;
            }
            body {
                margin: 0; /* Removes default margin to prevent gaps */
                padding-top: 70px; /* Ensures content is not hidden behind the taskbar */
            }
        </style>
        <div class="taskbar">
            <!-- Logo Section -->
            <div class="logo" onclick="location.href='index.html'">
                <img src="360_transparent.png" alt="Thrive 360 Logo">
                <span>Thrive360</span>
            </div>
            <div class="nav-links">
                <a href="index.html">Dashboard</a>
                <a href="FoodLog.html">Food Log</a>
                <a href="exercise-logging.html">Exercise Log</a>
                <a href="profile.html">Profile</a>
                <a href="logs.html">Log History</a>
                <a href="sign-in.html" onclick="event.preventDefault(); logout();">Sign Out</a>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("afterbegin", taskbarHTML);
}

createTaskbar();
