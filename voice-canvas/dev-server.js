// dev-server.js
import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import { FormData, File } from 'undici';
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); 


const app = express();
app.use(express.json());

app.post('/api/transcribe', (req, res) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.audio) {
      console.error('❌ Form error:', err);
      return res.status(400).json({ error: 'Audio file is required' });
    }

    try {
      const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;

      // ✅ Convert to undici-compatible File
      const buffer = fs.readFileSync(file.filepath); // read entire file into buffer
      const fileBlob = new File([buffer], file.originalFilename || 'audio.webm', {
        type: file.mimetype || 'audio/webm',
      });

      const formData = new FormData();
      formData.append('file', fileBlob);
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Whisper API error:', data);
        return res.status(500).json({ error: 'Whisper failed', details: data });
      }

      return res.json({ text: data.text });
    } catch (e) {
      console.error('Transcription error:', e);
      res.status(500).json({ error: 'Server error', details: e.message });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Dev server running at http://localhost:${PORT}`));

