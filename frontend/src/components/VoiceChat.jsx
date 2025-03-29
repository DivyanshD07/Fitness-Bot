import React, { useRef, useState } from 'react'
import axios from 'axios'
import RecordRTC from 'recordrtc'

const VoiceChat = () => {

    const [isRecording, setIsRecording] = useState(false);
    const [botResponse, setBotResponse] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const recorderRef = useRef(null);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new RecordRTC(stream, { type: "audio" });
        recorder.startRecording();
        recorderRef.current = recorder;
        setIsRecording(true);
    };

    const stopRecording = async () => {
        setIsRecording(false);
        recorderRef.current.stopRecording(async () => {
            const blob = recorderRef.current.getBlob();
            const formData = new FormData();
            formData.append("audio", blob, "voice.wav");

            try {
                const res = await axios.post(
                    "http://localhost:5002/api/voice/upload",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                setBotResponse(res.data.botResponse);
                setAudioUrl(res.data.audioUrl);
            } catch (error) {
                console.error("Error uploading voice:", error);
            }
        });
    };

    return (
        <div>
            <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
            >
                {isRecording ? "Recording..." : "Hold to Speak"}
            </button>

            {botResponse && (
                <div>
                    <p><strong>Bot:</strong>{botResponse}</p>
                    <audio controls src={audioUrl} autoPlay></audio>
                </div>
            )
            }
        </div>
    )
}

export default VoiceChat