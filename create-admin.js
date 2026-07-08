import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function createAdmin() {
  const email = "admin@digitalsolution.com";
  const password = "AdminPassword123!";
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role: "admin",
      createdAt: Date.now()
    });
    console.log("Admin created successfully:", email, password);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
       console.log("Admin already exists:", email);
    } else {
       console.error("Error creating admin:", error);
    }
  }
  process.exit(0);
}
createAdmin();
