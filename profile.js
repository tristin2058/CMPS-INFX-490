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
const heightUnit = document.getElementById("heightUnit");
const weightUnit = document.getElementById("weightUnit");

// Clear input fields on page load
window.addEventListener('load', () => {
    editBio.value = "";
    editAge.value = "";
    editHeight.value = "";
    editWeight.value = "";
    editGender.value = "";
    heightUnit.value = "cm"; // Default to cm
    weightUnit.value = "kg"; // Default to kg
});

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
            editHeight.value = userData.height ? userData.height.split(" ")[0] : "";
            heightUnit.value = userData.height ? userData.height.split(" ")[1] : "cm";
            editWeight.value = userData.weight ? userData.weight.split(" ")[0] : "";
            weightUnit.value = userData.weight ? userData.weight.split(" ")[1] : "kg";
            editGender.value = userData.gender || "";
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
    age.textContent = "Age: ";
    editAge.style.display = "block";
    height.textContent = "Height: ";
    editHeight.style.display = "block";
    heightUnit.style.display = "block";
    weight.textContent = "Weight: ";
    editWeight.style.display = "block";
    weightUnit.style.display = "block";
    gender.textContent = "Gender: ";
    editGender.style.display = "block";
    editProfileButton.style.display = "none";
    saveProfileButton.style.display = "inline-block";
    cancelEditButton.style.display = "inline-block";
});

// Cancel Edit Profile
cancelEditButton.addEventListener("click", () => {
    bio.style.display = "block";
    editBio.style.display = "none";
    age.style.display = "block";
    editAge.style.display = "none";
    height.style.display = "block";
    editHeight.style.display = "none";
    heightUnit.style.display = "none";
    weight.style.display = "block";
    editWeight.style.display = "none";
    weightUnit.style.display = "none";
    gender.style.display = "block";
    editGender.style.display = "none";
    editProfileButton.style.display = "inline-block";
    saveProfileButton.style.display = "none";
    cancelEditButton.style.display = "none";
});

// Save Profile Changes
saveProfileButton.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Save button clicked"); // Debugging line
    const user = auth.currentUser;
    if (user) {
        const userDocRef = doc(db, "profile", user.uid); // Update to use 'profile' collection
        let heightValue = parseFloat(editHeight.value);
        let heightDisplay = "";
        let weightValue = parseFloat(editWeight.value);
        let weightDisplay = "";

        // Convert height to meters or feet if necessary
        if (heightUnit.value === "in" || heightUnit.value === "ft") {
            const totalInches = heightUnit.value === "in" ? heightValue : heightValue * 12;
            const feet = Math.floor(totalInches / 12);
            const inches = totalInches % 12;
            heightDisplay = `${feet} ft ${inches.toFixed(2)} in`;
            heightValue = totalInches * 0.0254; // Convert inches to meters
        } else {
            const totalCm = heightUnit.value === "cm" ? heightValue : heightValue * 100;
            const meters = Math.floor(totalCm / 100);
            const cm = totalCm % 100;
            heightDisplay = `${meters} m ${cm.toFixed(2)} cm`;
            heightValue = totalCm / 100; // Convert cm to meters
        }

        // Convert weight to kilograms or pounds if necessary
        if (weightUnit.value === "lb") {
            weightDisplay = `${weightValue.toFixed(2)} lb`;
            weightValue = weightValue * 0.453592; // Convert pounds to kg
        } else {
            weightDisplay = `${weightValue.toFixed(2)} kg`;
        }

        // Calculate BMI
        const bmiValue = weightValue / (heightValue * heightValue);

        const updatedData = {
            bio: editBio.value,
            age: parseInt(editAge.value, 10),
            height: heightDisplay,
            weight: weightDisplay,
            gender: editGender.value,
            bmi: bmiValue.toFixed(2),
        };

        console.log("Updated Data:", updatedData); // Debugging line

        try {
            await setDoc(userDocRef, updatedData, { merge: true });
            alert("Profile updated successfully!");
            bio.textContent = updatedData.bio;
            age.textContent = `Age: ${updatedData.age}`;
            height.textContent = `Height: ${heightDisplay}`;
            weight.textContent = `Weight: ${weightDisplay}`;
            gender.textContent = `Gender: ${updatedData.gender}`;
            bmi.textContent = `BMI: ${updatedData.bmi}`;
            bio.style.display = "block";
            editBio.style.display = "none";
            age.style.display = "block";
            editAge.style.display = "none";
            height.style.display = "block";
            editHeight.style.display = "none";
            heightUnit.style.display = "none";
            weight.style.display = "block";
            editWeight.style.display = "none";
            weightUnit.style.display = "none";
            gender.style.display = "block";
            editGender.style.display = "none";
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

weightUnit.addEventListener("change", () => {
    let weightValue = parseFloat(editWeight.value);
    if (isNaN(weightValue)) return;

    if (weightUnit.value === "kg") {
        // Convert from pounds to kilograms
        editWeight.value = (weightValue * 0.453592).toFixed(2);
    } else {
        // Convert from kilograms to pounds
        editWeight.value = (weightValue / 0.453592).toFixed(2);
    }
});

let previousHeightUnit = heightUnit.value; // Track previous unit

heightUnit.addEventListener("change", () => {
    let heightValue = parseFloat(editHeight.value);
    if (isNaN(heightValue)) return;

    let newUnit = heightUnit.value;

    // Convert from previous unit to cm first (universal base)
    if (previousHeightUnit === "in") {
        heightValue *= 2.54; // Inches to cm
    } else if (previousHeightUnit === "ft") {
        heightValue *= 30.48; // Feet to cm
    } else if (previousHeightUnit === "m") {
        heightValue *= 100; // Meters to cm
    }

    // Convert from cm to the new unit
    if (newUnit === "in") {
        heightValue /= 2.54; // cm to inches
    } else if (newUnit === "ft") {
        heightValue /= 30.48; // cm to feet
    } else if (newUnit === "m") {
        heightValue /= 100; // cm to meters
    }

    editHeight.value = heightValue.toFixed(2);
    previousHeightUnit = newUnit; // Update previous unit for next change
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