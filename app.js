/* ==========================================================================
   BOLTY INTERACTIVE 3D SHAMPOO BOTTLE
   ========================================================================== */

// Global App State
let scene, camera, renderer, bottleGroup, labelTexture;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotationX = 0.1; // Default slight tilt
let targetRotationY = -0.3; // Default angle to show label and profile
let autoRotateSpeed = 0.003;
let lastInteractionTime = 0;
const idleDelay = 3000; // 3 seconds before auto-rotation resumes

const container = document.getElementById('canvas-container');
const loader = document.getElementById('loader');

// Initialize the 3D scene
function init() {
    // 1. Create Scene
    scene = new THREE.Scene();

    // 2. Create Camera
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.z = 8.5;

    // 3. Create WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Remove loading spinner
    if (loader) {
        gsap.to(loader, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => loader.style.display = 'none'
        });
    }

    // 4. Create Studio Lights
    setupLighting();

    // 5. Create 3D Bottle Group
    createShampooBottle();

    // 6. Setup Interaction Listeners
    setupInteractions();

    // 7. Handle Resize
    window.addEventListener('resize', onWindowResize);

    // 8. Trigger Entry Animation using GSAP
    animateEntry();

    // 9. Start Render Loop
    animate();
}

// Setup Lights to give a premium studio product rendering
function setupLighting() {
    // Ambient Light: Soft base light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main Key Light: Bright white light from top-right-front
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Fill Light: Soft blue/purple rim light from left-back to separate object from background
    const rimLight = new THREE.DirectionalLight(0xbfa5ff, 1.0);
    rimLight.position.set(-6, 2, -3);
    scene.add(rimLight);

    // Front/Label Spotlight: Highlight the branding details
    const spotLight = new THREE.SpotLight(0xffffff, 0.6);
    spotLight.position.set(0, 0, 8);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.8;
    scene.add(spotLight);
}

// Generate the high-resolution label texture on an HTML5 canvas
function createLabelTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Vibrant violet-purple background matching the reference design
    ctx.fillStyle = '#765ced';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. PERFORMANCE DRIVEN & HAIRCARE (Left side block)
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('PERFORMANCE DRIVEN', 300, 450);
    ctx.fillText('HAIRCARE', 300, 475);
    
    // Draw thin underline under HAIRCARE
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(300, 495);
    ctx.lineTo(440, 495);
    ctx.stroke();

    // 2. Main Logo "bolly" (Right-shifted, massive lowercase in soft lavender-white)
    ctx.fillStyle = '#e2dbff'; 
    ctx.textAlign = 'center';
    ctx.font = '900 135px "Outfit", sans-serif';
    ctx.letterSpacing = '-4px';
    ctx.fillText('bolly', 580, 480);

    // 3. "Clarify" and "Shampoo" (Solid white)
    ctx.fillStyle = '#ffffff';
    ctx.font = '300 56px "Outfit", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('Clarify', 580, 565);

    ctx.font = '700 56px "Outfit", sans-serif';
    ctx.fillText('Shampoo', 580, 620);

    // 4. Description lines
    ctx.font = '500 18px "Inter", sans-serif';
    ctx.letterSpacing = '0px';
    ctx.fillText('Scalpe Reset + Deep Cleanse', 580, 675);
    
    ctx.font = '400 14px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('For buildup-prone and oily scalps', 580, 700);

    // 5. "300ml" in the lower corner
    ctx.font = '600 20px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'left';
    ctx.fillText('300ml', 300, 800);

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    
    return texture;
}

// Recreate the shampoo bottle procedurally
function createShampooBottle() {
    bottleGroup = new THREE.Group();

    // 1. Create Bottle Body using Lathe Geometry for smooth shape
    const points = [];
    
    // Bottom flat cap points
    points.push(new THREE.Vector2(0, -1.6));
    points.push(new THREE.Vector2(1.2, -1.6));
    // Curve up to body
    points.push(new THREE.Vector2(1.35, -1.5));
    // Straight cylinder body (wider)
    points.push(new THREE.Vector2(1.35, 0.6));
    // Curved shoulder
    points.push(new THREE.Vector2(1.3, 0.95));
    points.push(new THREE.Vector2(1.1, 1.25));
    points.push(new THREE.Vector2(0.7, 1.45));
    points.push(new THREE.Vector2(0.4, 1.55));
    // Neck
    points.push(new THREE.Vector2(0.35, 1.55));
    points.push(new THREE.Vector2(0.35, 1.85));
    // Flat top neck opening
    points.push(new THREE.Vector2(0, 1.85));

    // Create the body geometry
    const bodyGeometry = new THREE.LatheGeometry(points, 64);
    
    // Create the label texture
    labelTexture = createLabelTexture();
    
    // High-fidelity physical material for glossy plastic look
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
        map: labelTexture,
        color: 0xffffff,          // Set color to white so texture colors (purple background & white text) render exactly as drawn
        roughness: 0.18,         // Glossy surface
        metalness: 0.02,         // Slightly dielectric
        clearcoat: 0.85,          // Clear shiny coating
        clearcoatRoughness: 0.1,
        reflectivity: 0.7,
        sheen: new THREE.Color(0x9d8cff) // Fix sheen type conflict in Three.js r128
    });

    const bottleBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bottleBody.castShadow = true;
    bottleBody.receiveShadow = true;
    bottleGroup.add(bottleBody);

    // 2. Create the White Pump Dispenser Mechanism
    const dispenserGroup = new THREE.Group();

    // Matte white plastic material
    const whitePlasticMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.1
    });

    // Pump Collar (Base cap that screws onto the neck)
    const collarGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 32);
    const collar = new THREE.Mesh(collarGeom, whitePlasticMaterial);
    collar.position.y = 1.94;
    dispenserGroup.add(collar);

    // Pump Stem (Thin vertical post)
    const stemGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.38, 16);
    const stem = new THREE.Mesh(stemGeom, whitePlasticMaterial);
    stem.position.y = 2.25;
    dispenserGroup.add(stem);

    // Pump Head / Nozzle
    // We construct the dispenser nozzle extending forward
    const headGroup = new THREE.Group();

    // Rounded top center cap
    const headCenterGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.32, 32);
    const headCenter = new THREE.Mesh(headCenterGeom, whitePlasticMaterial);
    headGroup.add(headCenter);

    // Nozzle spout extending forward (Z direction)
    const spoutGeom = new THREE.BoxGeometry(0.24, 0.2, 0.6);
    const spout = new THREE.Mesh(spoutGeom, whitePlasticMaterial);
    spout.position.set(0, 0.04, 0.3); // offset forward
    // Slightly taper the spout
    spout.scale.set(1, 0.8, 1);
    headGroup.add(spout);
    
    // Position the whole head group on top of the stem
    headGroup.position.y = 2.55;
    // Rotate head to face forward-left (approx. 35 degrees)
    headGroup.rotation.y = 0.6;

    dispenserGroup.add(headGroup);
    bottleGroup.add(dispenserGroup);

    // 3. Add a Subtle Shadow Plane behind the bottle
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    // Draw soft circular shadow texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d');
    const grad = shadowCtx.createRadialGradient(128, 128, 0, 128, 128, 110);
    grad.addColorStop(0, 'rgba(79, 51, 189, 0.16)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(0, 0, 256, 256);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false
    });

    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.z = -1.6;
    shadowPlane.position.y = -0.5;
    scene.add(shadowPlane);

    // Add bottle to scene
    scene.add(bottleGroup);
}

// Entry Animation using GSAP
function animateEntry() {
    if (!bottleGroup) return;

    // Set starting state
    bottleGroup.position.y = -4; // Fly up
    bottleGroup.scale.set(0.1, 0.1, 0.1); // Scale up
    
    // Animate position, scale, and spin
    gsap.to(bottleGroup.position, {
        y: -0.2,
        duration: 1.8,
        ease: 'power4.out'
    });
    
    gsap.to(bottleGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.8,
        ease: 'power4.out'
    });

    // Spin bottle Y axis into base position
    gsap.fromTo(bottleGroup.rotation, 
        { y: -Math.PI * 2.5 },
        { y: targetRotationY, duration: 2.0, ease: 'power3.out' }
    );
}

// Interaction Listeners for Drag and Swipe
function setupInteractions() {
    const onPointerDown = (e) => {
        isDragging = true;
        lastInteractionTime = Date.now();
        
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        previousMousePosition = {
            x: clientX,
            y: clientY
        };
    };

    const onPointerMove = (e) => {
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            
            // Prevent page scrolling while dragging the 3D bottle on mobile
            if (isDragging && e.cancelable) {
                e.preventDefault();
            }
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        if (clientX === undefined || clientY === undefined) return;

        if (isDragging) {
            lastInteractionTime = Date.now();
            
            const deltaMove = {
                x: clientX - previousMousePosition.x,
                y: clientY - previousMousePosition.y
            };

            // Rotate based on dragging drag delta (increased sensitivity for responsive control)
            targetRotationY += deltaMove.x * 0.012;
            targetRotationX += deltaMove.y * 0.010;

            // Clamp vertical rotation so bottle doesn't flip upside down
            targetRotationX = Math.max(-0.4, Math.min(0.4, targetRotationX));

            previousMousePosition = {
                x: clientX,
                y: clientY
            };
        } else {
            // Subtle parallax when hover
            const rect = container.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
            const y = -((clientY - rect.top) / rect.height) * 2 + 1; // -1 to 1
            
            // Apply small parallax offset only if we haven't interacted recently
            if (Date.now() - lastInteractionTime > idleDelay) {
                targetRotationY = -0.3 + x * 0.25;
                targetRotationX = 0.1 + y * 0.15;
            }
        }
    };

    const onPointerUp = () => {
        isDragging = false;
    };

    // Desktop Mouse Events
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Mobile Touch Events (Disable passive listeners to allow e.preventDefault() for smooth mobile drag)
    container.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
}

// Window resize handler
function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
}

// Render loop
function animate() {
    requestAnimationFrame(animate);

    if (bottleGroup) {
        // Idle Auto-Rotation
        const timeSinceLastInteraction = Date.now() - lastInteractionTime;
        if (!isDragging && timeSinceLastInteraction > idleDelay) {
            targetRotationY += autoRotateSpeed;
        }

        // Apply smooth interpolation (Damping)
        bottleGroup.rotation.y += (targetRotationY - bottleGroup.rotation.y) * 0.1;
        bottleGroup.rotation.x += (targetRotationX - bottleGroup.rotation.x) * 0.1;
    }

    renderer.render(scene, camera);
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', init);
