// utils/whisperTranscribe.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

export async function transcribeWithWhisper(filePath) {
  const formData = new FormData();
  const stream = fs.createReadStream(filePath);

  formData.append('file', stream, path.basename(filePath));
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Whisper API failed: ${err}`);
  }

  const data = await response.json();
  return data.text;
}
