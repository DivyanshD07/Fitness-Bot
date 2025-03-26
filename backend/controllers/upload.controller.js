import axios from "axios";
import { response } from "express";
import fs from "fs";


export const voiceUpload = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log("Received voice file:", req.file.originalname);
    try {
        //convert buffer to a temporary file
        const tempFilePath = `./uploads/${Date.now()}-${req.file.originalname}`;
        fs.writeFileSync(tempFilePath, req.file.buffer);

        // Speech to text
        const res = await axios.post(
            "https://router.huggingface.co/hf-inference/models/facebook/wav2vec2-large-960h",
            fs.createReadStream(tempFilePath),
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "audio/wav",
                },
            }
        );
        fs.unlinkSync(tempFilePath);

        const transcribedText = res.data.text || "Could not process audio";
        console.log("Transcribed text:", transcribedText);

        // Here, just repeating the text
        const botResponse = `You asked: ${transcribedText}. Stay fit and healthy!`;

        // Text to Speech
        const ttsResponse = await axios.post(
            "https://router.huggingface.co/hf-inference/models/facebook/mms-tts-eng",
            { 
                inputs: botResponse
            },
            {
                header: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type" : "application/json",
                },
                responseType: "arrayBuffer",
            },
        );

        // Save the audio response
        const audioFilePath = `./uploads/${Date.now()}-response.wav`;
        fs.writeFileSync(audioFilePath, ttsResponse.data);

        res.json({
            message: "File processed",
            text: transcribedText,
            botResponse,
            audioUrl: `http://localhost:5000/api/voice/audio/${audioFilePath.split("/").pop()}`,
        })

        req.json({ message: "File processed", text: transcribedText });
    } catch (error) {
        console.error("Error processing voice file:", error);
        res.status(500).json({ error: "Error processing audio" });
    }
};