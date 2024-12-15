import { AmbientLight, AnimationMixer, OrthographicCamera, Scene, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { clone as cloneWithSkeleton } from 'three/examples/jsm/utils/SkeletonUtils';

class AssetModelLoader extends GLTFLoader {
  constructor(manager) {
    super(manager);
  }

  async load(url) {
    try {
      var response = await fetch(url);
      var json = await response.json();

      // Loop through json keys and values
      for (const [key, value] of Object.entries(json)) {
        super.load(value.url, function(gltf) {
          // Load model from gltf.scene Object3D (includes SkinnedMesh)
          var model = gltf.scene;
          model.name = key;
          model.animations = gltf.animations;
          model.userData = { ...value.userData };
          model.duplicate = this.duplicate.bind(this, model);
          this.manager.cache[key] = model;
          this.addMixer(model);
        }.bind(this),
        function(xhr) {
          
        },
        function(error) {
          console.error(`Error: Model "${ value.url }" not found.`);
        });
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  duplicate(model) {
    // Initialize model as null
    const clone = cloneWithSkeleton(model);
    this.addMixer(clone);

    // Return new model
    return clone;
  }

  addMixer(model) {
    // Check if animations exist
    if (model.animations.length > 0) {
      var loopType = model.userData.loop || 2201; // 2201 = LoopRepeat, 2200 = LoopOnce
      model.mixer = new AnimationMixer(model);
      model.actions = {};
  
      // Add all animations (for nested models)
      for (var i = 0; i < model.animations.length; i++) {
        var animation = model.animations[i];
        var action = model.mixer.clipAction(animation);
        if (loopType == 2200) {
          action.setLoop(loopType);
          action.clampWhenFinished = true;
        }
        action.play(); // Activate action by default
        action.setEffectiveWeight(0); // Clear action influence
        model.actions[animation.name] = action;

        // Set active action to first action
        if (i == 0) {
          model.actions['active'] = action;
          action.setEffectiveWeight(1);
        }
      }
  
      // Add action helper function
      model.play = function(name, duration = 1) {
        var startAction = model.actions['active'];
        var endAction = model.actions[name];

        // Check if action exists
        if (endAction && endAction != startAction) {
          // Fade in from no animation
          if (startAction == null) {
            endAction.setEffectiveWeight(1);
            endAction.reset().fadeIn(duration);
          }
          else {
            // Cross fade animation with duration
            startAction.setEffectiveWeight(1);
            endAction.setEffectiveWeight(1);
            endAction.reset().crossFadeFrom(startAction, duration);
          }

          // Store action data for cross fade
          endAction['duration'] = duration;
          model.actions['active'] = endAction;
        }
      }
    }
  }

  renderThumbnail(model, options) {
    // Set default options
    options = Object.assign({
      height: 64,
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      width: 64
    }, options);

    // Set model options
    const positionPrev = model.position.clone();
    const scalePrev = model.scale.clone();
    model.position.copy(options.position);
    model.scale.copy(options.scale);

    // Add model to scene before rendering
    _scene.add(model);
    _renderer.setSize(options.width, options.height);
    _renderer.render(_scene, _camera);
    model.removeFromParent();

    // Revert model options
    model.position.copy(positionPrev);
    model.scale.copy(scalePrev);

    // Return canvas rendering
    return _canvas.toDataURL('image/png');
  }
}

// Initialize thumbnail components
const _light = new AmbientLight('#ffffff', Math.PI);
const _scene = new Scene();
const _canvas = document.createElement('canvas');
const _renderer = new WebGLRenderer({ alpha: true, canvas: _canvas });
const _camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 100);

// Update local components
_scene.add(_light);
_camera.position.z = 10;

export { AssetModelLoader };