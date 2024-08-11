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
          var mesh = child.clone();
          geometry = mesh.geometry.clone();
          geometry.rotateX(mesh.rotation.x);
          geometry.rotateY(mesh.rotation.y);
          geometry.rotateZ(mesh.rotation.z);
          geometry.scale(mesh.scale.x, mesh.scale.y, mesh.scale.z);
          geometry.translate(mesh.position.x, mesh.position.y, mesh.position.z);
  
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
  }
}

export { TriMesh };