import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../DB/DB_init";

export const setupAdminCredentials = async () => {
  try {
    const credentialsRef = doc(db, "admin", "credentials");

    // First check if credentials already exist
    const credentialsDoc = await getDoc(credentialsRef);

    if (!credentialsDoc.exists()) {
      // Only create default credentials if document doesn't exist
      await setDoc(credentialsRef, {
        username: "mahbub",
        password: "1234",
      });
      console.log("Default admin credentials created");
    }
  } catch (error) {
    console.error("Error handling admin credentials:", error);
  }
};

// Call this function to check/set credentials
setupAdminCredentials();
