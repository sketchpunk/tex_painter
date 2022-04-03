import * as THREE from '../thirdparty/three.module.js';
import ObjParser  from './ObjParser.js';

class ObjUtil{
    static async fetchMesh( path, mat ){
        const obj  = await ObjParser.fetch( path );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create Geometry
        let geo     = new THREE.BufferGeometry();
        geo.setIndex( new THREE.BufferAttribute( new Uint32Array(obj.indices), 1 ) );
        geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(obj.vertices), 3 ) );

        if( obj.normalCount )   geo.setAttribute( 'normal', new THREE.BufferAttribute( new Float32Array(obj.normals),   3 ) );
        if( obj.texcoordCount ) geo.setAttribute( 'uv',     new THREE.BufferAttribute( new Float32Array(obj.texcoords), 2 ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let mesh = new THREE.Mesh( geo, mat );
        return mesh;
    }
}

export default ObjUtil;