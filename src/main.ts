import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as grassMaterial from './materials/shellTextureMaterial';

const fpsEl = document.createElement("div");
fpsEl.style.position = "fixed";
fpsEl.style.top = "8px";
fpsEl.style.left = "8px";
fpsEl.style.padding = "6px 10px";
fpsEl.style.fontFamily = "monospace";
fpsEl.style.fontSize = "12px";
fpsEl.style.color = "#0f0";
fpsEl.style.background = "rgba(0,0,0,0.6)";
fpsEl.style.zIndex = "9999";
fpsEl.style.pointerEvents = "none";
fpsEl.textContent = "FPS: --";
document.body.appendChild(fpsEl);
let last = performance.now();
let frames = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
});
const controls = new OrbitControls(camera, renderer.domElement);
scene.add(camera);
camera.position.set(0, 3, 5);
camera.lookAt(0, 0, 0);
controls.update();

const planeGeometry = new THREE.SphereGeometry();
const INSTANCE_COUNT = 13;
const material = grassMaterial.createShellTextureMaterial({
    uAmount: { value: INSTANCE_COUNT }
});
const instancedPlane = new THREE.InstancedMesh(
    planeGeometry,
    material,
    INSTANCE_COUNT
);
scene.add(instancedPlane);
instancedPlane.rotation.x = THREE.MathUtils.degToRad(-90);

function animate() {
	controls.update();
	renderer.render(scene, camera);

    frames++;
    const now = performance.now();

    if (now - last >= 1000) {
        fpsEl.textContent = `FPS: ${frames}`;
        frames = 0;
        last = now;
    }
};

renderer.setAnimationLoop(animate);