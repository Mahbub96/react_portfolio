import React from "react";
import Image from "next/image";

// Image optimization component for better SEO
const ImageOptimizer = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  title = "",
  caption = "",
  geoLocation = "Dhaka, Bangladesh",
  license = "",
  credit = "Mahbub Alam",
  itemProp = "",
  itemScope = false,
  itemType = "",
  ...props
}) => {
  // Enhanced alt text for better accessibility and SEO
  const enhancedAlt =
    alt || `${title || "Image"} - ${caption || "Portfolio content"}`;

  // Enhanced title for better SEO
  const enhancedTitle = title || alt || "Portfolio Image";

  // Enhanced caption for better context
  const enhancedCaption = caption || alt || "Portfolio content by Mahbub Alam";

  return (
    <div
      className={`image-optimizer ${className}`}
      itemScope={itemScope}
      itemType={itemType}
      {...(itemScope && { itemProp })}
    >
      {/* Optimized Next.js Image */}
      <Image
        src={src}
        alt={enhancedAlt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="optimized-image"
        title={enhancedTitle}
        {...props}
      />

      {/* SEO-friendly caption and metadata */}
      {(caption || credit || geoLocation || license) && (
        <div className="image-metadata" aria-hidden="true">
          {caption && <p className="image-caption">{enhancedCaption}</p>}
          <div className="image-details">
            {credit && <span className="image-credit">Credit: {credit}</span>}
            {geoLocation && (
              <span className="image-location">Location: {geoLocation}</span>
            )}
            {license && (
              <span className="image-license">License: {license}</span>
            )}
          </div>
        </div>
      )}

      {/* Structured data for image SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageObject",
            "@id": `${src}#image`,
            name: enhancedTitle,
            description: enhancedCaption,
            url: src,
            contentUrl: src,
            width: width,
            height: height,
            caption: enhancedCaption,
            encodingFormat: src.split(".").pop() || "image/png",
            representativeOfPage: true,
            inLanguage: "en",
            license: license || "https://mahbub.dev/licenses/default",
            acquireLicensePage: license
              ? license
              : "https://mahbub.dev/contact",
            creditText: credit,
            creator: {
              "@type": "Person",
              name: credit,
              url: "https://mahbub.dev",
            },
            publisher: {
              "@type": "Person",
              name: credit,
              url: "https://mahbub.dev",
            },
            ...(geoLocation && {
              contentLocation: {
                "@type": "Place",
                name: geoLocation,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: geoLocation.split(",")[0]?.trim(),
                  addressCountry: geoLocation.split(",")[1]?.trim(),
                },
              },
            }),
          }),
        }}
      />
    </div>
  );
};

export default ImageOptimizer;
