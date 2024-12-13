import { Fog, PCFSoftShadowMap, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import Stats from './Stats.js';

class Graphics {
  constructor(canvas = document.createElement('canvas')) {
    // Initialize camera and scene
    this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
    this.scene = new Scene();
    this.canvas = canvas;

    // Add fog
    this.fog = new Fog('#ffffff');
    this.scene.fog = this.fog;

    // Add stats
    this.stats = new Stats();

    // Initialize renderer components
    window.devicePixelRatio = 1; // Force pixelation
    this.renderer = new WebGLRenderer({ alpha: true, canvas: canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    // Assign post processing on top of renderer
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.outputPass = new OutputPass(); // {} = use default resolution

    // Initialize outline effects
    this.outlinePass = new OutlinePass({ x: window.innerWidth, y: window.innerHeight }, this.scene, this.camera);
    this.outlinePass.edgeStrength = 3; // Default 3
    this.outlinePass.edgeGlow = 0; // Default 0
    this.outlinePass.edgeThickness = 0.125; // Default 1
    this.outlinePass.visibleEdgeColor.set('#000000');
    this.outlinePass.hiddenEdgeColor.set('#000000');
    this.outlinePass.enabled = true;

    // Anti-aliasing
    this.smaaPass = new SMAAPass(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
    this.smaaPass.enabled = false;

    // Initialize pixel effects
    this.pixelatedPass = new RenderPixelatedPass(2, this.scene, this.camera);
    this.pixelatedPass.normalEdgeStrength = 1; // 0.0 to 2.0, Default = 0.3
    this.pixelatedPass.depthEdgeStrength = 1; // 0.0 to 1.0, Default = 0.4
    this.pixelatedPass.enabled = false;

    // Add effects to composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass); // Renderer
    this.composer.addPass(this.pixelatedPass); // Pixelated effect
    this.composer.addPass(this.outlinePass); // Outline
    this.composer.addPass(this.smaaPass); // Anti-aliasing
    this.composer.addPass(this.outputPass); // Gamma/sRGB correction

    // Add event listeners and dispatch resize immediately
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    window.dispatchEvent(new Event('resize'));
  }

  render() {
    this.stats.begin();
    this.composer.render();
    this.stats.end();
  }

  resize(e) {
    var width = e.target.innerWidth;
    var height = e.target.innerHeight;
    this.setSize(width, height)
  }

  setSize(width, height) {
    var ratio = width / height;
    
    // Update orthographic frustum
    if (this.camera.isOrthographicCamera) {
      this.camera.left = -ratio * 0.5;
      this.camera.right = ratio * 0.5;
      this.camera.top = 0.5;
      this.camera.bottom = -0.5;
    }

    // Update camera ratio
    this.camera.aspect = ratio;
    this.camera.updateProjectionMatrix();

    // Update renderer size
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  setCamera(camera) {
    this.camera = camera;
    this.renderPass.camera = camera;
    this.pixelatedPass.camera = camera;
    this.outlinePass.renderCamera = camera;
  }

  setScene(scene) {
    this.scene = scene;
    this.scene.fog = this.fog;
    this.renderPass.scene = scene;
    this.pixelatedPass.scene = scene;
    this.outlinePass.renderScene = scene;
  }

  setShadows(state = true) {
    this.renderer.shadowMap.enabled = state;
    this.scene.traverse(function (child) {
      if (child.material) {
        child.castShadow = state;
        child.receiveShadow = state;
        child.material.needsUpdate = true;
      }
    });
  }

  setSelectedObjects(objects = []) {
    // Set outline selected objects
    this.outlinePass.selectedObjects = objects;
  }

  addStats() {
    document.body.appendChild(this.stats.dom);
  }

  removeStats() {
    document.body.removeChild(this.stats.dom);
  }
}

export { Graphics };