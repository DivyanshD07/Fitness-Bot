import express from "express";
import multer from "multer"
import { voiceUpload } from "../controllers/upload.controller.js";
import path from 'path'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router()

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("audio"), voiceUpload);

router.get("/audio/:filename", (req,res) => {
    const filepath = path.join(__dirname, "../uploads", req.params.filename);
    res.sendFile(filepath);
});


export default router;