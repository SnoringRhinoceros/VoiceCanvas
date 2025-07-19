import { VoiceCommands } from './commandMap';

const triggerWords = {
  color_red: 'red',
  color_blue: 'blue',
  color_green: 'green',
    color_white: 'white',
  color_rainbow: 'rainbow',
    increase_brush: 'increase brush',
  decrease_brush: 'decrease brush',
};

export function matchCommand(text) {
    text = text.toLowerCase();
    
  for (const [command, phrase] of Object.entries(triggerWords)) {
    if (text.includes(phrase)) return VoiceCommands[command];
    }
    
const match = text.match(/brush size (?:to|is)?\s*(\d{1,2})/);
  if (match) {
    const size = parseInt(match[1], 10);
    if (size >= 1 && size <= 40) {
      return { command: VoiceCommands.set_brush_size, value: size };
    }
  }
  return null;
}
