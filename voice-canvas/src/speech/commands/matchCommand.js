import { VoiceCommands } from './commandMap';

export function matchCommand(transcript) {
    const text = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
    console.log(text)

  for (const [key, phrase] of Object.entries(VoiceCommands)) {
    if (text.includes(phrase)) {
      return key;
    }
  }

  return null;
}
