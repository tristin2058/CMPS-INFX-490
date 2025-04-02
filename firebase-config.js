import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js"; // ✅ NEW

const firebaseConfig = {
  apiKey: "AIzaSyDA54ZzIYxmSBLmnTXsFtFJAi4CHmxVTDU",
  authDomain: "authentication-6de40.firebaseapp.com",
  projectId: "authentication-6de40",
  storageBucket: "authentication-6de40.appspot.com",
  messagingSenderId: "964307532417",
  appId: "1:964307532417:web:1d5a265837649451c6ab80",
  measurementId: "G-229EJRNSZE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 

export { auth, db, storage }; 


