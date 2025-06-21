"use client";
import { useState, useEffect } from "react";

const usePortfolioData = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/portfolio");
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio data");
      }
      const portfolioData = await response.json();
      setData(portfolioData);
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async (collectionName, newItem) => {
    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ collectionName, newItem }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add document");
      }

      const result = await response.json();

      // Refresh data after adding
      await fetchPortfolioData();

      return result;
    } catch (error) {
      console.error(`Error adding item to ${collectionName}:`, error);
      throw error;
    }
  };

  const updateDocument = async (collectionName, documentId, updatedData) => {
    try {
      const response = await fetch(
        `/api/portfolio/${collectionName}/${documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update document");
      }

      // Refresh data after updating
      await fetchPortfolioData();
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  };

  const deleteDocument = async (collectionName, documentId) => {
    try {
      const response = await fetch(
        `/api/portfolio/${collectionName}/${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete document");
      }

      // Refresh data after deleting
      await fetchPortfolioData();
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  };

  const getCollection = (collectionName) => {
    // Handle collection name for Experiences
    const dbCollectionName =
      collectionName === "Experience" ? "Experiences" : collectionName;

    if (dbCollectionName === "portfolio_data") {
      return data;
    }
    return data[dbCollectionName]?.data || [];
  };

  return {
    data: { ...data },
    loading,
    error,
    addDocument,
    updateDocument,
    getCollection,
    deleteDocument,
    refreshData: fetchPortfolioData,
  };
};

export default usePortfolioData;
