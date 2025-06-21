"use client";
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
            doc.id === "Projects" ||
            doc.id === "profile"
          ) {
            collectionData[doc.id] = docData;
          }
        });

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

  // Helper to check if domain is mahbub.dev
  const isMahbubDev = () => {
    if (typeof window !== "undefined") {
      // Use env variable if available, fallback to window.location.hostname
      const allowedDomain =
        process.env.REACT_APP_ADMIN_FIREBASE_AUTH_DOMAIN || "mahbub.dev";
      return window.location.hostname === allowedDomain;
    }
    return false;
  };

  const addDocument = async (collectionName, newItem) => {
    if (!isMahbubDev()) {
      throw new Error("Data add/update is only allowed on mahbub.dev domain.");
    }

    const dbCollectionName =
      collectionName === "Experience" ? "Experiences" : collectionName;

    try {
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

      return { id: itemWithId.id };
    } catch (error) {
      console.error(`Error adding item to ${dbCollectionName}:`, error);
      throw error;
    }
  };

  const updateDocument = async (collectionName, documentId, updatedData) => {
    if (!isMahbubDev()) {
      throw new Error("Data add/update is only allowed on mahbub.dev domain.");
    }
    try {
      const docRef = doc(db, collectionName, documentId);

      // If it's a profile update
      if (collectionName === "portfolio_data" && documentId === "profile") {
        await setDoc(
          docRef,
          {
            ...updatedData,
            lastUpdate: serverTimestamp(),
          },
          { merge: true }
        );
        return;
      }

      // Existing update logic for other documents
      const currentDoc = await getDoc(docRef);
      if (currentDoc.exists()) {
        const currentData = currentDoc.data();
        const updatedItems = currentData.data.map((item) =>
          item.id === documentId
            ? { ...item, ...updatedData, updatedAt: new Date().toISOString() }
            : item
        );

        await setDoc(docRef, {
          data: updatedItems,
          lastUpdate: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
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
      }
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  };

  return {
    data: { ...data, ...portfolioData },
    addDocument,
    updateDocument,
    getCollection,
    deleteDocument,
  };
};

export default useFirestore;
