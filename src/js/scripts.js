import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import * as dat from 'dat.gui'

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.xr.enabled = true
document.body.appendChild(renderer.domElement)
document.body.appendChild(VRButton.createButton(renderer))

// Scene
const scene = new THREE.Scene()

// Camera (WebXR will override its transform in VR)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

const cameraRig = new THREE.Group()
cameraRig.position.set(-3, 5, 15)
cameraRig.add(camera)
scene.add(cameraRig)

// Helpers
scene.add(new THREE.AxesHelper(5))
scene.add(new THREE.GridHelper(30))

// Box
const box = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
)
box.position.y = 1
box.castShadow = true
scene.add(box)

// Plane (floor)
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  })
)
plane.rotation.x = -Math.PI / 2
plane.receiveShadow = true
scene.add(plane)

// Sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(4),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
)
sphere.position.set(-10, 10, 0)
sphere.castShadow = true
scene.add(sphere)

// Lights
scene.add(new THREE.AmbientLight(0x333333))

const spotLight = new THREE.SpotLight(0xffffff, 1)
spotLight.position.set(-100, 100, 0)
spotLight.angle = 0.2
spotLight.decay = 0
spotLight.castShadow = true
scene.add(spotLight)

// GUI (works on desktop, not inside headset)
const gui = new dat.GUI()
const options = {
  sphereColor: '#ffea00',
  wireframe: false,
  speed: 0.01
}

gui.addColor(options, 'sphereColor').onChange(v => {
  sphere.material.color.set(v)
})

gui.add(options, 'wireframe').onChange(v => {
  sphere.material.wireframe = v
})

gui.add(options, 'speed', 0, 0.1)

// Animation
let step = 0

renderer.setAnimationLoop((time) => {
  box.rotation.x = time / 1000
  box.rotation.y = time / 1000

  step += options.speed
  sphere.position.y = 10 * Math.abs(Math.sin(step))

  renderer.render(scene, camera)
})

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
