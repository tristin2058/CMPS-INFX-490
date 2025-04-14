import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("registrationForm");
const genderSelect = document.getElementById("gender");
const genderOtherInput = document.getElementById("genderOther");

const heightUnitSelect = document.getElementById("heightUnit");
const heightCmInput = document.getElementById("heightCm");
const heightImperialGroup = document.getElementById("heightImperial");
const heightFtInput = document.getElementById("heightFt");
const heightInInput = document.getElementById("heightIn");

// Show/hide "Other" gender input
genderSelect.addEventListener("change", () => {
  if (genderSelect.value === "Other") {
    genderOtherInput.style.display = "block";
    genderOtherInput.required = true;
  } else {
    genderOtherInput.style.display = "none";
    genderOtherInput.required = false;
  }
});

// Toggle height input method
heightUnitSelect.addEventListener("change", () => {
  if (heightUnitSelect.value === "cm") {
    heightCmInput.style.display = "block";
    heightImperialGroup.style.display = "none";
  } else {
    heightCmInput.style.display = "none";
    heightImperialGroup.style.display = "flex";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const displayName = document.getElementById("displayName").value;
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const age = parseInt(document.getElementById("age").value);
  const gender =
    genderSelect.value === "Other"
      ? genderOtherInput.value.trim()
      : genderSelect.value;

  const weight = parseFloat(document.getElementById("weight").value);
  const weightUnit = document.getElementById("weightUnit").value;

  const heightUnit = heightUnitSelect.value;
  let heightMeters, heightText;

  if (heightUnit === "cm") {
    const heightCm = parseFloat(heightCmInput.value);
    heightMeters = heightCm / 100;
    heightText = `${heightCm} cm`;
  } else {
    const ft = parseFloat(heightFtInput.value) || 0;
    const inches = parseFloat(heightInInput.value) || 0;
    const totalInches = (ft * 12) + inches;
    heightMeters = totalInches * 0.0254;
    heightText = `${(totalInches / 12).toFixed(2)} ft`;
  }

  let weightKg = weight;
  if (weightUnit === "lb") weightKg = weight * 0.453592;

  const bmi = (weightKg / (heightMeters ** 2)).toFixed(2);

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await setDoc(doc(db, "profile", user.uid), {
      displayName,
      username,
      email,
      age,
      gender,
      height: heightText,
      weight: `${weight} ${weightUnit}`,
      bmi
    });

    alert("Registration successful!");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
});

