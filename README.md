# 🌌 Antigravity Network Demo

A futuristic, highly interactive HTML5 Canvas node network built with **React 19**, **Vite**, and **Tailwind CSS v4**.

![Antigravity Demo Context](https://img.shields.io/badge/Status-Active-success) ![Framework](https://img.shields.io/badge/React-19-blue) ![Styling](https://img.shields.io/badge/CSS-Tailwind_v4-06B6D4)

This project renders a dynamic network graph of "particles" or "nodes" that randomly float, connect to each other based on distance, and dynamically interact with user cursor movements.

## ✨ Features

- **Dynamic Interactive Canvas**: Custom canvas particle physics reacting to distance constraints.
- **Glassmorphism UI**: Real-time settings injection panel (built via Tailwind) to configure the node density, connection radius, and repel forces without stuttering or re-rendering the animation loop.
- **Physics Interactions**:
  - **Repel / Attract Forces**: Hovering pushes the network away.
  - **Supergravity Pull**: Clicking and holding creates a "Black Hole" effect, magnetically drawing the nodes to the cursor and turning them red.
  - **Force Burst**: Clicking fires an outward kinetic shockwave that aggressively repels the particles backwards.
- **Color matrix**: Toggle visually striking neon themes (**Cyberpunk**, **Matrix**, **Fire**).
- **Data Nodes**: Special high-density highlighted nodes representing core system components (`Auth API`, `User DB`, `Core AI`).

## 🚀 Getting Started

### Prerequisites

You will need **Node.js 18+** to run this local application.

### Installation

1. Clone this repository:
```sh
git clone https://github.com/FatihG60/antigravity-network-demo.git
cd antigravity-network-demo
```

2. Install the necessary dependencies (including Tailwind v4 Vite plugin):
```sh
npm install
```

3. Spin up the development server:
```sh
npm run dev
```

4. Go to `http://localhost:5173/` and interact with the magic!

## 🛠️ Built With

* **React 19**
* **Vite**
* **Tailwind CSS v4** (Via `@tailwindcss/vite` plugin)
* **TypeScript**
* Vanilla HTML5 `CanvasRenderingContext2D`

---

*Designed and engineered iteratively with Antigravity AI.*
