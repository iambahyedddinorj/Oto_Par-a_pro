
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot 
} from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";
import { User } from "../types";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication Functions
export const loginUser = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const registerUser = async (email: string, pass: string, additionalData: any) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  
  // Create user document in Firestore
  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    email: email,
    username: additionalData.username,
    name: additionalData.name,
    role: "user",
    isApproved: false,
    allowedBrands: []
  });

  return user;
};

export const logoutUser = async () => {
  return await signOut(auth);
};

// Firestore Functions
export const getUserData = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as User;
  } else {
    return null;
  }
};

export const createMissingUserDoc = async (uid: string, email: string | null) => {
  // If a user logs in but has no Firestore doc, create a default one
  const newUser: User = {
    id: uid,
    email: email || "",
    username: email?.split('@')[0] || "user",
    name: "Yeni Kullanıcı",
    role: "user",
    isApproved: false,
    allowedBrands: []
  };
  await setDoc(doc(db, "users", uid), newUser);
  return newUser;
};

// Real-time listener for user list (Admin Panel)
export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = collection(db, "users");
  return onSnapshot(q, (querySnapshot) => {
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    callback(users);
  });
};

export const updateUserData = async (uid: string, data: Partial<User>) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};
