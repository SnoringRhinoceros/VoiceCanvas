// pages/api/transcribe.js
import formidable from 'formidable';
import { transcribeWithWhisper } from '../../utils/whisperTranscribe';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.audio) {
      return res.status(400).json({ error: 'Missing audio' });
    }

    try {
      const text = await transcribeWithWhisper(files.audio[0].filepath);
      res.status(200).json({ text });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}
