import express from "express";

import { getAdminJobs, getAllJobs, getJobById, postJob,  updateJob, updateJobStatus, getJobsByProject, getTechnicianJobs, checkinJob, checkoutJob, doneJob,  ReviewJob, PaidJob,  cancelJob, completeJob, getDraftJobById} from "../Controllers/workorder.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/update/:id").put(isAuthenticated, updateJob);
router.route("/status/:id").put(isAuthenticated, updateJobStatus);
router.route("/get-by-project/:projectId").get(isAuthenticated, getJobsByProject);
router.route("/technician-jobs").get(isAuthenticated, getTechnicianJobs);
router.route("/checkin/:id").put(isAuthenticated, checkinJob);
router.route("/checkout/:id").put(isAuthenticated, checkoutJob);
router.route("/done/:id").put(isAuthenticated, doneJob);
router.route("/complete/:id").put(isAuthenticated, completeJob);
router.route("/review/:id").put(isAuthenticated, ReviewJob);
router.route("/paid/:id").put(isAuthenticated, PaidJob);
router.route("/Cancel/:id").put(isAuthenticated, cancelJob);
router.route("/workorders/draft/:id").get(isAuthenticated, getDraftJobById);
router.route("/calculate-payble/:id").get(isAuthenticated, checkoutJob);



export default router;