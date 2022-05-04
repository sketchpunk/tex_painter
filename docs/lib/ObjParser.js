export default class ObjParser{
    constructor(){
        this.indices        = [];
        this.vertices       = [];
        this.normals        = [];
        this.texcoords      = [];

        this.vertexCount    = 0;
        this.normalCount    = 0;
        this.texcoordCount  = 0;
    }

    parse( txt ){
        const lines     = txt.split( '\n' );
        const splitter  = /(\w*)(?: )*(.*)/;
        const KEY       = 1;
        const DATA      = 2;
        const vertices  = [];
        const normals   = [];
        const texcoords = [];
        const faces     = [];
        let line, split;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( line of lines ){
            
            // -------------------------------------------
            line = line.trim();
            if( line == '' || line.startsWith( '#' ) ) continue;

            split = splitter.exec( line );
            if( !split ) continue;

            // -------------------------------------------
            switch( split[ KEY ] ){
                case 'v'    : this._parseVec( split[ DATA ], vertices,  'Vertex',   3 ); break;
                case 'vn'   : this._parseVec( split[ DATA ], normals,   'Normal',   3 ); break;
                case 'vt'   : this._parseVec( split[ DATA ], texcoords, 'Texcoord', 2 ); break;
                case 'f'    : this._parseFace( split[ DATA ], faces ); break;
            }
        }


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Decompress the data into flat arrays
        this._unpack( faces, vertices, normals, texcoords );
        this.vertexCount   = this.vertices.length  / 3;
        this.normalCount   = this.normals.length   / 3;
        this.texcoordCount = this.texcoords.length / 2;
    }

    _parseVecXX( txt, buf, name, size ){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const ary = txt.split( ' ' );
        if( ary.length != size ){
            console.error( name, ' data not the length of', size);
            return;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let i;
        for( i of ary ) buf.push( parseFloat( i ) );
    }

    _parseVec( txt, buf, name, size ){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const ary = txt.split( ' ' );
        if( ary.length < size ){
            console.error( name, ' data not the length of', size );
            return;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( let i=0; i < size; i++ ){
            ary[ i ] = parseFloat( ary[ i ] );
        }

        buf.push( ary );
    }

    _parseFace( txt, buf ){
        // f 1 2 3              # indices for positions only
        // f 1/1 2/2 3/3        # indices for positions and texcoords
        // f 1/1/1 2/2/2 3/3/3  # indices for positions, texcoords, and normals
        // f 1//1 2//2 3//3     # indices for positions and normals
        const ary = txt.split( ' ' );
        let key, j;

        // Split the 3 or 4 points
        for( let i=0; i < ary.length; i++ ){
            // Split each sub section & parse to ints

            const idx = ary[ i ].split( '/' );
            key       = ary[ i ];   // Save original text, it can be used as a KEY to the unique vertex

            for( j=0; j < idx.length; j++ ){
                idx[ j ] = parseInt( idx[ j ] );
            }

            ary[ i ] = { key, idx };            
        }

        buf.push( ary );
    }

    // Data is compressed, so need to process the face data
    // to decompress the data into nice flat float information.
    _unpack( faces, vertices, normals, texcoords ){
        const VERT    = 0;
        const TEX     = 1;
        const NORM    = 2;
        const hasTex  = ( texcoords.length > 0 );
        const hasNorm = ( normals.length > 0 );

        let vert, face, i, vi, ti, ni;
        let map     = new Map();    // Track Unique Vertex to Unpacked Vertex Index
        let vertCnt = 0;            // Keep track of the current unique vertex index in the flat array
        let isQuad  = false         // Indicates face is a quad, not a triangle, do a lil extra work

        for( face of faces ){
            isQuad = false;

            for( i=0; i < face.length; i++ ){
                vert = face[ i ];

                // ----------------------------------------------
                // If there is a forth point, then this is a quad.
                // That means we need to define two triangles. The
                // second triangle starts at the end of the first one
                // 0-1-2 > 2-3-0
                // When the loop ends, it'll check for isQuad & will
                // grab the index of the first vert for this face.
                if( i === 3 && !isQuad ){
                    i       = 2;
                    isQuad  = true;
                }
                
                // ----------------------------------------------
                if( map.has( vert.key ) ){
                    this.indices.push( map.get( vert.key ) );
                    continue;
                }

                // ----------------------------------------------
                vi   = vert.idx[ VERT ] - 1; // Vertex Index in OBJ start at 1, need to -1 to align to js arrays starting at 0.
                ni   = vert.idx[ NORM ] - 1;
                ti   = vert.idx[ TEX ]  - 1;

                this.indices.push( vertCnt );
                this.vertices.push( ...vertices[ vi ] );
                if( hasNorm ) this.normals.push( ...normals[ ni ] );
                if( hasTex )  this.texcoords.push( ...texcoords[ ti ] );

                map.set( vert.key, vertCnt ); // Cache this Unique vertex to the actual unpackaged vertex index
                vertCnt++;
            }

            if( isQuad ){
                this.indices.push( map.get( face[ 0 ].key ) );
            }
        }
    }

    static async fetch( url ){
        const res = await fetch( url );
        if( !res.ok ) return null;

        const txt = await res.text();
        if( !txt ) return null;

        const obj = new ObjParser();
        obj.parse( txt );

        return obj;
    }
}