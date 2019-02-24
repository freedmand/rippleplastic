import {poissonDisk} from './poisson.js';
import {
  Scene,
  Color,
  TextureLoader,
  SpriteMaterial,
  Sprite,
  PerspectiveCamera,
  WebGLRenderer,
} from 'THREE';
import PointerLockControls from './pointerlock.js';
import constants from './constants.js';
import IMAGES from './images.js';

// Define scene.
const spheres = poissonDisk();

const scene = new Scene();
scene.background = new Color(constants.background);

// Add spheres.
const materials = [];
for (const image of IMAGES) {
  const map = new TextureLoader().load(image);
  materials.push(new SpriteMaterial({map: map, color: 0xffffff, fog: false}));
}

let i = 0;
// const material = new THREE.MeshBasicMaterial({color: foreground, wireframe: true});
for (const sphere of spheres) {
  var sprite = new Sprite(materials[i % materials.length]);
  const radius = sphere.radius * constants.radiusDrawMultiplier;
  sprite.scale.set(radius * 3, radius * 3, 1);
  sprite.position.set(sphere.x, sphere.y, sphere.z);
  scene.add(sprite);
  i += 1;

  // const geometry = new THREE.SphereGeometry(sphere.radius * radiusDrawMultiplier, 6, 6);
  // const sphereObj = new THREE.Mesh(geometry, material);
  // sphereObj.position.set(sphere.x, sphere.y, sphere.z);
  // scene.add(sphereObj);
}

// Define camera.
const fov = 75;
const aspect = constants.width / constants.height;
const near = 0.1;
const far = 1000;
const camera = new PerspectiveCamera(fov, aspect, near, far);
// camera.position.x = 100;
// camera.position.y = 10;
// camera.position.z = 10;
// camera.lookAt(new THREE.Vector3(0, 0, 0));

const controls = new PointerLockControls(camera);
scene.add(controls.getObject());

const renderer = new WebGLRenderer({
  antialias: true,
  canvas: document.getElementById('render'),
});
renderer.setSize(constants.width, constants.height);
renderer.setPixelRatio(devicePixelRatio);
animate();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
