import { Router } from "express";
import { ContactController } from "../controllers/contact.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createContactSchema, updateContactSchema } from "../validators/contact.validator.js";

const router = Router();
const contactController = new ContactController();

router.post(
  "/",
  authMiddleware,
  validateBody(createContactSchema),
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
  validateBody(updateContactSchema),
  contactController.update
);

router.delete(
  "/:id",
  authMiddleware,
  contactController.delete
);

export default router;