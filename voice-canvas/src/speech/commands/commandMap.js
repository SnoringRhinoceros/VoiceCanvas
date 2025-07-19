// src/speech/commands/keywords.js

export const commandList = [
  'color_red',
  'color_green',
  'color_blue',
  'color_white',
  'color_rainbow',
  'draw_circle',
  'increase_brush',
  'decrease_brush',
  'set_brush_size',
];

export const VoiceCommands = Object.fromEntries(
  commandList.map(cmd => [cmd, cmd])
);
