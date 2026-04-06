# myenergi Wiring Diagram

## Setup

Requires Node.js (v18+). If you don't have it: https://nodejs.org

```bash
# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Then open http://localhost:5173 in your browser.
Hot reload is on — save the file and the diagram updates instantly.

## Files

```
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx       ← React entry point (don't touch)
    └── App.jsx        ← All the diagram code lives here
```

## Working with Claude Code

Open this folder in your terminal and run `claude` to start a session.
All diagram edits go in `src/App.jsx`.

Useful prompts to get started:
- "Edit src/App.jsx to add a new config for [scenario]"
- "In src/App.jsx, move the WiFi symbol 8px to the left"
- "Add a tooltip to each device box showing its model number"
