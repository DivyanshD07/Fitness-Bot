import express from "express";
import multer from "multer"
import { voiceUpload } from "../controllers/upload.controller";

const router = express.Router()

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("audio"), voiceUpload);

router.get("/audio/:filename", (req,res) => {
    const filepath = path.join(__dirname, "../uploads", req.params.filename);
    res.sendFile(filepath);
});


export default router;