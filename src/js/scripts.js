import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

import bucketPng from 'url:./../assets/bucket.png';
import bucketModel from 'url:./../assets/bucket.obj';

import skyscrapperPng from 'url:./../assets/skyscrapper.png';
import skyscrapperModel from 'url:./../assets/skyscrapper.obj';

import wheelPng from 'url:./../assets/rope.png';
import wheelModel from 'url:./../assets/wheel.obj';

import planksPng from 'url:./../assets/planks.png';
import planksModel from 'url:./../assets/planks.obj';

let lookingLeft = false;
let lookingRight = false;

let handVisible = false;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const bkgColor = 0xD0E8F8;
renderer.setClearColor(bkgColor);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(bkgColor, 0, 12);

const video = document.createElement('video');
video.setAttribute('playsinline', '');
video.muted = true;
video.autoplay = true;

// --- debug view styling ---
video.style.position = 'fixed';
video.style.right = '10px';
video.style.bottom = '10px';
video.style.width = '160px';
video.style.height = '120px';
video.style.border = '2px solid #0f0';
video.style.borderRadius = '6px';
video.style.background = '#000';
video.style.zIndex = '9998';
video.style.opacity = '0.9';

document.body.appendChild(video);

let thumbs_up = false;
let thumbs_down = false;

function distance(a, b) {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const dz = a.z - b.z;
	return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

function detectThumbGestureLandscape(landmarks) {
	const wrist = landmarks[0];
	const thumbTip = landmarks[4];
	const thumbMCP = landmarks[2];

	const indexTip = landmarks[8];
	const middleTip = landmarks[12];
	const ringTip = landmarks[16];
	const pinkyTip = landmarks[20];

	// 1. Polegar estendido
	const thumbExtended =
		distance(thumbTip, thumbMCP) > 0.05;

	// 2. Outros dedos recolhidos
	const fingersFolded =
		distance(indexTip, wrist) < 0.1 &&
		distance(middleTip, wrist) < 0.1 &&
		distance(ringTip, wrist) < 0.1 &&
		distance(pinkyTip, wrist) < 0.1;

	if (!thumbExtended || !fingersFolded) {
		return "none";
	}

	// 3. Direção em landscape (eixo X)
	if (thumbTip.x > wrist.x) {
		return "thumbs_up";
	}

	if (thumbTip.x < wrist.x) {
		return "thumbs_down";
	}

	return "none";
}

const hands = new Hands({
	locateFile: file =>
		`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
	maxNumHands: 1,
	modelComplexity: 0,
	minDetectionConfidence: 0.7,
	minTrackingConfidence: 0.5
});


hands.onResults((results) => {
	handVisible = !!(
		results.multiHandLandmarks &&
		results.multiHandLandmarks.length > 0
	);
});

hands.onResults((results) => {
	if (!results.multiHandLandmarks.length) return;

	const landmarks = results.multiHandLandmarks[0];
	const gesture = detectThumbGestureLandscape(landmarks);

	if (gesture === "thumbs_up") {
		thumbs_up = true;
		thumbs_down = false;
	}
	else if (gesture === "thumbs_down") {
		thumbs_down = true;
		thumbs_up = false;
	}
	else {
		thumbs_down = false;
		thumbs_up = false;
	}
});

const cameraFeed = new Camera(video, {
	onFrame: async () => {
		await hands.send({ image: video });
	},
	width: 640,
	height: 480,
	facingMode: 'environment'
});

cameraFeed.start();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new PointerLockControls(camera, document.body);
camera.position.set(0, 2, 3);
camera.rotation.y = THREE.MathUtils.degToRad(90);

const objLoader = new OBJLoader();
const textureLoader = new THREE.TextureLoader();

function loadModelWithTexture(model, png, onLoad = null) {
	const texture = textureLoader.load(png);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	objLoader.load(
		model, (obj) => {
			obj.traverse(function(child) {
				if (child instanceof THREE.Mesh) {
					child.material = new THREE.MeshBasicMaterial({map: texture});
				}
			})
			if (typeof onLoad == 'function') {
				onLoad(obj);
			}
		},
		function( xhr ){
			console.log( (xhr.loaded / xhr.total * 100) + "% loaded")
		},
		function( err ){
			console.error( "Error loading 'ship.obj'")
		}
	)
}

const glowColor = 0xc6ff72;
const glowIntensity = 1.1

const normalColor = 0xFFFFFF;
const normalIntensity = 0.8
function loadModelWithTexturePretty(model, png, onLoad = null) {
	const texture = textureLoader.load(png);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	objLoader.load(
		model, (obj) => {
			obj.traverse(function(child) {
				if (child instanceof THREE.Mesh) {
					child.material = new THREE.MeshStandardMaterial({
						map: texture,

						emissive: new THREE.Color(normalColor),
						emissiveIntensity: normalIntensity,

						emissiveMap: texture,
						roughness: 0.6,
						metalness: 0.0,
					});
				}
			})
			if (typeof onLoad == 'function') {
				onLoad(obj);
			}
		},
		function( xhr ){
			console.log( (xhr.loaded / xhr.total * 100) + "% loaded")
		},
		function( err ){
			console.error( "Error loading 'ship.obj'")
		}
	)
}

function spawnPrototype(prototype) {
	const obj = prototype.clone(true);
	obj.position.set(0, 0, 0);
	scene.add(obj);
	return obj;
}

function createInvisibleBlock(position, onHit) {
	const geometry = new THREE.PlaneGeometry(4.5, 30);
	const material = new THREE.MeshBasicMaterial();

	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.copy(position);
	mesh.visible = false;

	mesh.userData.onHit = onHit;

	scene.add(mesh);
	return mesh;
}


function getFirstMaterial(root) {
  if (!root) return null;

  let found = null;

  root.traverse(child => {
    if (found) return;
    if (child.isMesh && child.material) {
      found = child.material;
    }
  });

  return found;
}

let skyScrapper = null;
loadModelWithTexture(skyscrapperModel, skyscrapperPng, (obj) => {
	scene.add(obj);
	skyScrapper = obj;

	obj.rotation.y = (Math.PI / 2) * 3;
});

let bucket = null;
loadModelWithTexture(bucketModel, bucketPng, (obj) => {
	bucket = obj;
});

let planks = null;
loadModelWithTexture(planksModel, planksPng, (obj) => {
	scene.add(obj);

	obj.add(bucket);
	bucket.position.y = 0.2

	planks = obj;
	obj.rotation.y = (Math.PI / 2);
	
	obj.position.z = 3;
});

const DISTANCE = 4.1

let leftWheel = null;
let rightWheel = null;
loadModelWithTexturePretty(wheelModel, wheelPng, (obj) => {
	leftWheel = spawnPrototype(obj);
	leftWheel.position.set(-DISTANCE, 0, 3);
	
	rightWheel = spawnPrototype(obj);
	rightWheel.position.set(DISTANCE, 0, 3);
	rightWheel.rotation.y = THREE.MathUtils.degToRad(180);
});

const leftBlock = createInvisibleBlock(new THREE.Vector3(-DISTANCE, 0, 3), () => {
	lookingLeft = true;
});
leftBlock.rotation.y = THREE.MathUtils.degToRad(90);

const rightBlock = createInvisibleBlock(new THREE.Vector3(DISTANCE, 0, 3), () => {
	lookingRight = true;
});
rightBlock.rotation.y = THREE.MathUtils.degToRad(-90);

const raycaster = new THREE.Raycaster();
const forward = new THREE.Vector3();
function updateRaycast() {
	lookingLeft = false;
	lookingRight = false;
	camera.getWorldDirection(forward);
	raycaster.set(camera.position, forward);

	const hits = raycaster.intersectObjects(scene.children, false);

	if (hits.length > 0) {
		const hit = hits[0].object;
		if (hit.userData.onHit) {
			hit.userData.onHit();
		}
	}
}
document.addEventListener('click', () => {
	controls.lock();
});


let mouseLDown = false;
let mouseRDown = false;
document.addEventListener('mousedown', (e) => {
	if (e.button === 0)
		mouseLDown = true;

	if (e.button === 2)
		mouseRDown = true;
});

document.addEventListener('mouseup', (e) => {
	if (e.button === 0)
		mouseLDown = false;

	if (e.button === 2)
		mouseRDown = false;
});
document.addEventListener('contextmenu', e => e.preventDefault());

const clock = new THREE.Clock();
const ROTATION_SPEED = THREE.MathUtils.degToRad(10);
function handleAndaimeRotation() {
	const handActsAsMouse = handVisible;
	let andaimeRotation = 0;
	const dt = clock.getDelta();

	let leftMaterial = null;
	let rightMaterial = null;

	if (leftWheel) leftMaterial = getFirstMaterial(leftWheel);
	if (rightWheel) rightMaterial = getFirstMaterial(rightWheel);

	if (leftMaterial) {
		leftMaterial.emissiveIntensity = normalIntensity;
		leftMaterial.emissive = new THREE.Color(normalColor);
	}

	if (rightMaterial) {
		rightMaterial.emissiveIntensity = normalIntensity;
		rightMaterial.emissive = new THREE.Color(normalColor);
	}
	
	if (lookingLeft) {
		if (leftWheel) {
			leftMaterial.emissiveIntensity = glowIntensity;
			leftMaterial.emissive = new THREE.Color(glowColor);
		}

		if (mouseLDown || handActsAsMouse) 
			andaimeRotation += ROTATION_SPEED * dt;

		else if (mouseRDown)
			andaimeRotation -= ROTATION_SPEED * dt;
	}
	else if (lookingRight) {
		if (rightWheel) {
			rightMaterial.emissiveIntensity = glowIntensity;
			rightMaterial.emissive = new THREE.Color(glowColor);
		}

		if (mouseLDown || handActsAsMouse) 
			andaimeRotation -= ROTATION_SPEED * dt;

		else if (mouseRDown)
			andaimeRotation += ROTATION_SPEED * dt;
	}

	if (planks && leftWheel && rightWheel && bucket) {
		const WORLD_Z = new THREE.Vector3(0, 0, 1);
		planks.rotateOnWorldAxis(WORLD_Z, andaimeRotation);

		const wheelFactor = 4;
		leftWheel.position.y -= andaimeRotation * wheelFactor;
		rightWheel.position.y += andaimeRotation * wheelFactor;

		const SLIDE_FACTOR = 8
		bucket.position.z -= andaimeRotation * SLIDE_FACTOR;
	}
}

function animate(time) {
	requestAnimationFrame(animate);

	updateRaycast();
	handleAndaimeRotation()
	renderer.render(scene, camera);
}
animate();