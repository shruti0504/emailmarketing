import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const isCsvMime =
      file.mimetype === "text/csv" ||
      file.mimetype === "text/plain" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "application/csv" ||
      file.mimetype === "text/comma-separated-values";

    const isCsvExt = file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsvMime && !isCsvExt) {
      return cb(new Error("Only CSV files allowed"));
    }

    cb(null, true);
  },
});