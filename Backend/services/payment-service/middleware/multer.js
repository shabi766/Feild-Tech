import multer from "multer";

const storage = multer.memoryStorage();

// Multiple file uploads for KYC documents
export const multipleUpload = multer({ storage: storage }).fields([
    { name: 'cnicFront', maxCount: 1 },
    { name: 'cnicBack', maxCount: 1 }
]);

// Single file upload
export const singleUpload = multer({ storage: storage }).single("file");
