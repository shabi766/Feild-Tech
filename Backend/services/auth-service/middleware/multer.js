import multer from "multer";

const storage = multer.memoryStorage();

// Single file upload for profile photo
export const singleUpload = multer({ storage: storage }).single("profilePhoto");

// Multiple file uploads for profile updates
export const multipleUpload = multer({ storage: storage }).fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "cnicImages", maxCount: 10 },
    { name: "certificationImages", maxCount: 10 },
]);
