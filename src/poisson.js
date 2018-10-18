import SimplexNoise from 'simplex-noise';
import {octree} from 'd3-octree';
import {Sphere} from './sphere.js';
import constants from './constants.js';

export function poissonDisk() {
  let firstSphere = Sphere.random(constants.r, constants.radius);
  let candidates = [firstSphere];
  let allSpheres = [firstSphere];

  let octs = octree();
  let simplex = new SimplexNoise(constants.randomSeed);

  // Adapted from https://bl.ocks.org/wonga00/3987b9736d5077501ef5ee0409ea93c1
  let inSphere = (x, y, z, cx, cy, cz, radius) => {
    return (
      constants.sqr(x - cx) + constants.sqr(y - cy) + constants.sqr(z - cz) <
      constants.sqr(radius)
    );
  };

  let cubeSphereIntersect = (
    rx,
    ry,
    rz,
    rwidth,
    rheight,
    rdepth,
    cx,
    cy,
    cz,
    radius
  ) => {
    let dx = cx - Math.max(rx, Math.min(cx, rx + rwidth));
    let dy = cy - Math.max(ry, Math.min(cy, ry + rheight));
    let dz = cz - Math.max(rz, Math.min(cz, rz + rdepth));
    return (
      constants.sqr(dx) + constants.sqr(dy) + constants.sqr(dz) < constants.sqr(radius)
    );
  };
  // Find the nodes within the specified sphere.
  let search = (octtree, cx, cy, cz, radius) => {
    let results = [];
    octs.visit(function(node, x1, y1, z1, x2, y2, z2) {
      if (!node.length) {
        do {
          var d = node.data;
          if (inSphere(d[0], d[1], d[2], cx, cy, cz, radius)) {
            results.push({
              x: d[0],
              y: d[1],
              z: d[2],
            });
          }
        } while ((node = node.next));
      }

      return !cubeSphereIntersect(
        x1,
        y1,
        z1,
        x2 - x1,
        y2 - y1,
        z2 - z1,
        cx,
        cy,
        cz,
        radius
      );
    });
    return results;
  };

  // A generator for nearby spheres using the octree.
  let nearbySpheres = (sphere, radius = constants.searchRadius) => {
    return search(octs, sphere.x, sphere.y, sphere.z, radius);
  };

  // Checks all created spheres to see if the candidate is too close.
  let tooClose = (candidate, radius) => {
    for (let sphere of nearbySpheres(candidate, radius)) {
      if (candidate.tooClose(sphere, radius)) return true;
    }
    return false;
  };

  // Try to generate a candidate and return it (null on fail).
  let generateCandidate = active => {
    let radius =
      constants.searchRadius *
      ((simplex.noise4D(
        active.x * constants.spacing,
        active.y * constants.spacing,
        active.z * constants.spacing,
        constants.time
      ) /
        2 +
        0.5) *
        constants.radiusMultiplier +
        constants.radiusShift);
    // Generate random spheres filled disc from radius r to 2r
    for (var i = 0; i < constants.searchAttempts; i++) {
      let candidate = active.candidate(radius);
      if (candidate.inBounds() && !tooClose(candidate, radius)) return candidate;
    }
    active.radius = radius;
    return null;
  };

  // Add sphere to the results and candidates.
  let addSphere = sphere => {
    candidates.push(sphere);
    allSpheres.push(sphere);
    octs.add([sphere.x, sphere.y, sphere.z]);
  };

  while (candidates.length > 0) {
    let active = candidates[candidates.length - 1];
    let candidate = generateCandidate(active);
    if (candidate == null) {
      candidates.pop();
    } else {
      addSphere(candidate);
    }
  }

  return allSpheres;
}
