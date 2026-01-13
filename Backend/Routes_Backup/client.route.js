import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getClient, getClientById, registerClient, updateClient } from "../Controllers/client.controller.js";
import { singleUpload } from "../middleware/multer.js";


const router = express.Router();

router.route("/register").post(singleUpload, isAuthenticated,registerClient);
router.route("/get").get(isAuthenticated,getClient);
router.route("/get/:id").get(isAuthenticated,getClientById);
router.route("/update/:id").put(isAuthenticated, singleUpload, updateClient);

export default router;