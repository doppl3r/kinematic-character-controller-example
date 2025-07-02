/*
  An EntityTemplate provides predefined properties for the EntityFactory
*/

class EntityTemplates {
  constructor() {

  }

  static ball = {
    body: {
      status: 0
    },
    colliders: [
      {
        friction: 0,
        shapeDesc: {
          type: 'ball',
          arguments: [0.5]
        }
      }
    ],
    name: 'ball',
    object3D: {
      children: [
        {
          type: 'Mesh',
          geometry: {
            type: 'SphereGeometry',
            arguments: [0.5, 12, 8]
          },
          material: {
            type: 'MeshBasicMaterial',
            arguments: [{ color: '#ff00ff' }]
          }
        }
      ]
    }
  }

  static bounce = {
    body: {
      status: 1
    },
    colliders: [
      {
        events: [
          {
            name: 'bounce',
            value: { x: 0, y: 0, z: 0 }
          }
        ],
        isSensor: true,
        shapeDesc: {
          type: 'cuboid',
          arguments: [0.5, 0.5, 0.5]
        }
      }
    ],
    object3D: {
      children: [
        {
          type: 'Mesh',
          geometry: {
            type: 'BoxGeometry',
            arguments: [1, 1, 1]
          },
          material: {
            type: 'MeshBasicMaterial',
            arguments: [{ color: '#ffff00' }]
          }
        }
      ]
    },
    name: 'bounce'
  }

  static camera_orthographic = {
    name: 'camera',
    object3D: {
      children: [
        {
          type: 'OrthographicCamera',
          arguments: [-window.innerWidth / window.innerHeight, window.innerWidth / window.innerHeight, 1, -1, 0.05, 100]
        }
      ]
    }
  }

  static camera_perspective = {
    name: 'camera',
    object3D: {
      children: [
        {
          type: 'PerspectiveCamera',
          arguments: [45, window.innerWidth / window.innerHeight, 0.05, 100]
        }
      ]
    }
  }

  static cube = {
    body: {
      status: 1 // Fixed
    },
    colliders: [
      {
        friction: 0,
        shapeDesc: {
          type: 'cuboid',
          arguments: [0.5, 0.5, 0.5]
        }
      }
    ],
    name: 'cube',
    object3D: {
      children: [
        {
          type: 'Mesh',
          geometry: {
            type: 'BoxGeometry',
            arguments: [1, 1, 1]
          },
          material: {
            type: 'MeshBasicMaterial',
            arguments: [{ color: '#0287ef' }]
          }
        }
      ]
    }
  }

  static empty = {
    body: {
      status: 1 // Fixed
    },
    name: 'empty'
  }

  static light_hemisphere = {
    body: {
      status: 1
    },
    name: 'light',
    object3D: {
      children: [
        {
          type: 'HemisphereLight',
          arguments: ['#ffffff', '#aaaaaa', Math.PI]
        }
      ]
    }
  }

  static plane = {
    body: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: -Math.PI / 2, y: 0, z: 0 },
      status: 1
    },
    colliders: [
      {
        friction: 0.5,
        shapeDesc: {
          type: 'trimesh'
        }
      }
    ],
    name: 'plane',
    object3D: {
      children: [
        {
          type: 'Mesh',
          geometry: {
            type: 'PlaneGeometry',
            arguments: [9, 9, 9, 9]
          },
          material: {
            type: 'MeshBasicMaterial',
            arguments: [{ color: '#0287ef' }]
          }
        }
      ]
    }
  }

  static player = {
    body: {
      status: 2 // 2 = KinematicPositionBased
    },
    colliders: [
      {
        shapeDesc: {
          type: 'capsule',
          arguments: [1 / 4, 1 / 8]
        },
        translation: { x: 0, y: 0.375, z: 0 }
      }
    ],
    name: 'player',
    object3D: {
      children: ['asset:glb/player.glb'],
      scale: { x: 0.75, y: 0.75, z: 0.75 }
    }
  }

  static teleport = {
    body: {
      status: 1,
    },
    object3D: {
      children: [
        {
          type: 'Mesh',
          geometry: {
            type: 'BoxGeometry',
            arguments: [1, 1, 1]
          },
          material: {
            type: 'MeshBasicMaterial',
            arguments: [{ color: '#00ffff' }]
          }
        }
      ]
    },
    name: 'teleport'
  }

  static trimesh = {
    body: {
      status: 1
    },
    colliders: [
      {
        friction: 0.5,
        shapeDesc: {
          type: 'trimesh'
        }
      }
    ],
    name: 'trimesh'
  }

  static voxels = {
    body: {
      position: { x: -0.5, y: -0.5, z: -0.5 },
      status: 1
    },
    colliders: [
      {
        shapeDesc: {
          type: 'voxels',
          arguments: [0, 0, 0, { x: 1, y: 1, z: 1 }]
        }
      }
    ],
    name: 'voxels',
    object3D: {
      scale: { x: 1, y: 1, z: 1 },
      children: [
        {
          type: 'Mesh',
          geometry: {
            type: 'BoxGeometry',
            arguments: [1, 1, 1]
          },
          material: {
            type: 'MeshBasicMaterial',
            arguments: [{ color: '#0287ef' }]
          }
        }
      ]
    }
  }
}

export { EntityTemplates }