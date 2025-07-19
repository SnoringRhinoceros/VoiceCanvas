import { VoiceCommands } from './commandMap';

const triggerWords = {
  color_red: 'red',
  color_blue: 'blue',
  color_green: 'green',
    color_white: 'white',
  color_rainbow: 'rainbow',
    increase_brush: 'increase brush size',
  decrease_brush: 'decrease brush size',
};

export function matchCommand(text) {
  text = text.toLowerCase();
  for (const [command, phrase] of Object.entries(triggerWords)) {
    if (text.includes(phrase)) return VoiceCommands[command];
  }
  return null;
}
