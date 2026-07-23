import { Router } from "express";
import { ContactController } from "../controllers/contact.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();
const contactController = new ContactController();
router.post(
  "/",
  authMiddleware,
  contactController.create
);


router.post(
  "/import",
  authMiddleware,
  upload.single("file"),
  contactController.importContacts
);


router.get(
  "/",
  authMiddleware,
  contactController.getAll
);


router.get(
  "/:id",
  authMiddleware,
  contactController.getById
);


router.put(
  "/:id",
  authMiddleware,
  contactController.update
);


router.delete(
  "/:id",
  authMiddleware,
  contactController.delete
);


export default router;