import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("registrationForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const displayName = document.getElementById("displayName").value;
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const age = parseInt(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const height = parseFloat(document.getElementById("height").value);
  const heightUnit = document.getElementById("heightUnit").value;
  const weight = parseFloat(document.getElementById("weight").value);
  const weightUnit = document.getElementById("weightUnit").value;

  let heightMeters = height;
  if (heightUnit === "cm") heightMeters = height / 100;
  else if (heightUnit === "in") heightMeters = height * 0.0254;
  else if (heightUnit === "ft") heightMeters = height * 0.3048;

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
      height: `${height} ${heightUnit}`,
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
