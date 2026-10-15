"use client";
import { useState, useEffect, useCallback } from "react";

const usePortfolioData = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/portfolio", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio data");
      }
      const portfolioData = await response.json();
      setData(portfolioData);
      setError(null);
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const addDocument = async (collectionName, newItem) => {
    try {
      const response = await fetch(`/api/admin/portfolio/${collectionName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add document");
      }

      const result = await response.json();
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
        `/api/admin/portfolio/${collectionName}/${documentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update document");
      }

      const result = await response.json();
      await fetchPortfolioData();
      return result;
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  };

  const toggleVisibility = async (collectionName, documentId, published) => {
    try {
      const response = await fetch(
        `/api/admin/portfolio/${collectionName}/${documentId}/visibility`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to toggle visibility");
      }

      await fetchPortfolioData();
    } catch (error) {
      console.error(`Error toggling visibility in ${collectionName}:`, error);
      throw error;
    }
  };

  const reorderDocuments = async (collectionName, orderedIds) => {
    try {
      const response = await fetch(
        `/api/admin/portfolio/${collectionName}/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reorder documents");
      }

      await fetchPortfolioData();
    } catch (error) {
      console.error(`Error reordering ${collectionName}:`, error);
      throw error;
    }
  };

  const deleteDocument = async (collectionName, documentId) => {
    try {
      const response = await fetch(
        `/api/admin/portfolio/${collectionName}/${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete document");
      }

      await fetchPortfolioData();
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  };

  const updateSingleton = async (section, updatedData) => {
    try {
      const response = await fetch(`/api/admin/portfolio/singleton/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update ${section}`);
      }

      await fetchPortfolioData();
    } catch (error) {
      console.error(`Error updating singleton ${section}:`, error);
      throw error;
    }
  };

  const getCollection = (collectionName) => {
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
    toggleVisibility,
    reorderDocuments,
    getCollection,
    deleteDocument,
    updateSingleton,
    refreshData: fetchPortfolioData,
  };
};

export default usePortfolioData;
