import multer from "multer";

const storage = multer.diskStorage({});
const limits = { fileSize: 10 * 1024 * 1024 };

// IMAGE FILTER
const imageFilter = (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files allowed"), false);
};

// PDF FILTER
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"), false);
};

export const uploadImage = multer({ storage, limits, fileFilter: imageFilter });
export const uploadPDF = multer({ storage, limits, fileFilter: pdfFilter });
