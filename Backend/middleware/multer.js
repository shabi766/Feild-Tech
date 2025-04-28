// Utils/multer.js
import multer from "multer";

const storage = multer.memoryStorage();

// Configuration for multiple file uploads (for 'attachments' field)
export const multipleUpload = multer({ storage: storage }).any();// 'attachments' is the field name, 5 is the max count

// You can keep the singleUpload configuration if you use it elsewhere
export const singleUpload = multer({ storage: storage }).single("file");