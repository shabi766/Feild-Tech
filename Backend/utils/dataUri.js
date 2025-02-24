import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
    const parser = new DataUriParser();
    // Get the file extension with a dot (e.g., '.png')
    const extName = path.extname(file.originalname).toString();
    // Return the formatted Data URI
    return parser.format(extName, file.buffer);
};

export default getDataUri;
