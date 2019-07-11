import * as THREE from 'THREE';

export function disposeObject3D(object: any) {
  if (object == null || object.traverse == null) return;
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

export function remove(elem: any) {
  while (elem.firstChild) {
    remove(elem.firstChild);
  }
  disposeObject3D(elem.object3D);
  elem.parentElement.removeChild(elem);
}
