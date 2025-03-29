import axios from "axios";
import fs from "fs";
import { execSync } from "child_process";

export const voiceUpload = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log("Received voice file:", req.file.originalname);
    try {
        // Convert buffer to a temporary file
        const tempFilePath = `./uploads/${Date.now()}-${req.file.originalname}`;
        fs.writeFileSync(tempFilePath, req.file.buffer);

        // Read file as a buffer
        const audioBuffer = fs.readFileSync(tempFilePath);

        // Speech-to-Text Request
        const sttResponse = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h",
            audioBuffer,
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "audio/wav",
                    Accept: "application/json",
                },
            }
        );

        fs.unlinkSync(tempFilePath);

        const transcribedText = sttResponse.data.text || "Could not process audio";
        console.log("Transcribed text:", transcribedText);

        // Generate Bot Response
        const botResponse = `You asked: ${transcribedText}. Stay fit and healthy!`;

        // Text-to-Speech Request
        const ttsResponse = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/mms-tts-eng",
            { inputs: botResponse },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                responseType: "arrayBuffer",
            }
        );

        console.log("TTS API Response Data:", ttsResponse.data.slice(0, 20)); // Log first 20 bytes        || "No Data");

        // Save as .flac since API returns FLAC
        const flacFilePath = `./uploads/${Date.now()}-response.flac`;
        fs.writeFileSync(flacFilePath, Buffer.from(ttsResponse.data));

        // Convert FLAC to WAV using ffmpeg
        const wavFilePath = flacFilePath.replace(".flac", ".wav");
        execSync(`ffmpeg -i ${flacFilePath} -acodec pcm_s16le -ar 44100 ${wavFilePath}`);

        fs.unlinkSync(flacFilePath); // Remove FLAC file after conversion
        console.log("Audio response saved at:", wavFilePath);

        res.json({
            message: "File processed",
            text: transcribedText,
            botResponse,
            audioUrl: `http://localhost:5000/api/voice/audio/${audioFilePath.split("/").pop()}`,
        });

    } catch (error) {
        console.error("Error processing voice file:", error.response?.data || error.message);
        res.status(500).json({ error: "Error processing audio" });
    }
};
