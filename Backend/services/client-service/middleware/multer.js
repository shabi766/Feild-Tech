import multer from "multer";

const storage = multer.memoryStorage();

// Single file upload for logos
export const singleUpload = multer({ storage: storage }).single("file");

// Multiple file uploads (if needed)
export const multipleUpload = multer({ storage: storage }).any();
