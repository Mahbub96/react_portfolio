import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../DB/DB_init"; // Note: Updated the DB import path

export const setupAdminCredentials = async () => {
  try {
    // Create admin credentials document
    const credentialsRef = doc(db, "admin", "credentials");

    // Force create/update the document
    await setDoc(
      credentialsRef,
      {
        username: "mahbub",
        password: "1234",
      },
      { merge: true }
    );

    // Verify the document was created
    const verifyDoc = await getDoc(credentialsRef);
    if (verifyDoc.exists()) {
      console.log("Admin credentials created/updated successfully");
      console.log("Current credentials:", verifyDoc.data());
    } else {
      console.error("Failed to create admin credentials");
    }
  } catch (error) {
    console.error("Error creating admin credentials:", error);
  }
};
