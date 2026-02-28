import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_, file, cb) => {
    if (!file.originalname.endsWith(".csv")) {
      cb(new Error("Only CSV allowed"));
    }
    cb(null, true);
  }
});
