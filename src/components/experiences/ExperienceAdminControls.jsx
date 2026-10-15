"use client";

import { AdminCardOverlay, AdminAddCard, useSectionAdmin } from "@/components/admin/contextual/PortfolioContextualControls";

export function ExperienceCardAdmin({ experience }) {
  const { openEdit, ModalComponent } = useSectionAdmin("Experiences");

  return (
    <>
      <AdminCardOverlay
        collectionName="Experiences"
        item={experience}
        onEdit={openEdit}
      />
      {ModalComponent}
    </>
  );
}

export function ExperienceAddButton() {
  const { openAdd, ModalComponent } = useSectionAdmin("Experiences");

  return (
    <>
      <AdminAddCard
        collectionName="Experiences"
        label="Experience"
        onAdd={openAdd}
        isTimeline={true}
      />
      {ModalComponent}
    </>
  );
}
