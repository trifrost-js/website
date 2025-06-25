One of **TriFrost’s** most defining features is its **runtime-agnostic architecture**.

Rather than binding itself to a single backend, TriFrost adapts seamlessly across multiple JavaScript runtimes — allowing your **application code** to remain consistent and portable.
This means you can choose the **right execution environment** for your needs, whether that’s server-side, edge, or high-performance systems.

Below, we outline the **officially supported runtimes**, with links to both TriFrost’s runtime-specific guides and the official runtime documentation.

---

### Runtime: Node.js
[Node.js](https://nodejs.org/) is the world’s most widely used JavaScript backend runtime, known for its **rich ecosystem** and **stability**.

TriFrost integrates smoothly with Node.js, making it an ideal choice for:
- Existing applications and services already built on the **Node stack**
- Seamless use of **npm packages** and Node APIs
- Traditional **server environments** or cloud VMs

👉 See the TriFrost-specific guide: [Node.js Runtime](/nodejs-runtime)

---

### Runtime: Bun
[Bun](https://bun.sh/) is an **all-in-one JavaScript runtime, bundler, and package manager**, offering built-in TypeScript support and outstanding speed.

TriFrost’s Bun adapter gives you:
- **Native-speed execution** using Bun’s fast JavaScript engine
- Tight integration with Bun’s **APIs and tooling**
- Extremely fast **cold starts** and runtime responsiveness

This makes Bun a **compelling choice** for modern apps looking to push performance boundaries.

👉 See the TriFrost-specific guide: [Bun Runtime](/bun-runtime)

---

### Runtime: Workerd
[Cloudflare Workers](https://workers.cloudflare.com/) (powered by [Workerd](https://github.com/cloudflare/workerd)) provide a **lightweight, edge-deployed** environment for JavaScript applications.

TriFrost supports Workers natively, enabling:
- **Global, low-latency deployments** at Cloudflare’s edge locations
- Execution within **resource-constrained environments**
- Seamless integration with Cloudflare’s **storage, KV, and routing systems**

For apps aiming to run **close to users** with minimal latency, Workers + TriFrost offer a **powerful combination**.

👉 See the TriFrost-specific guide: [Cloudflare Workers (Workerd)](/cloudflare-workers-workerd)

---

### Looking Ahead
TriFrost’s modular runtime system is designed to support **future environments** as they emerge.

Interested in contributing an adapter for Deno, edge WASM runtimes, or anything else on the horizon?

We welcome community contributions.

👉 Learn more about contributing [here](https://github.com/trifrost-js/core)
