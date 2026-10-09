/**
 * Renders one JSON-LD graph.
 *
 * `<` is escaped so a string field containing "</script>" can never break out
 * of the tag (JSON.stringify alone does not protect against that).
 */
export default function JsonLd({ data }) {
  if (!data) return null;
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
