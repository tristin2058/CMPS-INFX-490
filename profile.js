import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const lastLoginEl = document.getElementById("lastLogin");
const profileImage = document.getElementById("profileImage");
const profileImageInput = document.getElementById("profileImageInput");

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
  if (isNaN(value)) return { label: "Unknown", color: "#999" };
  if (value < 18.5) return { label: "Underweight", color: "#2196f3" };
  if (value < 25) return { label: "Normal", color: "#4caf50" };
  if (value < 30) return { label: "Overweight", color: "#ff9800" };
  return { label: "Obese", color: "#f44336" };
}

function updateDOM(data, user) {
  displayName.textContent = data.displayName;
  username.textContent = `@${data.username}`;
  bio.textContent = data.bio || "";
  age.textContent = `Age: ${data.age}`;
  height.textContent = `Height: ${data.height}`;
  weight.textContent = `Weight: ${data.weight}`;
  gender.textContent = `Gender: ${data.gender}`;
  bmi.textContent = `BMI: ${data.bmi}`;

  const status = getHealthStatus(data.bmi);
  bmiStatusEl.textContent = status.label;
  bmiStatusEl.style.color = status.color;
  bmiStatusEl.style.fontWeight = "bold";

  if (registeredAtEl && data.registeredAt?.toDate) {
    const friendlyDate = data.registeredAt.toDate().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    registeredAtEl.textContent = friendlyDate;
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

      // ✅ Patch missing registeredAt timestamp if absent
      if (!data.registeredAt) {
        await updateDoc(docRef, { registeredAt: serverTimestamp() });
      }

      updateDOM(data, user);
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
  bio.style.display = "none";
  editBio.style.display = "block";
  age.style.display = "none";
  editAge.style.display = "inline-block";
  height.style.display = "none";
  editHeight.style.display = "inline-block";
  heightUnit.style.display = "inline-block";
  weight.style.display = "none";
  editWeight.style.display = "inline-block";
  weightUnit.style.display = "inline-block";
  gender.style.display = "none";
  editGender.style.display = "inline-block";
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
  let height = parseFloat(editHeight.value);
  let weight = parseFloat(editWeight.value);

  if (heightUnit.value === "cm") height /= 100;
  else if (heightUnit.value === "in") height *= 0.0254;
  else if (heightUnit.value === "ft") height *= 0.3048;

  if (weightUnit.value === "lb") weight *= 0.453592;

  const bmiValue = weight / (height * height);
  const roundedBmi = parseFloat(bmiValue.toFixed(1));

  const updatedData = {
    bio: editBio.value,
    age: parseInt(editAge.value, 10),
    height: `${editHeight.value} ${heightUnit.value}`,
    weight: `${editWeight.value} ${weightUnit.value}`,
    gender: editGender.value,
    bmi: roundedBmi
  };

  try {
    await setDoc(userDocRef, updatedData, { merge: true });
    alert("Profile updated successfully!");
    cancelEditButton.click();
  } catch (err) {
    console.error("Error updating profile:", err);
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


