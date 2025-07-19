# Voice Canvas

**Voice Canvas** is an art program powered entirely by your voice.

It was created to empower individuals with limited fine motor control to create art using only spoken commands. However, Voice Canvas is usable by anyone interested in exploring a new way to make visual art.

## Features

- Voice-controlled interface — no mouse or keyboard needed
- Real-time drawing with voice commands
- Pitch recognition for additional creative input
- Fully voice-navigable UI
- Optional clickable buttons for hybrid control

> A full list of supported voice commands is provided within the app interface.

## Live Demo

Try it now: [https://speech-canvas.vercel.app](https://speech-canvas.vercel.app)

| **Command**      | **What it Does**                   |
| ---------------- | ---------------------------------- |
| `red`            | Changes brush color to red         |
| `blue`           | Changes brush color to blue        |
| `green`          | Changes brush color to green       |
| `white`          | Changes brush color to white       |
| `rainbow`        | Enables a multicolor rainbow brush |
| `increase brush` | Makes the brush size larger        |
| `decrease brush` | Makes the brush size smaller       |
| `set brush size X` | Sets brush size to size X (0-40) |

💡 All commands are case-insensitive and can be spoken naturally. Voice Canvas is designed to recognize these words in context.

Ex:
`Use color red`
Switches the color to red. Even though you don't need to say "use color," saying that gives me context which creates more accurate transcriptions.

## Tech Stack

- **Frontend:** React + Vite
- **Voice Recognition:** OpenAI Whisper API
- **Pitch Detection:** [pitchy](https://www.npmjs.com/package/pitchy)
- **Deployment:** Vercel
- **Local Backend for Testing:** Node.js + Express (to proxy Whisper API calls)

## Local Development

### Prerequisites

- Node.js
- Vite
- OpenAI API Key (you’ll need to set this in an `.env.local` file)

### Installation

```bash
git clone https://github.com/your-username/voice-canvas.git
cd voice-canvas
npm install
```

### How to Run

In one terminal run this to boot up the backend:
```bash
node dev-server.js
```
In another terminal run this to boot up the main app:
```bash
npm dev run
