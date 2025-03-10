import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Profile and logout elements
const logoutButton = document.getElementById("logoutButton");
const displayName = document.getElementById("displayName");
const username = document.getElementById("username");
const bio = document.getElementById("bio");
const age = document.getElementById("age");
const height = document.getElementById("height");
const weight = document.getElementById("weight");
const gender = document.getElementById("gender");
const bmi = document.getElementById("bmi");
const goals = document.getElementById("goals");
const milestones = document.getElementById("milestones");
const logHistory = document.getElementById("logHistory");
const charts = document.getElementById("charts");

// Edit Profile elements
const editProfileButton = document.getElementById("editProfileButton");
const saveProfileButton = document.getElementById("saveProfileButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const editBio = document.getElementById("editBio");
const editAge = document.getElementById("editAge");
const editHeight = document.getElementById("editHeight");
const editWeight = document.getElementById("editWeight");
const editGender = document.getElementById("editGender");
const editBmi = document.getElementById("editBmi");

// Monitor authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "profile", user.uid); // Update to use 'profile' collection
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            displayName.textContent = userData.displayName || "Display Name";
            username.textContent = `@${userData.username || "name"}`;
            bio.textContent = userData.bio || "Bio section";
            age.textContent = `Age: ${userData.age || ""}`;
            height.textContent = `Height: ${userData.height || ""}`;
            weight.textContent = `Weight: ${userData.weight || ""}`;
            gender.textContent = `Gender: ${userData.gender || ""}`;
            bmi.textContent = `BMI: ${userData.bmi || ""}`;
            goals.textContent = userData.goals || "User can put things that they’re trying to achieve like losing a certain amount of weight";
            milestones.textContent = userData.milestones || "User can pin previous goals that they met recently";
            logHistory.textContent = userData.logHistory || "Recent log history";
            charts.textContent = userData.charts || "Some sort of graphs and charts based on recent logging history";

            // Populate edit form with current data
            editBio.value = userData.bio || "";
            editAge.value = userData.age || "";
            editHeight.value = userData.height || "";
            editWeight.value = userData.weight || "";
            editGender.value = userData.gender || "";
            editBmi.value = userData.bmi || "";
        } else {
            console.log("No such document!");
        }
    } else {
        window.location.href = "sign-in.html"; // Redirect to login if not authenticated
    }
});

// Show Edit Profile Inputs
editProfileButton.addEventListener("click", () => {
    bio.style.display = "none";
    editBio.style.display = "block";
    editAge.style.display = "block";
    editHeight.style.display = "block";
    editWeight.style.display = "block";
    editGender.style.display = "block";
    editBmi.style.display = "block";
    editProfileButton.style.display = "none";
    saveProfileButton.style.display = "inline-block";
    cancelEditButton.style.display = "inline-block";
});

// Cancel Edit Profile
cancelEditButton.addEventListener("click", () => {
    bio.style.display = "block";
    editBio.style.display = "none";
    editAge.style.display = "none";
    editHeight.style.display = "none";
    editWeight.style.display = "none";
    editGender.style.display = "none";
    editBmi.style.display = "none";
    editProfileButton.style.display = "inline-block";
    saveProfileButton.style.display = "none";
    cancelEditButton.style.display = "none";
});

// Save Profile Changes
saveProfileButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
        const userDocRef = doc(db, "profile", user.uid); // Update to use 'profile' collection
        const updatedData = {
            bio: editBio.value,
            age: parseInt(editAge.value, 10),
            height: editHeight.value,
            weight: parseInt(editWeight.value, 10),
            gender: editGender.value,
            bmi: parseInt(editBmi.value, 10),
        };

        console.log("Updated Data:", updatedData); // Debugging line

        try {
            await setDoc(userDocRef, updatedData, { merge: true });
            alert("Profile updated successfully!");
            bio.textContent = updatedData.bio;
            age.textContent = `Age: ${updatedData.age}`;
            height.textContent = `Height: ${updatedData.height}`;
            weight.textContent = `Weight: ${updatedData.weight}`;
            gender.textContent = `Gender: ${updatedData.gender}`;
            bmi.textContent = `BMI: ${updatedData.bmi}`;
            bio.style.display = "block";
            editBio.style.display = "none";
            editAge.style.display = "none";
            editHeight.style.display = "none";
            editWeight.style.display = "none";
            editGender.style.display = "none";
            editBmi.style.display = "none";
            editProfileButton.style.display = "inline-block";
            saveProfileButton.style.display = "none";
            cancelEditButton.style.display = "none";
        } catch (error) {
            console.error("Error updating profile: ", error);
        }
    } else {
        console.log("No user is currently signed in."); // Debugging line
    }
});

// Logout Functionality
logoutButton.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            alert("Logged out successfully!");
            window.location.href = "sign-in.html";
        })
        .catch((error) => {
            console.error("Error logging out:", error);
        });
});