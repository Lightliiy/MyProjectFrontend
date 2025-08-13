// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNCet5FtCiQ6aL_uZH78VoyGOoSZJC6kw",
  authDomain: "counselling-project-11857.firebaseapp.com",
  projectId: "counselling-project-11857",
  storageBucket: "counselling-project-11857.firebasestorage.app",
  messagingSenderId: "555612823997",
  appId: "1:555612823997:web:9a4ec741dd5abfa4a772d4",
  measurementId: "G-WXZXHE749B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, firebaseConfig, analytics };