# Bolly Shampoo Landing Page - Interactive 3D Showcase

This project is a high-fidelity recreation of the **Bolly** shampoo landing page. It implements a modern, responsive layout alongside an interactive 3D WebGL product experience in the center of the viewport, which users can rotate with mouse drag (desktop) and touch gestures (mobile).

Developed using **pure HTML5, CSS3, JavaScript (ES6), Three.js, and GSAP**.

---

## Key Features

1. **Procedural 3D Model**:
   - The shampoo bottle body is constructed programmatically using Three.js `LatheGeometry` to match the exact profile of a Boston round apothecary flask.
   - The white pump dispenser cap, stem, and spout are constructed using nested geometries.
   - This keeps the project extremely lightweight (under 100 KB total), avoiding heavy external 3D file formats (like `.glb`/`.obj`) and eliminating slow loading or broken asset link issues.

2. **Offscreen Canvas Texturing**:
   - The text label on the bottle is generated in real-time on a high-resolution 2D HTML5 canvas (1024x1024) and projected onto the WebGL model using a `CanvasTexture`. This ensures razor-sharp brand typography that scales dynamically without pixelation.
   
3. **Realistic Physical Materials**:
   - The bottle body uses `MeshPhysicalMaterial` with a high clearcoat rating, low roughness, and slight reflectivity to simulate glossy violet-purple plastic.
   - The pump dispenser uses a matte white plastic finish.

4. **Studio Lighting Scheme**:
   - A multi-light rig consisting of an Ambient Light (ambient room glow), a Directional Key Light (producing the bright front-right highlight), a back Directional Rim Light (with a lavender hue to outline the bottle silhouette), and a Spot Light directed at the label details.
   - A soft radial-gradient shadow plane floats behind the bottle, giving it depth and a premium studio render look.

5. **Smooth Interactive Control & Parallax**:
   - **Idle Auto-Rotation**: Slowly rotates the bottle when no interaction is detected.
   - **Inertial Rotation**: Dragging with a mouse or swiping on mobile spins the bottle, decelerating with a smooth damping coefficient for a satisfying physical weight.
   - **Hover Parallax**: Moving the cursor across the screen tilts the bottle slightly in that direction.

6. **Fully Responsive Layout**:
   - Desktop uses a premium 3-column layout.
   - Mobile and tablet screen sizes stack elements vertically, keeping the interactive 3D canvas centered.
   - Fully optimized down to a small screen width of **320px** with no overlapping texts, layout breakage, or horizontal scrolling.

---

## Project Structure

- `index.html` — Main layout, SEO tags, loaded fonts (Outfit/Inter), and Three.js/GSAP CDN links.
- `style.css` — CSS design system, typography styling, custom animations, and responsive queries.
- `app.js` — Three.js WebGL scene, lighting setups, lathe bottle modeling, canvas texturing, and drag/touch control loop.
- `README.md` — Project documentation.

---

## How to Run Locally

You can open the project in one of two ways:

### Option A: Open directly in a browser
1. Double-click the [index.html](file:///c:/Users/DELL/OneDrive/Internships/Toposel/index.html) file to launch it in any modern browser (Chrome, Safari, Firefox, Edge).

### Option B: Serve via a local web server (Recommended)
Running a local web server provides the best performance for loading fonts and canvas textures:
1. Open terminal inside the workspace directory.
2. Start a simple web server using Node.js:
   ```bash
   npx http-server
   ```
3. Open the local address provided in the terminal (usually `http://127.0.0.1:8080`) in your browser.
