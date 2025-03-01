import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./../DB/DB_init";

const useFirestore = () => {
  const [data, setData] = useState({});
  const [portfolioData, setPortfolioData] = useState({});

  useEffect(() => {
    // Listen to portfolio_data collection
    const portfolioUnsubscribe = onSnapshot(
      collection(db, "portfolio_data"),
      (snapshot) => {
        const newPortfolioData = {};
        const collectionData = {};

        snapshot.forEach((doc) => {
          const docData = doc.data();
          newPortfolioData[doc.id] = docData;

          // Group data by collection
          if (
            doc.id === "Experiences" ||
            doc.id === "Skills" ||
            doc.id === "Projects"
          ) {
            collectionData[doc.id] = {
              data: Array.isArray(docData.data) ? docData.data : [],
              lastUpdate: new Date().getTime(),
            };
          }
        });

        console.log("Fetched portfolio_data:", newPortfolioData);
        setPortfolioData(newPortfolioData);
        setData(collectionData);
      },
      (error) => {
        console.error("Error fetching portfolio_data:", error);
      }
    );

    return () => {
      portfolioUnsubscribe();
    };
  }, []);

  const addDocument = async (collectionName, newItem) => {
    const dbCollectionName =
      collectionName === "Experience" ? "Experiences" : collectionName;

    try {
      console.log(`Adding item to ${dbCollectionName}:`, newItem);

      // Check for duplicates if it's a skill
      if (dbCollectionName === "Skills") {
        const existingSkills = getCollection("Skills");
        const skillExists = existingSkills.some(
          (skill) => skill.name.toLowerCase() === newItem.name.toLowerCase()
        );
        if (skillExists) {
          throw new Error(`Skill "${newItem.name}" already exists`);
        }
      }

      // Get current items from the collection
      const currentDoc = portfolioData[dbCollectionName] || { data: [] };
      const currentItems = Array.isArray(currentDoc.data)
        ? currentDoc.data
        : [];

      // Add new item with ID
      const itemWithId = {
        ...newItem,
        id: `${dbCollectionName}_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update the document in portfolio_data
      await setDoc(
        doc(db, "portfolio_data", dbCollectionName),
        {
          data: [...currentItems, itemWithId],
          lastUpdate: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`Item added successfully to ${dbCollectionName}`);
      return { id: itemWithId.id };
    } catch (error) {
      console.error(`Error adding item to ${dbCollectionName}:`, error);
      throw error;
    }
  };

  const updateDocument = async (collectionName, itemId, updatedData) => {
    const dbCollectionName =
      collectionName === "Experience" ? "Experiences" : collectionName;

    try {
      console.log(`Updating item in ${dbCollectionName}:`, itemId, updatedData);

      // Get current items
      const currentDoc = portfolioData[dbCollectionName] || { data: [] };
      const currentItems = Array.isArray(currentDoc.data)
        ? currentDoc.data
        : [];

      // Update the specific item
      const updatedItems = currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...updatedData,
              updatedAt: new Date().toISOString(),
            }
          : item
      );

      // Update the document in portfolio_data
      await setDoc(
        doc(db, "portfolio_data", dbCollectionName),
        {
          data: updatedItems,
          lastUpdate: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`Item updated successfully in ${dbCollectionName}`);
      return { id: itemId };
    } catch (error) {
      console.error(`Error updating item in ${dbCollectionName}:`, error);
      throw error;
    }
  };

  const getCollection = (collectionName) => {
    // Handle collection name for Experiences
    const dbCollectionName =
      collectionName === "Experience" ? "Experiences" : collectionName;

    if (dbCollectionName === "portfolio_data") {
      return portfolioData;
    }
    return data[dbCollectionName]?.data || [];
  };

  const deleteDocument = async (collectionName, documentId) => {
    try {
      const docRef = doc(db, "portfolio_data", collectionName);
      const currentDoc = await getDoc(docRef);

      if (currentDoc.exists()) {
        const currentData = currentDoc.data();
        const updatedData = {
          data: currentData.data.filter((item) => item.id !== documentId),
          lastUpdate: serverTimestamp(),
        };

        await setDoc(docRef, updatedData);
        console.log(`Document deleted successfully from ${collectionName}`);
      }
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  };

  // Debug function to check data
  useEffect(() => {
    console.log("Current Firestore Data:", {
      collections: data,
      portfolioData,
    });
  }, [data, portfolioData]);

  return {
    data: { ...data, ...portfolioData },
    addDocument,
    updateDocument,
    getCollection,
    deleteDocument,
  };
};

export default useFirestore;
