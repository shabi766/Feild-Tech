import express from "express";

import { getAdminJobs, getAllJobs, getJobById, postJob, getUserJobs, updateJob, updateJobStatus, getJobsByProject, getTechnicianJobs} from "../Controllers/workorder.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/update/:id").put(isAuthenticated, updateJob);

// New route to update job status
router.route("/status/:id").put(isAuthenticated, updateJobStatus);

router.route("/get-by-project/:projectId").get(isAuthenticated, getJobsByProject);
router.route("/technician-jobs").get(isAuthenticated, getTechnicianJobs);






export default router;
