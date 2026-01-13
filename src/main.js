/* src/main.js */

// 1. Import Dependencies via ES Modules (No installation needed)
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
// GSAP is usually loaded globally in Webflow via CDN, but we can import it here too if needed.
// For this script, we assume GSAP is added to Webflow Head.

export function init3DScene(containerID, modelURL) {
  
  // --- Setup ---
  const container = document.getElementById(containerID);
  if (!container) return;

  const scene = new THREE.Scene();
  
  // Camera
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 5); // Start slightly back

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; 
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(2, 5, 5);
  scene.add(dirLight);

  // --- Load Model ---
  const loader = new GLTFLoader();
  let model;

  loader.load(modelURL, (gltf) => {
    model = gltf.scene;
    
    // Center and Scale
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.scale.set(1.5, 1.5, 1.5);

    scene.add(model);
    
    // --- Initialize GSAP Animation ---
    // We check if GSAP exists first
    if (window.gsap && window.ScrollTrigger) {
      initScrollAnimation(model);
    } else {
      console.warn("GSAP not found. Model loaded but won't scroll.");
    }
  });

  // --- GSAP Logic ---
  function initScrollAnimation(object) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    // Create a timeline that links scroll progress to rotation
    const tl = window.gsap.timeline({
      scrollTrigger: {
        trigger: ".cube-scroll-track", // The Webflow class name
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // 1 second smoothing (lag)
      }
    });

    tl.to(object.rotation, {
      y: Math.PI * 2, // 360 spin
      x: 0.5,         // Slight tilt
      ease: "none"
    });
  }

  // --- Resize Handler ---
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // --- Animation Loop ---
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}