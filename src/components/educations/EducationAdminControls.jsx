"use client";

import { AdminCardOverlay, AdminAddCard, useSectionAdmin } from "@/components/admin/contextual/PortfolioContextualControls";

export function EducationCardAdmin({ education }) {
  const { openEdit, ModalComponent } = useSectionAdmin("Educations");

  return (
    <>
      <AdminCardOverlay
        collectionName="Educations"
        item={education}
        onEdit={openEdit}
      />
      {ModalComponent}
    </>
  );
}

export function EducationAddButton() {
  const { openAdd, ModalComponent } = useSectionAdmin("Educations");

  return (
    <>
      <AdminAddCard
        collectionName="Educations"
        label="Education"
        onAdd={openAdd}
        isTimeline={true}
      />
      {ModalComponent}
    </>
  );
}
