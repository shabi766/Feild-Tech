import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getTechnicianById, getTechnicians } from "../Controllers/technician.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated,getTechnicians);
router.route("/:id").get(isAuthenticated,getTechnicianById);

export default router;