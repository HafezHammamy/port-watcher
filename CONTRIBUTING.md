# Contributing to Port Watcher

Thanks for your interest in contributing! 🎉 This project is open to everyone, and contributions of all sizes are welcome.

## Ways to contribute

- 🐛 **Report bugs** — open an [issue](https://github.com/HafezHammamy/port-watcher/issues) with steps to reproduce.
- 💡 **Suggest features** — open an issue describing the idea and why it'd be useful.
- 🔧 **Send a pull request** — fix a bug, add a feature, or improve the docs.

## Development setup

```bash
git clone https://github.com/HafezHammamy/port-watcher.git
cd port-watcher
npm install
npm start
```

## Pull request workflow

1. **Fork** the repo and create your branch from `main`:
   ```bash
   git checkout -b feature/my-improvement
   ```
2. Make your changes. Keep them focused — one logical change per PR.
3. Test that the app still launches and works (`npm start`).
4. Commit with a clear message and push to your fork.
5. Open a **pull request** against `main` and describe what you changed and why.

## Code style

- Match the existing style in the file you're editing.
- Keep the UI dependency-light — the app intentionally uses vanilla JS, HTML, and CSS (no frontend framework).
- Security matters: keep `contextIsolation` on and never enable `nodeIntegration` in the renderer.

## Ideas / good first issues

- Kill a port by typing its number directly (without selecting a row)
- System-tray icon to keep the app running in the background
- Cross-platform support (macOS via `lsof`, Linux via `ss`/`netstat`)
- Group / collapse rows by process
- Export the current list to CSV

## Code of conduct

Be respectful and constructive. We want this to be a welcoming project for contributors of all experience levels.
