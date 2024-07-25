import { BackSide, Color, Mesh, ShaderMaterial, SphereGeometry } from 'three';
import { Ball } from '@dimforge/rapier3d';
import { Entity } from './Entity.js';

/*
  The background class provides a basic skybox shader and an
  ambient light to illuminate the scene. It does not include
  a rigid body since Character Controllers cannot filter them
  out at this time (existing bug).
*/

class Background extends Entity {
  constructor(options) {
    // Resolve null option values
    if (options == null) options = {};
    if (options.color == null) options.color = '#ffffff';
    if (options.radius == null) options.radius = 64;
    if (options.widthSegments == null) options.widthSegments = 16;
    if (options.heightSegments == null) options.heightSegments = 16;
    if (options.type == null) options.type = 'KinematicPositionBased';

    // Create physical shape
    options.shape = new Ball(options.radius);
    options.isSensor = true;
    options.type = 'Fixed';
    options.group = 0x00000000; // Hexadecimal (default = 4294967295, or 0xFFFFFFFF, or 0b11111111111111111111111111111111)

    // Inherit Entity class (without a physical body/shape)
    super(options);
    
    // Initialize with options
    var geometry = new SphereGeometry(options.radius, 16, 16);

    // Update bounding box for shader material
    geometry.computeBoundingBox();

    // Configure shader material gradient
    var material = new ShaderMaterial({
      uniforms: {
        top: {  value: new Color("#ffffff") },
        bottom: { value: new Color("#f65510") },
        min: { value: geometry.boundingBox.min },
        max: { value: geometry.boundingBox.max },
        scale: { value: 2 }
      },
      vertexShader: `
        uniform vec3 min;
        uniform vec3 max;
        varying vec2 vUv;
        void main() {
          vUv.y = (position.y - min.y) / (max.y - min.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 bottom;
        uniform vec3 top;
        uniform float scale;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(mix(bottom, top, smoothstep(0.5 - (scale / 2.0), 0.5 + (scale / 2.0), vUv.y)), 1.0);
        }
      `,
      side: BackSide
    });
    
    // Add mesh and light to object
    var mesh = new Mesh(geometry, material);
    mesh.rotation.x += Math.PI * 0.5;
    this.object.add(mesh);
  }

  render(delta, alpha) {
    // Call Character update function
    super.render(delta, alpha);
  }
}

export { Background };