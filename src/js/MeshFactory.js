/*
  The MeshFactory creates any Three.js mesh using basic JSON instructions
*/

import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  BoxGeometry, CapsuleGeometry, CircleGeometry, ConeGeometry, CylinderGeometry,
  DodecahedronGeometry, EdgesGeometry, ExtrudeGeometry, IcosahedronGeometry, InstancedMesh,
  LatheGeometry, LineBasicMaterial, LineDashedMaterial, Material, Mesh, MeshBasicMaterial,
  MeshDepthMaterial, MeshDistanceMaterial, MeshLambertMaterial, MeshMatcapMaterial,
  MeshNormalMaterial, MeshPhongMaterial, MeshPhysicalMaterial, MeshStandardMaterial,
  MeshToonMaterial, Object3D, OctahedronGeometry, PlaneGeometry, PointsMaterial, PolyhedronGeometry,
  RawShaderMaterial, RingGeometry, ShaderMaterial, ShadowMaterial, ShapeGeometry,
  SphereGeometry, SpriteMaterial, TetrahedronGeometry, TorusGeometry, TorusKnotGeometry,
  TubeGeometry, WireframeGeometry
} from 'three';

class MeshFactory {
  static create(options) {
    const geometry = new MeshFactory[options.geometry.type](...options.geometry.arguments);
    const material = new MeshFactory[options.material.type](...options.material.arguments);
    const mesh = new MeshFactory[options.type](geometry, material)
    return mesh;
  }

  static createInstancedMesh(object3D, coordinates) {
    // Create instanced mesh
    const { geometry, materials } = this.mergeObjectMeshes(object3D);
    const count = coordinates.length / 3;
    const instancedMesh = new InstancedMesh(geometry, materials, count);

    // Update each instance matrix
    const dummy = new Object3D();
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        coordinates[(i * 3)] + 0.5,
        coordinates[(i * 3) + 1] + 0.5,
        coordinates[(i * 3) + 2] + 0.5
      );
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
      instancedMesh.instanceMatrix.needsUpdate = true;
    }

    // Return object 3D instanced mesh
    return instancedMesh;
  }

  static mergeObjectMeshes(object3D) {
    // Combine geometries
    let geometry;
    let geometries = [];
    let materials = [];

    // Traverse and add geometries/materials to array
    object3D.traverse(obj => {
      if (obj.isMesh) {
        // Translate geometry from mesh origin
        obj.geometry.rotateX(obj.rotation.x);
        obj.geometry.rotateY(obj.rotation.y);
        obj.geometry.rotateZ(obj.rotation.z);
        obj.geometry.scale(obj.scale.x, obj.scale.y, obj.scale.z);
        obj.geometry.translate(obj.position.x, obj.position.y, obj.position.z);

        // Push geometry to array for merge
        geometries.push(obj.geometry);

        // Assign material
        materials.push(obj.material);
      }
    });
    
    // Return singular geometry and materials array
    geometry = mergeGeometries(geometries, true);
    geometry = mergeVertices(geometry);
    return { geometry, materials };
  }

  // Assign all Three.js Mesh classes as static fields
  static BoxGeometry = BoxGeometry;
  static CapsuleGeometry = CapsuleGeometry;
  static CircleGeometry = CircleGeometry;
  static ConeGeometry = ConeGeometry;
  static CylinderGeometry = CylinderGeometry;
  static DodecahedronGeometry = DodecahedronGeometry;
  static EdgesGeometry = EdgesGeometry;
  static ExtrudeGeometry = ExtrudeGeometry;
  static IcosahedronGeometry = IcosahedronGeometry;
  static LatheGeometry = LatheGeometry;
  static LineBasicMaterial = LineBasicMaterial;
  static LineDashedMaterial = LineDashedMaterial;
  static Material = Material;
  static Mesh = Mesh;
  static MeshBasicMaterial = MeshBasicMaterial;
  static MeshDepthMaterial = MeshDepthMaterial;
  static MeshDistanceMaterial = MeshDistanceMaterial;
  static MeshLambertMaterial = MeshLambertMaterial;
  static MeshMatcapMaterial = MeshMatcapMaterial;
  static MeshNormalMaterial = MeshNormalMaterial;
  static MeshPhongMaterial = MeshPhongMaterial;
  static MeshPhysicalMaterial = MeshPhysicalMaterial;
  static MeshStandardMaterial = MeshStandardMaterial;
  static MeshToonMaterial = MeshToonMaterial;
  static OctahedronGeometry = OctahedronGeometry;
  static PlaneGeometry = PlaneGeometry;
  static PointsMaterial = PointsMaterial;
  static PolyhedronGeometry = PolyhedronGeometry;
  static RawShaderMaterial = RawShaderMaterial;
  static RingGeometry = RingGeometry;
  static ShaderMaterial = ShaderMaterial;
  static ShadowMaterial = ShadowMaterial;
  static ShapeGeometry = ShapeGeometry;
  static SphereGeometry = SphereGeometry;
  static SpriteMaterial = SpriteMaterial;
  static TetrahedronGeometry = TetrahedronGeometry;
  static TorusGeometry = TorusGeometry;
  static TorusKnotGeometry = TorusKnotGeometry;
  static TubeGeometry = TubeGeometry;
  static WireframeGeometry = WireframeGeometry;
}

export { MeshFactory }