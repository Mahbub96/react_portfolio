"use client";

import { AdminAddCard, useSectionAdmin } from "@/components/admin/contextual/PortfolioContextualControls";

export default function ProjectsAddCard() {
  const { openAdd, ModalComponent } = useSectionAdmin("Projects");

  return (
    <>
      <AdminAddCard
        collectionName="Projects"
        label="Project"
        onAdd={openAdd}
      />
      {ModalComponent}
    </>
  );
}
