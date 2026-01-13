import express from "express";
import { 
    registerCompany, 
    companyLogin 
} from "../controllers/companyRegistration.controller.js";

const router = express.Router();

// Company registration (no authentication required)
router.post("/register", registerCompany);

// Company login (no authentication required)
router.post("/login", companyLogin);

export default router;

