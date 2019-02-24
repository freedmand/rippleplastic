import {poissonDisk} from './poisson.js';
// import {
//   Scene,
//   Color,
//   TextureLoader,
//   SpriteMaterial,
//   Sprite,
//   PerspectiveCamera,
//   WebGLRenderer,
// } from 'THREE';
import * as THREE from 'THREE';
import PointerLockControls from './pointerlock.js';
import constants from './constants.js';
import IMAGES from './images.js';
import {debug} from 'util';
// import aframe from 'aframe';
// import * as aframeSpriteComponent from 'aframe-sprite-component';

const aframeScene = document.querySelector('a-scene');
// const skies = document.querySelectorAll('a-sky');
const loading = document.querySelector('.loader') as HTMLElement;

const skyContainer = document.getElementById('sky-container');

let handleLoadFn: Function | null = null;

// Define scene.

// const scenes = ['birds_nest'];
const scenes = ['birds_nest', 'hong_kong', 'snowflake', 'where_am_i'];

let activeScene = 0;

const renderedEntities = [];

function disposeObject3D(object: any) {
  object.traverse((obj: any) => {
    if (obj instanceof THREE.Mesh) {
      if (obj.material) {
        obj.material.dispose();
        if (obj.material.map) {
          obj.material.map.dispose();
          obj.material.map = null;
        }
        if (obj.material.lightMap) {
          obj.material.lightMap.dispose();
          obj.material.lightMap = null;
        }
        if (obj.material.aoMap) {
          obj.material.aoMap.dispose();
          obj.material.aoMap = null;
        }
        if (obj.material.emissiveMap) {
          obj.material.emissiveMap.dispose();
          obj.material.emissiveMap = null;
        }
        if (obj.material.bumpMap) {
          obj.material.bumpMap.dispose();
          obj.material.bumpMap = null;
        }
        if (obj.material.normalMap) {
          obj.material.normalMap.dispose();
          obj.material.normalMap = null;
        }
        if (obj.material.displacementMap) {
          obj.material.displacementMap.dispose();
          obj.material.displacementMap = null;
        }
        if (obj.material.roughnessMap) {
          obj.material.roughnessMap.dispose();
          obj.material.roughnessMap = null;
        }
        if (obj.material.metalnessMap) {
          obj.material.metalnessMap.dispose();
          obj.material.metalnessMap = null;
        }
        if (obj.material.alphaMap) {
          obj.material.alphaMap.dispose();
          obj.material.alphaMap = null;
        }
        if (obj.material.envMaps) {
          obj.material.envMaps.dispose();
          obj.material.envMaps = null;
        }
        if (obj.material.envMap) {
          obj.material.envMap.dispose();
          obj.material.envMap = null;
        }
        if (obj.material.specularMap) {
          obj.material.specularMap.dispose();
          obj.material.specularMap = null;
        }
        if (obj.material.gradientMap) {
          obj.material.gradientMap.dispose();
          obj.material.gradientMap = null;
        }
      }
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      if (obj.texture) {
        obj.texture.dispose();
        obj.texture = {};
      }
      if (obj.bufferGeometry) {
        obj.bufferGeometry.dispose();
      }
    }
  });
}

function remove(elem: any) {
  while (elem.firstChild) {
    remove(elem.firstChild);
  }
  disposeObject3D(elem.object3D);
  elem.parentElement.removeChild(elem);
}

function renderScene(idx) {
  while (renderedEntities.length > 0) {
    remove(renderedEntities.pop());
  }

  loading.classList.remove('loaded');

  const spheres = poissonDisk();

  let loadCounter = 0;
  handleLoadFn = () => {
    loadCounter++;
    if (loadCounter >= spheres.length + 1) {
      loading.classList.add('loaded');
    }
  };

  const scene = scenes[idx];

  const sky = document.createElement('a-sky');

  sky.addEventListener('materialtextureloaded', () => {
    handleLoadFn();
  });

  sky.setAttribute('src', `images/composites/${scene}.png`);
  sky.setAttribute('rotation', '0 0 0');

  skyContainer.appendChild(sky);
  renderedEntities.push(sky);

  // Add spheres.
  let i = 0;
  for (const sphere of spheres) {
    const image = document.createElement('a-image');

    image.addEventListener('materialtextureloaded', () => {
      handleLoadFn();
    });
    image.setAttribute(
      'src',
      `images/${scene}/${IMAGES[scene][i % IMAGES[scene].length]}`
    );

    const container = document.createElement('a-entity');
    container.appendChild(image);

    const radius = sphere.radius * constants.radiusDrawMultiplier;
    container.setAttribute('position', `${sphere.x} ${sphere.y} ${sphere.z}`);
    image.setAttribute('rotation', `0 0 ${Math.random() * 360}`);
    image.setAttribute('scale', `${radius} ${radius} ${radius}`);
    container.setAttribute('look-at', '[camera]');
    aframeScene.appendChild(container);
    i++;

    if (!activeScene) {
      container.style.display = 'none';
    }

    renderedEntities.push(container);
  }
}

// Render one scene at a time
renderScene(activeScene);

function toggleStats() {
  if (aframeScene.hasAttribute('stats')) {
    aframeScene.removeAttribute('stats');
  } else {
    aframeScene.setAttribute('stats', '');
  }
}

document.addEventListener(
  'keypress',
  e => {
    if (e.keyCode == 13) {
      // Enter
      if (loading.classList.contains('loaded')) {
        activeScene = (activeScene + 1) % scenes.length;
        renderScene(activeScene);
      }
    } else if (e.key == 's') {
      toggleStats();
    }
  },
  false
);

// const foreground = document.getElementById('foreground');
// foreground.addEventListener('model-loaded', () => {
//   const object = (foreground as any).getObject3D('mesh');

//   // el.components.material.material.alphaTest = 0.5;
//   // el.components.material.material.depthWrite = false;
//   // el.components.material.material.needsUpdate = true;

//   const material = object.material;
//   if (object) {
//     object.traverse(node => {
//       console.log(node);
//       if (node.isMesh) {
//         console.log('mesh', node);
//         node.material.transparent = false;
//         node.material.alphaTest = 0.2;
//         // node.material.depthWrite = false;
//         node.material.needsUpdate = true;
//       }
//     });
//   }
// });
