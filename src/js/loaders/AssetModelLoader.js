import { AnimationMixer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { clone as cloneWithSkeleton } from 'three/examples/jsm/utils/SkeletonUtils';

class AssetModelLoader extends GLTFLoader {
  constructor(manager) {
    super(manager);
  }

  async load(directory) {
    var response = await fetch(directory + 'models.json');
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
      }.bind(this));
    }
  }

  duplicate(model) {
    // Initialize model as null
    var model = cloneWithSkeleton(model);
    this.addMixer(model);

    // Return new model
    return model;
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

  updateShadows(model, castShadow = false, receiveShadow = false) {
    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });
  }
}

export { AssetModelLoader };