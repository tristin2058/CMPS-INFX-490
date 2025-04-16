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

const imageLinkInput = document.createElement("input");
imageLinkInput.type = "text";
imageLinkInput.placeholder = "Enter image URL";
imageLinkInput.id = "imageLinkInput";
profileImageInput.insertAdjacentElement("afterend", imageLinkInput);

imageLinkInput.addEventListener("change", async () => {
  const imageUrl = imageLinkInput.value.trim();
  if (imageUrl) {
    profileImage.src = imageUrl;
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "profile", user.uid);
      await updateDoc(docRef, { imageUrl });
    }
  }
});

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

  if (data.imageUrl) {
    profileImage.src = data.imageUrl;
    imageLinkInput.value = data.imageUrl;
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