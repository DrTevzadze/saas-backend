import multer from "multer";
import path from "path";

// Where to store the files
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

// Filter file extensions
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedFileTypes = [".csv", ".xls", ".xlsx"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedFileTypes.includes(extension)) {
    return cb(new Error("Only CSV, XLS and XLSX files are allowed."), false);
  }
  cb(null, true);
};

// Setup multer upload object
const upload = multer({
  storage,
  fileFilter,
});

export default upload;
