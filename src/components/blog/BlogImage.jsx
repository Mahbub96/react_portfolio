/**
 * Responsive <img> for an uploaded blog image ({ src, variants, width,
 * height, alt }). Uploads are pre-sized WebP, so no runtime optimizer.
 */
export default function BlogImage({ image, sizes, eager = false, className, alt }) {
  if (!image?.src) return null;
  const variants = [...(image.variants || [])].sort((a, b) => a.width - b.width);
  const srcSet = variants.length > 1 ? variants.map((v) => `${v.src} ${v.width}w`).join(", ") : undefined;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={image.src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={image.width || undefined}
      height={image.height || undefined}
      alt={alt ?? image.alt ?? ""}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
    />
  );
}
