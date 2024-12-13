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
      status: 1,
      vertices: new Float32Array()
    }, options);

    // Merge geometries from model meshes
    let geometry;
    let geometries = [];
    if (options.model) {
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
      options.shape = new TriMeshShape(options.vertices, options.indices, TriMeshFlags['FIX_INTERNAL_EDGES']);
    }
    else {
      console.error(`Error: TriMesh missing model.`);
    }

    // Inherit Entity class
    super(options);

    // Set default properties
    this.isTriMesh = true;
    this.type = 'trimesh';
    this.model = options.model;

    // Bind "this" context to class function (required for event removal)
    this.onTriMeshAdded = this.onTriMeshAdded.bind(this);
    this.addEventListener('added', this.onTriMeshAdded);
  }

  onTriMeshAdded(e) {
    // Bind target "this" context to class function (required for event removal)
    this.onTriMeshRemoved = this.onTriMeshRemoved.bind(this);

    // Add optional model to 3D object
    if (this.model && this.model.isObject3D) this.object.add(this.model);
    
    // Add TriMesh event listeners
    this.addEventListener('removed', this.onTriMeshRemoved);
  }

  onTriMeshRemoved(e) {
    // Remove model from 3D object
    if (this.model && this.model.isObject3D) this.object.remove(this.model);

    // Remove entity event listeners
    this.removeEventListener('removed', this.onTriMeshRemoved);
  }

  toJSON() {
    // Extend entity toJSON with model name
    const json = super.toJSON();

    // Assign cube properties to entity JSON
    Object.assign(json, {
      type: this.type
    });

    // Conditionally store model name
    if (this.model.name) json.model = { name: this.model.name };

    // Return json object
    return json;
  }
}

export { TriMesh };