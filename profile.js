// Finalized profile.js with animated edit toggle and fixes
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

// Element references
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
const editHeight = document.getElementById("editHeight");
const heightUnit = document.getElementById("heightUnit");
const editWeight = document.getElementById("editWeight");
const weightUnit = document.getElementById("weightUnit");
const editGender = document.getElementById("editGender");

let originalData = {}; // Stores snapshot for cancel

function getHealthStatus(bmi) {
  const value = parseFloat(bmi);
  if (isNaN(value)) return { label: "Unknown", color: "#999" };
  if (value < 18.5) return { label: "Underweight", color: "#2196f3" };
  if (value < 25) return { label: "Normal", color: "#4caf50" };
  if (value < 30) return { label: "Overweight", color: "#ff9800" };
  return { label: "Obese", color: "#f44336" };
}

editBio.addEventListener("input", () => {
  if (editBio.value.length > 200) {
    editBio.value = editBio.value.substring(0, 200);
  }
  bioCharCount.textContent = `${editBio.value.length}/200`;
});

function updateDOM(data, user) {
  originalData = structuredClone(data);

  displayName.textContent = data.displayName || "—";
  username.textContent = data.username ? `@${data.username}` : "@—";
  bio.textContent = data.bio || "—";
  age.textContent = data.age ?? "—";
  height.textContent = data.height ?? "—";
  weight.textContent = data.weight ?? "—";
  gender.textContent = data.gender ?? "—";
  bmi.textContent = data.bmi ?? "—";

  const status = getHealthStatus(data.bmi);
  bmiStatusEl.textContent = status.label;
  bmiStatusEl.style.color = status.color;
  bmiStatusEl.style.fontWeight = "bold";

  if (registeredAtEl && data.registeredAt?.toDate) {
    registeredAtEl.textContent = data.registeredAt.toDate().toLocaleDateString();
  } else {
    registeredAtEl.textContent = "—";
  }

  if (lastLoginEl && user.metadata?.lastSignInTime) {
    lastLoginEl.textContent = new Date(user.metadata.lastSignInTime).toLocaleString();
  }

  if (data.localImageBase64) {
    profileImage.src = data.localImageBase64;
  }

  editBio.value = data.bio || "";
  bioCharCount.textContent = `${editBio.value.length}/200`;
  editAge.value = data.age || "";
  editHeight.value = data.height?.split(" ")[0] || "";
  heightUnit.value = data.height?.split(" ")[1] || "cm";
  editWeight.value = data.weight?.split(" ")[0] || "";
  weightUnit.value = data.weight?.split(" ")[1] || "kg";
  editGender.value = data.gender || "";
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
  toggleEdit(true);
});

saveProfileButton.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const ageVal = parseInt(editAge.value);
  const weightVal = parseFloat(editWeight.value);
  const heightVal = parseFloat(editHeight.value);
  const bioVal = editBio.value.trim().slice(0, 200);

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
    height: `${heightVal} ${heightUnit.value}`,
    weight: `${weightVal} ${weightUnit.value}`,
    gender: editGender.value.trim()
  };

  let heightMeters = heightVal;
  if (heightUnit.value === "in") heightMeters *= 0.0254;
  else if (heightUnit.value === "ft") heightMeters *= 0.3048;
  else heightMeters /= 100;

  if (heightMeters && weightVal) {
    updatedData.bmi = (weightVal / (heightMeters * heightMeters)).toFixed(1);
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
  editBio.value = originalData.bio || "";
  editAge.value = originalData.age || "";
  editHeight.value = originalData.height?.split(" ")[0] || "";
  heightUnit.value = originalData.height?.split(" ")[1] || "cm";
  editWeight.value = originalData.weight?.split(" ")[0] || "";
  weightUnit.value = originalData.weight?.split(" ")[1] || "kg";
  editGender.value = originalData.gender || "";

  toggleEdit(false);
});

function toggleEdit(isEditing) {
  const togglePair = (staticEl, editEl) => {
    staticEl.parentElement.classList.toggle("show", !isEditing);
    editEl.parentElement.classList.toggle("show", isEditing);
  };

  togglePair(bio, editBio);
  togglePair(age, editAge);
  togglePair(height, editHeight);
  togglePair(weight, editWeight);
  togglePair(gender, editGender);

  heightUnit.parentElement.classList.toggle("show", isEditing);
  weightUnit.parentElement.classList.toggle("show", isEditing);

  editProfileButton.style.display = isEditing ? "none" : "inline-block";
  saveProfileButton.style.display = isEditing ? "inline-block" : "none";
  cancelEditButton.style.display = isEditing ? "inline-block" : "none";
}

