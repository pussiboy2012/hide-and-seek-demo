// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMA3nCfa7v3nim319E3RIVMnjyzjN-6B4",
  authDomain: "has-mk.firebaseapp.com",
  projectId: "has-mk",
  storageBucket: "has-mk.firebasestorage.app",
  messagingSenderId: "932892361200",
  appId: "1:932892361200:web:2c76a18a7262d783485d35",
  measurementId: "G-119PGT715D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);