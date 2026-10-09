import EditorScreen from "@/components/admin/editor/EditorScreen";

export const metadata = { title: "Editor" };

export default function EditPostPage({ params }) {
  return <EditorScreen id={params.id} />;
}
