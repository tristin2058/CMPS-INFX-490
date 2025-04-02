import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const storage = getStorage();

const logoutButton = document.getElementById("logoutButton");
const displayName = document.getElementById("displayName");
const username = document.getElementById("username");
const bio = document.getElementById("bio");
const age = document.getElementById("age");
const height = document.getElementById("height");
const weight = document.getElementById("weight");
const gender = document.getElementById("gender");
const bmi = document.getElementById("bmi");
const bmiStatusEl = document.getElementById("bmiStatus");
const registeredAtEl = document.getElementById("registeredAt");
const profileImage = document.getElementById("profileImage");
const profileImageInput = document.getElementById("profileImageInput");
const displayPronouns = document.getElementById("displayPronouns");

// Pronouns controls
const enablePronouns = document.getElementById("enablePronouns");
const pronounsField = document.getElementById("pronounsField");
const pronounsSelect = document.getElementById("pronounsSelect");
const pronounsCustom = document.getElementById("pronounsCustom");

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

function getHealthStatus(bmi) {
  const value = parseFloat(bmi);
  if (value < 18.5) return { label: "Underweight", color: "#2196f3" };
  if (value < 25) return { label: "Normal", color: "#4caf50" };
  if (value < 30) return { label: "Overweight", color: "#ff9800" };
  return { label: "Obese", color: "#f44336" };
}

// Handle pronoun visibility
enablePronouns.addEventListener("change", () => {
  pronounsField.style.display = enablePronouns.checked ? "block" : "none";
});

pronounsSelect.addEventListener("change", () => {
  pronounsCustom.style.display = pronounsSelect.value === "Other" ? "block" : "none";
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "sign-in.html";
    return;
  }

  const docRef = doc(db, "profile", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    displayName.textContent = data.displayName;
    username.textContent = `@${data.username}`;
    bio.textContent = data.bio || "";
    age.textContent = `Age: ${data.age}`;
    height.textContent = `Height: ${data.height}`;
    weight.textContent = `Weight: ${data.weight}`;
    gender.textContent = `Gender: ${data.gender}`;
    bmi.textContent = `BMI: ${data.bmi}`;

    const status = getHealthStatus(data.bmi);
    if (bmiStatusEl) {
      bmiStatusEl.textContent = status.label;
      bmiStatusEl.style.color = status.color;
      bmiStatusEl.style.fontWeight = "bold";
    }

    if (registeredAtEl && data.registeredAt) {
      registeredAtEl.textContent = new Date(data.registeredAt).toLocaleString();
    }

    if (data.profileImageUrl && profileImage) {
      profileImage.src = data.profileImageUrl;
    }

    if (profileImageInput) {
      profileImageInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        if (profileImage) profileImage.src = imageUrl;

        await updateDoc(docRef, { profileImageUrl: imageUrl });
      });
    }

    // Pronouns
    if (data.pronouns) {
      displayPronouns.textContent = `(${data.pronouns})`;
      enablePronouns.checked = true;
      pronounsField.style.display = "block";

      if (
        ["He/Him", "She/Her", "They/Them", "Any pronouns"].includes(data.pronouns)
      ) {
        pronounsSelect.value = data.pronouns;
      } else {
        pronounsSelect.value = "Other";
        pronounsCustom.style.display = "block";
        pronounsCustom.value = data.pronouns;
      }
    }

    editBio.value = data.bio || "";
    editAge.value = data.age || "";
    editHeight.value = data.height ? data.height.split(" ")[0] : "";
    heightUnit.value = data.height ? data.height.split(" ")[1] : "cm";
    editWeight.value = data.weight ? data.weight.split(" ")[0] : "";
    weightUnit.value = data.weight ? data.weight.split(" ")[1] : "kg";
    editGender.value = data.gender || "";

  } else {
    const newUserDoc = {
      displayName: user.displayName || "",
      username: user.email?.split("@")[0] || "",
      email: user.email || "",
      age: "",
      gender: "",
      height: "",
      weight: "",
      bmi: "",
      registeredAt: new Date().toISOString(),
      profileImageUrl: "",
      pronouns: ""
    };
    await setDoc(docRef, newUserDoc);
  }
});

editProfileButton.addEventListener("click", () => {
  bio.style.display = "none";
  editBio.style.display = "block";
  age.style.display = "none";
  editAge.style.display = "block";
  height.style.display = "none";
  editHeight.style.display = "block";
  heightUnit.style.display = "inline-block";
  weight.style.display = "none";
  editWeight.style.display = "block";
  weightUnit.style.display = "inline-block";
  gender.style.display = "none";
  editGender.style.display = "block";
  editProfileButton.style.display = "none";
  saveProfileButton.style.display = "inline-block";
  cancelEditButton.style.display = "inline-block";
});

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

saveProfileButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const userDocRef = doc(db, "profile", user.uid);
  let heightValue = parseFloat(editHeight.value);
  let heightDisplay = "";
  let weightValue = parseFloat(editWeight.value);
  let weightDisplay = "";

  if (heightUnit.value === "in" || heightUnit.value === "ft") {
    const totalInches = heightUnit.value === "in" ? heightValue : heightValue * 12;
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    heightDisplay = `${feet} ft ${inches.toFixed(2)} in`;
    heightValue = totalInches * 0.0254;
  } else {
    const totalCm = heightUnit.value === "cm" ? heightValue : heightValue * 100;
    const meters = Math.floor(totalCm / 100);
    const cm = totalCm % 100;
    heightDisplay = `${meters} m ${cm.toFixed(2)} cm`;
    heightValue = totalCm / 100;
  }

  if (weightUnit.value === "lb") {
    weightDisplay = `${weightValue.toFixed(2)} lb`;
    weightValue = weightValue * 0.453592;
  } else {
    weightDisplay = `${weightValue.toFixed(2)} kg`;
  }

  const bmiValue = weightValue / (heightValue * heightValue);
  let pronouns = "";

  if (enablePronouns.checked) {
    pronouns =
      pronounsSelect.value === "Other"
        ? pronounsCustom.value.trim()
        : pronounsSelect.value;
  }

  const updatedData = {
    bio: editBio.value,
    age: parseInt(editAge.value, 10),
    height: heightDisplay,
    weight: weightDisplay,
    gender: editGender.value,
    bmi: bmiValue.toFixed(2),
    pronouns
  };

  try {
    await setDoc(userDocRef, updatedData, { merge: true });

    bio.textContent = updatedData.bio;
    age.textContent = `Age: ${updatedData.age}`;
    height.textContent = `Height: ${heightDisplay}`;
    weight.textContent = `Weight: ${weightDisplay}`;
    gender.textContent = `Gender: ${updatedData.gender}`;
    bmi.textContent = `BMI: ${updatedData.bmi}`;
    displayPronouns.textContent = pronouns ? `(${pronouns})` : "";

    const bmiStatus = getHealthStatus(updatedData.bmi);
    bmiStatusEl.textContent = bmiStatus.label;
    bmiStatusEl.style.color = bmiStatus.color;
    bmiStatusEl.style.fontWeight = "bold";

    cancelEditButton.click();
    alert("Profile updated successfully!");
  } catch (err) {
    console.error("Error updating profile: ", err);
  }
});

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



