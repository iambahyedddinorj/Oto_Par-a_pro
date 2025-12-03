/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPuNKIyVKwGHWaPwYlb1Lu9irdBLcdkic",
  authDomain: "oto-parca-pro.firebaseapp.com",
  projectId: "oto-parca-pro",
  storageBucket: "oto-parca-pro.firebasestorage.app",
  messagingSenderId: "41893729916",
  appId: "1:41893729916:web:6b024efb76efe481031bf9",
  measurementId: "G-WDYM78DQ2D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);