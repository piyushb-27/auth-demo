import { createUploadthing, type FileRouter } from "uploadthing/next";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "./mongodb";
import File from "@/models/File";

const f = createUploadthing();

// Auth function to get user from JWT
const auth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    throw new Error("Invalid token");
  }
};

export const ourFileRouter = {
  // Image uploader - max 4MB
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const user = await auth();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await connectDB();
      
      const newFile = await File.create({
        userId: metadata.userId,
        name: file.name,
        url: file.ufsUrl,
        key: file.key,
        type: file.type,
        size: file.size,
        folder: "General",
      });

      return { fileId: newFile._id.toString(), url: file.ufsUrl };
    }),

  // Document uploader - max 8MB
  documentUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
    text: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await auth();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await connectDB();
      
      const newFile = await File.create({
        userId: metadata.userId,
        name: file.name,
        url: file.ufsUrl,
        key: file.key,
        type: file.type,
        size: file.size,
        folder: "General",
      });

      return { fileId: newFile._id.toString(), url: file.ufsUrl };
    }),

  // General file uploader - images and documents
  fileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
    text: { maxFileSize: "4MB", maxFileCount: 5 },
    blob: { maxFileSize: "8MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await auth();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await connectDB();
      
      const newFile = await File.create({
        userId: metadata.userId,
        name: file.name,
        url: file.ufsUrl,
        key: file.key,
        type: file.type,
        size: file.size,
        folder: "General",
      });

      return { fileId: newFile._id.toString(), url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
