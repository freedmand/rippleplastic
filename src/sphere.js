import constants from './constants.js';

export class Sphere {
  constructor(x, y, z, radius) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;

    this.r = Math.sqrt(x * x + y * y + z * z);
    this.theta = Math.acos(this.z / this.r);
    this.phi = Math.atan2(this.y, this.x);
  }

  candidate(radius = searchRadius) {
    const circumference = 2 * Math.PI * this.r;
    const fraction = radius / circumference;
    const angleRadius = fraction * 2 * Math.PI;

    const newAngleRadius = Math.random() * angleRadius + angleRadius;
    const angle = Math.random() * 2 * Math.PI;
    const angleX = Math.sin(angle);
    const angleY = Math.cos(angle);

    let newTheta = this.theta + newAngleRadius * angleX;
    let newPhi = this.phi + newAngleRadius * angleY;

    //     while (newTheta >= Math.PI) {
    //       newTheta -= Math.PI;
    //       newPhi += Math.PI;
    //     }
    //     while (newTheta < 0) {
    //       newTheta += Math.PI;
    //       newPhi += Math.PI;
    //     }

    //     while (newPhi >= Math.PI * 2) {
    //       newPhi -= Math.PI * 2;
    //     }
    //     while (newPhi < 0) {
    //       newPhi += Math.PI * 2;
    //     }

    return new Sphere(
      this.r * Math.sin(newTheta) * Math.cos(newPhi),
      this.r * Math.sin(newTheta) * Math.sin(newPhi),
      this.r * Math.cos(newTheta),
      this.radius
    );
  }

  tooClose(other, radius = searchRadius) {
    let distance = Math.sqrt(
      constants.sqr(this.x - other.x) +
        constants.sqr(this.y - other.y) +
        constants.sqr(this.z - other.z)
    );
    return distance < radius;
  }

  inBounds() {
    // Everything on sphere is "in bounds".
    return true;
  }

  static random(r, radius) {
    const theta = Math.random() * Math.PI;
    const phi = Math.random() * 2 * Math.PI;

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);

    return new Sphere(x, y, z, radius);
  }
}
