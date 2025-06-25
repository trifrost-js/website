TriFrost’s `create-trifrost` CLI helps you scaffold new projects in seconds — with a guided, interactive setup process designed to get you building immediately.

Whether you're targeting **Node**, **Bun**, or **Cloudflare Workers**, the CLI handles the boilerplate so you can focus on writing your app — not configuring it.

---

### ▶️ Quick Demo

Watch the CLI in action:
![QuickStart](/r2assets/trifrost-create.mp4)

---

### 📦 Installation & Usage

Use the CLI with your package manager of choice:
```bash
# NPM
npm create trifrost@latest

# BUN
bun create trifrost@latest
```

Follow the prompts to configure your project:
```bash
? Where should we create your project? › my-trifrost-app
? Which runtime are you using? › Bun
? Enable CORS middleware? › yes
? Enable CSS reset? › yes
...
```

Once finished, it generates a complete project with:
- 🧠 Runtime-specific setup
- ✨ Typed context + routing
- ⚙️ Optional middleware (CORS, Security, etc.)
- 📁 Linting, formatting, and build scripts
- ...

---

### 🔧 Requirements

**Node**: Node.js 20+
**Bun**: [Bun](https://bun.sh/) installed
**Cloudflare**: Node.js 20+
**Containerized**: [Podman](https://podman.io) + Podman Compose installed

---

### 🤝 Contribute
Want to add new templates, features, or runtime support?

Check out [create-trifrost on GitHub](https://github.com/trifrost-js/create-trifrost) and open a PR or issue.

---

### Resources
- [Why TriFrost Exists](/news/blog/why_trifrost_exists)
- [TriFrost Core](https://github.com/trifrost-js/core)
- [TriFrost Creation CLI](https://github.com/trifrost-js/create-trifrost)
