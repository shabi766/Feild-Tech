import express from "express";
import { globalSearch } from "../Controllers/search.controller.js";

const router = express.Router();

// Public (but requires token check inside controller usually, or middleware here)
// Adding middleware check here would be better if we have shared middleware lib
// For now, controller checks token presence.

router.get("/", globalSearch);

export default router;
