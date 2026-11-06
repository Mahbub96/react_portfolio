"use client";

/**
 * Thin client wrappers around the contextual admin controls so the (server)
 * homepage sections can render owner-only edit/add affordances. Both render
 * nothing for visitors; inside a SectionAdminProvider they share its modal.
 */
import {
  AdminAddCard,
  AdminCardOverlay,
  useSectionAdmin,
} from "@/components/admin/contextual/PortfolioContextualControls";

export function ItemAdmin({ collection, item }) {
  const { openEdit, ModalComponent } = useSectionAdmin(collection);
  return (
    <>
      <AdminCardOverlay collectionName={collection} item={item} onEdit={openEdit} />
      {ModalComponent}
    </>
  );
}

export function AddItem({ collection, label, timeline = true }) {
  const { openAdd, ModalComponent } = useSectionAdmin(collection);
  return (
    <>
      <AdminAddCard
        collectionName={collection}
        label={label}
        onAdd={openAdd}
        isTimeline={timeline}
      />
      {ModalComponent}
    </>
  );
}
