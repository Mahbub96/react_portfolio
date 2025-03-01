import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../DB/DB_init"; // Note: Updated the DB import path

export const setupAdminCredentials = async () => {
  try {
    const credentialsRef = doc(db, "admin", "credentials");
    const credentialsDoc = await getDoc(credentialsRef);

    // Only create default credentials if they don't exist
    if (!credentialsDoc.exists()) {
      // Instead of hardcoding credentials, you should:
      // 1. Either prompt for initial setup
      // 2. Or use environment variables
      // 3. Or require manual setup through a secure channel
      console.warn(
        "No admin credentials found. Please set up admin credentials through a secure channel."
      );

      // For development only - remove in production
      if (process.env.NODE_ENV === "development") {
        await setDoc(credentialsRef, {
          username: process.env.REACT_APP_ADMIN_USERNAME || "admin",
          password: process.env.REACT_APP_ADMIN_PASSWORD || "admin123",
        });
      }
    }
  } catch (error) {
    console.error("Error setting up admin credentials:", error);
  }
};
