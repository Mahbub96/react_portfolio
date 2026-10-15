"use client";

import React from "react";
import { useDataContext } from "@/contexts/useAllContext";
import { AdminAddCard, useSectionAdmin } from "@/components/admin/contextual/PortfolioContextualControls";

function SkillsClient() {
  const { auth } = useDataContext();
  const { openAdd, ModalComponent } = useSectionAdmin("Skills");

  if (!auth) return null;

  return (
    <>
      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
        <AdminAddCard
          collectionName="Skills"
          label="Skill"
          onAdd={openAdd}
          isTimeline={true}
        />
      </div>
      {ModalComponent}
    </>
  );
}

export default SkillsClient;
