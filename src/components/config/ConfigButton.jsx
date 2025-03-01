import React, { useState, useEffect } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../DB/DB_init";
import styles from "./configButton.module.css";

const ConfigButton = () => {
  const { auth } = useDataContex();
  const [isOpen, setIsOpen] = useState(false);
  const [configData, setConfigData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const createInitialData = async () => {
    try {
      // Initial Education data
      await setDoc(doc(db, "Education", "education1"), {
        name: "Daffodil International University",
        time: "2019 - Present",
        degName: "Bachelor of Science",
        Department: "Computer Science and Engineering",
        cgpa: "3.75",
        group: "Science",
        Thesis: "Deep Learning Based Bangla Sign Language Recognition",
      });

      // Initial Experiences data
      await setDoc(doc(db, "Experiences", "exp1"), {
        name: "Junior Software Engineer",
        time: "September 2023 - Present",
        how: "Working at Brotecs Technologies Ltd, specializing in backend development of web applications and cloud-based VoIP solutions.",
      });

      // Initial Skills data
      const skills = [
        { name: "PHP", src: "/assets/img/php.png" },
        { name: "Laravel", src: "/assets/img/laravel.png" },
        { name: "CodeIgniter", src: "/assets/img/codeigniter.png" },
        { name: "Node.js", src: "/assets/img/nodejs.png" },
        { name: "Python", src: "/assets/img/python.png" },
        { name: "React.js", src: "/assets/img/react.png" },
        { name: "JavaScript", src: "/assets/img/javascript.png" },
        { name: "Tailwind CSS", src: "/assets/img/tailwind.png" },
        { name: "Material-UI", src: "/assets/img/mui.png" },
        { name: "Bootstrap", src: "/assets/img/bootstrap.png" },
        { name: "AWS", src: "/assets/img/aws.png" },
        { name: "Docker", src: "/assets/img/docker.png" },
        { name: "Git", src: "/assets/img/git.png" },
        { name: "Linux", src: "/assets/img/linux.png" },
        { name: "ASTPP", src: "/assets/img/astpp.png" },
      ];

      // Add each skill
      for (let i = 0; i < skills.length; i++) {
        await setDoc(doc(db, "Skills", `skill${i + 1}`), skills[i]);
      }

      // Initial Projects data
      const projects = [
        {
          name: "Portfolio Website",
          desc: "Personal portfolio built with React and Firebase",
          src: "/assets/img/portfolio.jpg",
          lang: ["React", "Firebase", "CSS Modules"],
        },
        {
          name: "VoIP Solution",
          desc: "Cloud-based VoIP calling solution with ASTPP",
          src: "/assets/img/voip.jpg",
          lang: ["PHP", "Laravel", "ASTPP", "AWS"],
        },
        {
          name: "Sign Language Recognition",
          desc: "Deep Learning based Bangla sign language recognition system",
          src: "/assets/img/sign-language.jpg",
          lang: ["Python", "TensorFlow", "OpenCV"],
        },
      ];

      // Add each project
      for (let i = 0; i < projects.length; i++) {
        await setDoc(doc(db, "Projects", `project${i + 1}`), projects[i]);
      }

      console.log("Initial portfolio data created successfully");
    } catch (error) {
      console.error("Error creating initial data:", error);
      throw error;
    }
  };

  const fetchAllCollections = async () => {
    const collections = [
      "admin",
      "analytics",
      "Education",
      "Experiences",
      "Projects",
      "Skills",
    ];
    const allData = {};

    try {
      for (const collectionName of collections) {
        console.log(`Fetching collection: ${collectionName}`);
        const querySnapshot = await getDocs(collection(db, collectionName));
        allData[collectionName] = {};

        if (querySnapshot.empty) {
          console.log(`Collection ${collectionName} is empty`);
          // If collections are empty, create initial data
          if (collectionName !== "admin" && collectionName !== "analytics") {
            console.log(`Creating initial data for ${collectionName}`);
            await createInitialData();
            // Fetch again after creating data
            const newSnapshot = await getDocs(collection(db, collectionName));
            newSnapshot.forEach((doc) => {
              allData[collectionName][doc.id] = doc.data();
            });
          }
        } else {
          querySnapshot.forEach((doc) => {
            console.log(`Found document in ${collectionName}:`, doc.id);
            allData[collectionName][doc.id] = doc.data();
          });
        }
      }

      console.log("All collected data:", allData);
      return allData;
    } catch (error) {
      console.error("Error in fetchAllCollections:", error);
      throw error;
    }
  };

  // Check and create initial backup if needed
  useEffect(() => {
    const checkInitialBackup = async () => {
      try {
        setIsLoading(true);
        // Check if initial backup exists
        const initialBackupRef = doc(db, "backups", "initial_backup");
        const initialBackupDoc = await getDoc(initialBackupRef);

        if (!initialBackupDoc.exists()) {
          console.log("No initial backup found, creating one...");
          // Fetch all current data
          const currentData = await fetchAllCollections();

          if (Object.keys(currentData).length === 0) {
            console.error("No data found in collections");
            return;
          }

          // Create initial backup
          await setDoc(initialBackupRef, {
            info: {
              id: "initial_backup",
              timestamp: new Date().toISOString(),
              createdAt: new Date(),
              type: "initial_backup",
              collections: Object.keys(currentData),
              summary: Object.entries(currentData).reduce(
                (acc, [collection, data]) => {
                  acc[collection] = Object.keys(data).length;
                  return acc;
                },
                {}
              ),
            },
            data: currentData,
          });

          console.log("Initial backup created successfully");
          setConfigData(currentData);
        } else {
          console.log("Initial backup exists:", initialBackupDoc.data());
          setConfigData(initialBackupDoc.data().data);
        }
      } catch (error) {
        console.error("Error checking/creating initial backup:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (auth) {
      checkInitialBackup();
    }
  }, [auth]);

  // Only show in development mode and when authenticated
  if (process.env.NODE_ENV !== "development" || !auth) return null;

  const handleConfigClick = async () => {
    try {
      setIsLoading(true);
      setStatus(null);

      const currentData = await fetchAllCollections();
      setConfigData(currentData);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching config:", error);
      setStatus({
        type: "error",
        message: "Failed to fetch current configuration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    if (
      !window.confirm(
        "WARNING: This will create a backup of the current data. Continue?"
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setStatus(null);

      // Use current data instead of fetching fresh data
      const timestamp = new Date().toISOString();
      const backupId = `backup_${timestamp.split(".")[0].replace(/[:]/g, "-")}`;

      // Save backup info
      const backupInfo = {
        id: backupId,
        timestamp,
        createdAt: new Date(),
        collections: Object.keys(configData),
        summary: Object.entries(configData).reduce(
          (acc, [collection, data]) => {
            acc[collection] = Object.keys(data).length;
            return acc;
          },
          {}
        ),
      };

      // Save the backup with current data
      await setDoc(doc(db, "backups", backupId), {
        info: backupInfo,
        data: configData,
      });

      setStatus({
        type: "success",
        message: `Backup created successfully! ID: ${backupId}`,
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      setStatus({ type: "error", message: "Failed to create backup" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (
      !window.confirm(
        "WARNING: This will overwrite all current data with the backup. This action cannot be undone. Are you sure?"
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setStatus(null);

      // Fetch fresh data before restore (as a safety backup)
      const preRestoreData = await fetchAllCollections();
      const timestamp = new Date().toISOString();
      const safetyBackupId = `safety_backup_${timestamp
        .split(".")[0]
        .replace(/[:]/g, "-")}`;

      // Create safety backup
      await setDoc(doc(db, "backups", safetyBackupId), {
        info: {
          id: safetyBackupId,
          timestamp,
          createdAt: new Date(),
          type: "safety_backup",
          collections: Object.keys(preRestoreData),
        },
        data: preRestoreData,
      });

      // Restore each collection
      for (const [collectionName, docs] of Object.entries(configData)) {
        // Delete existing documents
        const existingDocs = await getDocs(collection(db, collectionName));
        for (const doc of existingDocs.docs) {
          await deleteDoc(doc.ref);
        }

        // Create new documents from backup
        for (const [docId, data] of Object.entries(docs)) {
          await setDoc(doc(db, collectionName, docId), data);
        }
      }

      setStatus({
        type: "success",
        message: "Configuration restored successfully! Safety backup created.",
      });
    } catch (error) {
      console.error("Error restoring config:", error);
      setStatus({ type: "error", message: "Failed to restore configuration" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className={styles.configButton}
        onClick={handleConfigClick}
        title="Configuration Manager"
        disabled={isLoading}
      >
        <i className={`fa ${isLoading ? "fa-spinner fa-spin" : "fa-cog"}`}></i>
      </button>

      {isOpen && (
        <div className={styles.configModal}>
          <div className={styles.configContent}>
            <div className={styles.configHeader}>
              <h2>Configuration Manager</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>

            {status && (
              <div className={`${styles.status} ${styles[status.type]}`}>
                {status.message}
              </div>
            )}

            <div className={styles.configBody}>
              <div className={styles.configActions}>
                <button
                  className={styles.backupButton}
                  onClick={handleBackup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <i className="fa fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fa fa-save"></i>
                      Create Backup
                    </>
                  )}
                </button>
                <button
                  className={`${styles.restoreButton} ${
                    isLoading ? styles.loading : ""
                  }`}
                  onClick={handleRestore}
                  disabled={isLoading || !configData}
                >
                  {isLoading ? (
                    <i className="fa fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fa fa-history"></i>
                      Restore Configuration
                    </>
                  )}
                </button>
              </div>
              <pre>{JSON.stringify(configData, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfigButton;
