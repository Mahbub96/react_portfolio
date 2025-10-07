import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";

export async function POST(request) {
  try {
    // Check if domain is mahbub.dev for admin operations
    const hostname = request.headers.get("host");
    const isAdminDomain =
      hostname === "mahbub.dev" || hostname === "localhost:3000";

    if (!isAdminDomain) {
      return NextResponse.json(
        { error: "Image uploads are only allowed on mahbub.dev domain." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");
    const collectionName = formData.get("collectionName") || "profile";
    const documentId = formData.get("documentId") || "profile";

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 2MB." },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString(
      "base64"
    )}`;

         // Get image dimensions (fallback method since sharp might not be available)
     let imageDimensions = { width: 0, height: 0 };
     
     // For now, we'll set default dimensions and let the client-side handle actual dimensions
     // This avoids server-side image processing issues
     imageDimensions = {
       width: 800, // Default width
       height: 600, // Default height
     };

    await connectDB();

    // Prepare comprehensive SEO metadata
    const seoMetadata = {
      image: base64String,
      imageMetadata: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        dimensions: imageDimensions,
        uploadDate: new Date().toISOString(),
        altText: "Mahbub Alam - Full Stack Developer Professional Headshot",
        title: "Mahbub Alam Professional Headshot",
        description:
          "Professional headshot of Mahbub Alam, Full Stack Developer and Software Engineer based in Dhaka, Bangladesh",
        keywords: [
          "Mahbub Alam",
          "Full Stack Developer",
          "Professional Headshot",
          "Portfolio",
          "Bangladesh Developer",
        ],
        copyright: "Mahbub Alam",
        license: "All Rights Reserved",
        usage: "Portfolio and Professional Use",
        location: "Dhaka, Bangladesh",
        profession: "Full Stack Developer",
        company: "Brotecs Technologies Ltd",
        education: "Stamford University Bangladesh",
        skills: [
          "React",
          "Node.js",
          "PHP",
          "Laravel",
          "AWS",
          "Docker",
          "MongoDB",
          "MySQL",
        ],
        languages: ["English", "Bengali"],
        experience: "5+ years",
        certifications: ["Computer Science Degree"],
        socialLinks: {
          github: "https://github.com/mahbub96",
          linkedin: "https://linkedin.com/in/md-mahbub-alam-6b751821b",
          facebook: "https://fb.me/MahbubCSE96",
        },
      },
    };

    // Update the profile image in the database
    let result;
    if (collectionName === "profile" && documentId === "profile") {
      // Update profile collection with comprehensive metadata
      result = await PortfolioData.findOneAndUpdate(
        { collectionName: "profile" },
        {
          $set: {
            "data.image": base64String,
            "data.imageMetadata": seoMetadata.imageMetadata,
            lastUpdate: new Date(),
          },
        },
        { new: true, upsert: true }
      );
    } else {
      // Update other collections
      result = await PortfolioData.findOneAndUpdate(
        {
          collectionName,
          "data.id": documentId,
        },
        {
          $set: {
            "data.$.image": base64String,
            "data.$.imageMetadata": seoMetadata.imageMetadata,
            "data.$.updatedAt": new Date(),
          },
          lastUpdate: new Date(),
        },
        { new: true }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update image" },
        { status: 500 }
      );
    }

    // Clear cache by setting no-cache headers
    const response = NextResponse.json({
      success: true,
      image: base64String,
      imageMetadata: seoMetadata.imageMetadata,
      message: "Image uploaded successfully with comprehensive SEO metadata",
    });
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
