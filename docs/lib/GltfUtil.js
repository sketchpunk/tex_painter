import * as THREE from "../thirdparty/three.module.js";
import Gltf       from "./Gltf2.js";

class GltfUtil{
    static async fetchMesh( path, mat ){
        const gltf  = await Gltf.fetch( path );
        const gmesh = gltf.getMesh();           // First Available Mesh
        const gprim = gmesh.primitives[ 0 ];    // Only Use First Primitive

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create Geometry
        let geo     = new THREE.BufferGeometry();
        geo.setIndex( new THREE.BufferAttribute( gprim.indices.data, 1 ) );
        geo.setAttribute( 'position', new THREE.BufferAttribute( gprim.position.data, gprim.position.componentLen ) );

        if( gprim.normal )      geo.setAttribute( 'normal', new THREE.BufferAttribute( gprim.normal.data,       gprim.normal.componentLen ) );
        if( gprim.texcoord_0 )  geo.setAttribute( 'uv',     new THREE.BufferAttribute( gprim.texcoord_0.data,   gprim.texcoord_0.componentLen ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let mesh = new THREE.Mesh( geo, mat );
        return mesh;
    }
}

export default GltfUtil;