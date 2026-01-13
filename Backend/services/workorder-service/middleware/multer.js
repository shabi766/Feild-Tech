import multer from "multer";

const storage = multer.memoryStorage();

// Configuration for multiple file uploads
export const multipleUpload = multer({ storage: storage }).any();

// Single file upload
export const singleUpload = multer({ storage: storage }).single("file");
