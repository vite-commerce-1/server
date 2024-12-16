import express from "express";

import {
  deleteUser,
  getAllUser,
  updateUser,
} from "../controllers/user-controller.js";
import {
  adminMiddleware,
  protectedMiddleware,
} from "../middlewares/auth-middleware.js";

import { upload } from "../utils/upload-file-handler.js";

const router = express.Router();

router.get("/", protectedMiddleware, adminMiddleware, getAllUser);

router.put("/update", protectedMiddleware, upload.single("image"), updateUser);

router.delete("/delete", protectedMiddleware, deleteUser);

export default router;
