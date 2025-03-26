import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import voiceRoutes from "./routes/upload.routes.js"


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.send("API is working fine...")
});

app.use("/api/voice", voiceRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));