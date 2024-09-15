import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { TriMesh as TriMeshShape, TriMeshFlags } from '@dimforge/rapier3d';
import { Entity } from './Entity.js';

/*
  A TriMesh creates a rigid body from a set of vertices and
  indices. TriMeshes have no interior and should only be used
  for terrain or other fixed object types.
*/

class TriMesh extends Entity {
  constructor(options) {
    // Set options with default values
    options = Object.assign({
      indices: new Uint16Array(),
      type: 'Fixed',
      vertices: new Float32Array()
    }, options);

    // Merge geometries from model meshes
    if (options.model) {
      var geometry;
      var geometries = [];
      options.model.traverse(function(child) {
        if (child.isMesh) {
          // Translate geometry from mesh origin
          geometry = child.geometry;
          geometry.rotateX(child.rotation.x);
          geometry.rotateY(child.rotation.y);
          geometry.rotateZ(child.rotation.z);
          geometry.scale(child.scale.x, child.scale.y, child.scale.z);
          geometry.translate(child.position.x, child.position.y, child.position.z);
  
          // Push geometry to array for merge
          geometries.push(geometry);
        }
      });
      geometry = mergeGeometries(geometries);
  
      // Create TriMesh from merged geometry
      options.vertices = geometry.attributes.position.array;
      options.indices = geometry.index.array;
    }

    // Create physical shape
    options.shape = new TriMeshShape(options.vertices, options.indices, TriMeshFlags['FIX_INTERNAL_EDGES']);

    // Inherit Entity class
    super(options);

    // Add optional model to 3D object
    this.model = options.model;
    this.object.add(this.model);
  }
}

export { TriMesh };