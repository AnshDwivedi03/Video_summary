// backend/assemblyaiStreaming.js
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const AAI_STREAM_URL = "wss://streaming.assemblyai.com/v3/ws";

function startStreamingTranscription(audioBuffer, onChunk, onDone, onError) {
  // audioBuffer: Buffer containing your MP3/PCM data
  const ws = new WebSocket(`${AAI_STREAM_URL}?sample_rate=16000`, {
    headers: { Authorization: process.env.ASSEMBLYAI_API_KEY },
  });

  ws.on("open", () => {
    console.log("AAI streaming connected");

    // send audio in small chunks
    const chunkSize = 3200; // tune as needed
    let offset = 0;

    const sendChunk = () => {
      if (offset >= audioBuffer.length) {
        ws.send(JSON.stringify({ terminate_session: true }));
        return;
      }
      const end = Math.min(offset + chunkSize, audioBuffer.length);
      const slice = audioBuffer.slice(offset, end);
      ws.send(slice);
      offset = end;
      setTimeout(sendChunk, 50); // throttle a bit
    };

    sendChunk();
  });

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      // 'text' + final flag per turn
      if (data.text) {
        onChunk({
          id: uuidv4(),
          text: data.text,
          finalized: !!data.message_type && data.message_type === "FinalTranscript",
        });
      }
      if (data.terminate_session) {
        onDone();
        ws.close();
      }
    } catch (e) {
      console.error("AAI stream parse error", e);
    }
  });

  ws.on("error", (err) => {
    console.error("AAI stream error", err);
    if (onError) onError(err);
  });

  ws.on("close", () => {
    console.log("AAI streaming closed");
  });

  return ws;
}

module.exports = { startStreamingTranscription };
