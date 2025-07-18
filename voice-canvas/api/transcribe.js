// pages/api/transcribe.js
import formidable from 'formidable';
import fs from 'fs';
import { FormData, File } from 'undici';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's default body parser
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.audio) {
      console.error('❌ Form error:', err);
      return res.status(400).json({ error: 'Audio file is required' });
    }

    try {
      const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;

      const buffer = fs.readFileSync(file.filepath);
      const blob = new File([buffer], file.originalFilename || 'audio.webm', {
        type: file.mimetype || 'audio/webm',
      });

      const formData = new FormData();
      formData.append('file', blob);
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Whisper API error:', result);
        return res.status(500).json({ error: 'Whisper API failed', details: result });
      }

      res.status(200).json({ text: result.text });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });
}
