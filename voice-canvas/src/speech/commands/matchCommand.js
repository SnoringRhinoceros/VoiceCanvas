import { VoiceCommands } from './commandMap.js';

export function matchCommand(transcript) {
  const text = transcript.toLowerCase();

  for (const [key, phrase] of Object.entries(VoiceCommands)) {
    if (text.includes(phrase)) {
      return key;
    }
  }

  return null;
}
