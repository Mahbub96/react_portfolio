"use client";
import React, { useState } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import usePortfolioData from "../../hooks/usePortfolioData";
import ModalView from "../ModalView";
import styles from "./skills.module.css";

function SkillsClient({ skills }) {
  const [modalShow, setModalShow] = useState(false);
  const { auth } = useDataContex();
  const { deleteDocument } = usePortfolioData();
  const [selectedSkill, setSelectedSkill] = useState(null);

  const handleEdit = (skill) => {
    setSelectedSkill(skill);
    setModalShow(true);
  };

  const handleDelete = async (skill) => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Are you sure you want to delete this skill?")
    ) {
      try {
        await deleteDocument("Skills", skill.id);
      } catch (error) {
        console.error("Error deleting skill:", error);
      }
    }
  };

  // Only render client-side features if admin is authenticated
  if (!auth) {
    return null;
  }

  return (
    <>
      {/* Admin action buttons for existing skills */}
      {skills.map((skill) => (
        <div key={`admin-${skill.id}`} className={styles.cardActions}>
          <button
            className={`${styles.actionButton} ${styles.editButton}`}
            onClick={() => handleEdit(skill)}
            title="Edit Skill"
          >
            <i className="fa fa-edit"></i>
          </button>
          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => handleDelete(skill)}
            title="Delete Skill"
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
      ))}

      {/* Add new skill card */}
      <div
        className={`${styles.skillCard} ${styles.addCard}`}
        onClick={() => {
          setSelectedSkill(null);
          setModalShow(true);
        }}
      >
        <div className={styles.addContent}>
          <i className="fa fa-plus"></i>
          <p>Add New Skill</p>
        </div>
      </div>

      {/* Modal for adding/editing skills */}
      <ModalView
        name="Skills"
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setSelectedSkill(null);
        }}
        initialData={selectedSkill}
        title={selectedSkill ? "Edit Skill" : "Add Skill"}
      />
    </>
  );
}

export default SkillsClient;
