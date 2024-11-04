// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBMA3nCfa7v3nim319E3RIVMnjyzjN-6B4",
  authDomain: "has-mk.firebaseapp.com",
  projectId: "has-mk",
  storageBucket: "has-mk.firebasestorage.app",
  messagingSenderId: "932892361200",
  appId: "1:932892361200:web:2c76a18a7262d783485d35",
  measurementId: "G-119PGT715D"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Firestore
const db = getFirestore(app);
export { db };
