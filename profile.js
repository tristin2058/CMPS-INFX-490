import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const lastLoginEl = document.getElementById("lastLogin");
const profileImage = document.getElementById("profileImage");
const profileImageInput = document.getElementById("profileImageInput");

const editProfileButton = document.getElementById("editProfileButton");
const saveProfileButton = document.getElementById("saveProfileButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const editBio = document.getElementById("editBio");
const bioCharCount = document.getElementById("bioCharCount");
const editAge = document.getElementById("editAge");
const editWeight = document.getElementById("editWeight");
const weightUnit = document.getElementById("weightUnit");
const editGender = document.getElementById("editGender");
const customGenderInput = document.getElementById("customGender");

const editHeightCm = document.getElementById("editHeightCm");
const editHeightFt = document.getElementById("editHeightFt");
const editHeightIn = document.getElementById("editHeightIn");
const heightUnit = document.getElementById("heightUnit");
const imperialHeightFields = document.getElementById("editHeightImperial");

const pronounsDisplay = document.getElementById("pronounsDisplay");
const editPronouns = document.getElementById("editPronouns");
const customPronounsInput = document.getElementById("customPronouns");

let originalData = {};

editBio.addEventListener("input", () => {
  if (editBio.value.length > 200) {
    editBio.value = editBio.value.substring(0, 200);
  }
  bioCharCount.textContent = `${editBio.value.length}/200`;
});

editPronouns.addEventListener("change", () => {
  customPronounsInput.style.display = editPronouns.value === "Custom" ? "block" : "none";
});

editGender.addEventListener("change", () => {
  customGenderInput.style.display = editGender.value === "Other" ? "block" : "none";
});

heightUnit.addEventListener("change", () => {
  if (heightUnit.value === "cm") {
    editHeightCm.style.display = "block";
    imperialHeightFields.style.display = "none";
  } else {
    editHeightCm.style.display = "none";
    imperialHeightFields.style.display = "flex";
  }
});

function getHealthStatus(bmi) {
  const value = parseFloat(bmi);
  if (isNaN(value)) return { label: "Unknown", color: "#999" };
  if (value < 18.5) return { label: "Underweight", color: "#2196f3" };
  if (value < 25) return { label: "Normal", color: "#4caf50" };
  if (value < 30) return { label: "Overweight", color: "#ff9800" };
  return { label: "Obese", color: "#f44336" };
}

function updateDOM(data, user) {
  originalData = structuredClone(data);

  displayName.textContent = data.displayName || "—";
  username.textContent = data.username ? `@${data.username}` : "@—";
  bio.textContent = data.bio || "—";
  age.textContent = data.age ?? "—";
  editAge.value = data.age ?? "";
  height.textContent = data.height ?? "—";
  weight.textContent = data.weight ?? "—";
  gender.textContent = data.gender ?? "—";
  bmi.textContent = data.bmi ?? "—";
  const status = getHealthStatus(data.bmi);
  bmiStatusEl.textContent = status.label;
  bmiStatusEl.style.color = status.color;



  const pronouns = data.pronouns || "";
  pronounsDisplay.textContent = pronouns ? `(${pronouns})` : "";
  editPronouns.value = ["He/Him", "She/Her", "They/Them", "Any Pronouns"].includes(pronouns) ? pronouns : "Custom";
  customPronounsInput.value = editPronouns.value === "Custom" ? pronouns : "";
  customPronounsInput.style.display = editPronouns.value === "Custom" ? "block" : "none";

  if (["Male", "Female", "Non-binary", "Prefer not to say"].includes(data.gender)) {
    editGender.value = data.gender;
    customGenderInput.style.display = "none";
  } else {
    editGender.value = "Other";
    customGenderInput.style.display = "block";
    customGenderInput.value = data.gender || "";
  }

  const [heightVal, unit] = (data.height || "").split(" ");
  heightUnit.value = unit || "cm";

  if (unit === "ft") {
    const feetVal = parseFloat(heightVal);
    editHeightFt.value = Math.floor(feetVal);
    editHeightIn.value = Math.round((feetVal - Math.floor(feetVal)) * 12);
    editHeightCm.style.display = "none";
    imperialHeightFields.style.display = "flex";
  } else {
    editHeightCm.value = heightVal || "";
    editHeightCm.style.display = "block";
    imperialHeightFields.style.display = "none";
  }

  editWeight.value = data.weight?.split(" ")[0] || "";
  weightUnit.value = data.weight?.split(" ")[1] || "kg";

  if (data.registeredAt?.seconds) {
    const registeredDate = new Date(data.registeredAt.seconds * 1000);
    registeredAtEl.textContent = registeredDate.toLocaleDateString();
  }
  
  if (user?.metadata?.lastSignInTime) {
    const lastLoginDate = new Date(user.metadata.lastSignInTime);
    lastLoginEl.textContent = lastLoginDate.toLocaleDateString();
  }
  
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "sign-in.html");

  const docRef = doc(db, "profile", user.uid);
  onSnapshot(docRef, async (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();

      if (!data.registeredAt) {
        await updateDoc(docRef, { registeredAt: serverTimestamp() });
        return;
      }

      if (saveProfileButton.style.display === "none") {
        updateDOM(data, user);
      }
    }
  });
});

if (profileImageInput) {
  profileImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;
      profileImage.src = base64Image;

      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "profile", user.uid);
        await updateDoc(docRef, { localImageBase64: base64Image });
      }
    };
    reader.readAsDataURL(file);
  });
}

editProfileButton.addEventListener("click", () => {
  console.log("Edit button clicked");
  toggleEdit(true);
});

saveProfileButton.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const ageVal = parseInt(editAge.value);
  const weightVal = parseFloat(editWeight.value);
  let heightVal, heightText;

  if (heightUnit.value === "cm") {
    heightVal = parseFloat(editHeightCm.value);
    heightText = `${heightVal} cm`;
  } else {
    const ft = parseFloat(editHeightFt.value) || 0;
    const inches = parseFloat(editHeightIn.value) || 0;
    heightVal = (ft * 12) + inches;
    heightText = `${(heightVal / 12).toFixed(2)} ft`;
  }

  const bioVal = editBio.value.trim().slice(0, 200);
  const pronounsVal = editPronouns.value === "Custom" ? customPronounsInput.value.trim() : editPronouns.value;
  const genderVal = editGender.value === "Other" ? customGenderInput.value.trim() : editGender.value.trim();

  if (isNaN(ageVal) || isNaN(weightVal) || isNaN(heightVal)) {
    alert("Please enter valid numbers for age, height, and weight.");
    return;
  }

  const docRef = doc(db, "profile", user.uid);
  const currentSnap = await getDoc(docRef);
  const currentData = currentSnap.exists() ? currentSnap.data() : {};

  const updatedData = {
    displayName: currentData.displayName || user.displayName || "—",
    username: currentData.username || user.email?.split("@")[0] || "—",
    bio: bioVal,
    age: ageVal,
    height: heightText,
    heightInInches: heightUnit.value === "cm" ? null : heightVal,
    weight: `${weightVal} ${weightUnit.value}`,
    gender: genderVal,
    pronouns: pronounsVal
  };

  let heightMeters;
  if (heightUnit.value === "cm") {
    heightMeters = heightVal / 100;
  } else {
    heightMeters = updatedData.heightInInches * 0.0254;
  }

  if (heightMeters && weightVal) {
    const weightKg = weightUnit.value === "lb" ? weightVal * 0.453592 : weightVal;
    updatedData.bmi = (weightKg / (heightMeters * heightMeters)).toFixed(1);
  }

  try {
    await updateDoc(docRef, updatedData);
    updateDOM(updatedData, user);
    toggleEdit(false);
  } catch (err) {
    console.error("Error saving:", err);
    alert("Failed to save profile. Try again.");
  }
});

cancelEditButton.addEventListener("click", () => {
  updateDOM(originalData, auth.currentUser);
  toggleEdit(false);
});

function toggleEdit(isEditing) {
  const togglePair = (staticEl, editEl) => {
    staticEl.parentElement.classList.toggle("show", !isEditing);
    editEl.parentElement.classList.toggle("show", isEditing);
  };

  togglePair(bio, editBio);
  togglePair(age, editAge);
  togglePair(weight, editWeight);
  togglePair(gender, editGender);
  togglePair(pronounsDisplay, editPronouns);

  const heightDisplay = height.closest(".fade-toggle");
  const heightEdit = editHeightCm.closest(".fade-toggle");
  if (heightDisplay && heightEdit) {
    heightDisplay.classList.toggle("show", !isEditing);
    heightEdit.classList.toggle("show", isEditing);
  }

  const weightDisplay = weight.closest(".fade-toggle");
  const weightEdit = editWeight.closest(".fade-toggle");
  if (weightDisplay && weightEdit) {
    weightDisplay.classList.toggle("show", !isEditing);
    weightEdit.classList.toggle("show", isEditing);
  }

  heightUnit.closest(".fade-toggle")?.classList.toggle("show", isEditing);
  weightUnit.closest(".fade-toggle")?.classList.toggle("show", isEditing);
  customPronounsInput.style.display = isEditing && editPronouns.value === "Custom" ? "block" : "none";
  customGenderInput.style.display = isEditing && editGender.value === "Other" ? "block" : "none";

  editProfileButton.style.display = isEditing ? "none" : "inline-block";
  saveProfileButton.style.display = isEditing ? "inline-block" : "none";
  cancelEditButton.style.display = isEditing ? "inline-block" : "none";
}


