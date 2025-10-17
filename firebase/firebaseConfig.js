// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBs_oXCbHGXf9yffZ82VjiMVeNQRMT2rd4",
  authDomain: "to-do-app-228e4.firebaseapp.com",
  projectId: "to-do-app-228e4",
  storageBucket: "to-do-app-228e4.appspot.com",
  messagingSenderId: "361156192111",
  appId: "1:361156192111:web:3d63b4d0b4378bf196ea9a",
  measurementId: "G-J02K73FPES"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);
 const db = getFirestore(app);

export {app, auth, db};