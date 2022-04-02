import Starter, { THREE }   from "./lib/Starter.js";
import DrawTexture			from "./lib/DrawTexture.js";
import FboPixel 			from "./lib/FboPixel.js";
import Canvas               from "./lib/Canvas.js";

const ARROW_ROT_OFFSET = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1,0,0 ), 90 * Math.PI / 180 );

export class Editor{
    constructor( app ){
        this.app        = app;
        this.drawTex	= new DrawTexture( "txPreview" );
        this.fboPixel	= new FboPixel( app.renderer, this.getTexture() );

        this.bRender        = this.render.bind( this );
        this.bPointerDown   = this.onPointerDown.bind( this );
        this.bPointerMove   = this.onPointerMove.bind( this );
        this.bPointerUp     = this.onPointerUp.bind( this );


        this.addEvent( "pointerdown", this.bPointerDown );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Post Rendering
        this.scene      = new THREE.Scene();
        this.camera     = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
        /**/
        this.scene.add(
            new THREE.Mesh(
                new THREE.PlaneGeometry( 2, 2 ),
                new THREE.RawShaderMaterial({
                    vertexShader    : POST_VERTSRC,
                    fragmentShader  : POST_FRAGSRC,
                    uniforms        : {
                        tColor  : { value: this.fboPixel.target.texture[ 0 ] },
                        tNorm   : { value: this.fboPixel.target.texture[ 1 ] },
                        tUv     : { value: this.fboPixel.target.texture[ 2 ] },
                        tDepth  : { value: this.fboPixel.target.depthTexture },
                    },
                })
            )
        );
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Render Things Over Post Rendering
        this.arrow          = new THREE.ArrowHelper( 
            new THREE.Vector3(0,0,1),   // Arrow Mesh actually points down.
            new THREE.Vector3(0,0,0),
            1, 0x00ffff
        );
        this.arrow.visible = false;

        this.afterScene = new THREE.Scene();
        this.afterScene.add( this.arrow );
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.setupUI();
    }

    setupUI(){
        document.getElementById( 'iBrushSize' ).addEventListener( 'input', e=>{ this.drawTex.brushSize = e.detail; });
        document.getElementById( 'iBrushColor' ).addEventListener( 'input', e=>this.drawTex.setColor( e.detail ) );
        document.getElementById( 'iDLTex' ).addEventListener( 'input', _=>this.drawTex.save() );
        document.getElementById( 'iClear' ).addEventListener( 'input', _=>{ 
            if( confirm( 'Are you sure you want to clear the texture?' ) ){
                this.drawTex.clear();
            }
        });
    }
    
    addEvent( evtName, fn ){ this.app.renderer.domElement.addEventListener( evtName, fn ); }
    removeEvent( evtName, fn ){ this.app.renderer.domElement.removeEventListener( evtName, fn ); }

    getTexture(){ return this.drawTex.tex; }
    getDrawShader(){ return this.fboPixel.shader; }

    getEPos( e ){
        const canvas = this.app.renderer.domElement;
        return [
            e.clientX,
            canvas.clientHeight - 1 - e.clientY, // Invert Y
        ];
    }

    pointArrow( px ){
        this.arrow.position.fromArray( px.pos );
        this.arrow.quaternion.setFromUnitVectors( new THREE.Vector3(0,0,1), new THREE.Vector3().fromArray( px.norm ) );
        this.arrow.quaternion.multiply( ARROW_ROT_OFFSET );
    }

    onPointerDown( e ){
        e.stopPropagation(); e.preventDefault();

        const pos   = this.getEPos( e );
        const px    = this.fboPixel.getData( pos[0], pos[1] );

        if( px ){
            this.app.orbit.enabled      = false;
            this.app.orbit.enableRotate = false;

            this.drawTex.atUV( px.uv[0], px.uv[1] );

            this.addEvent( "pointermove", this.bPointerMove );
            this.addEvent( "pointerup", this.bPointerUp );

            this.pointArrow( px );
            this.arrow.visible = true;
        }else{
            this.arrow.visible = false;
        }

        return false;
    }

    onPointerMove( e ){
        const pos   = this.getEPos( e );
        const px    = this.fboPixel.getData( pos[0], pos[1] );
        if( px ){
            this.drawTex.atUV( px.uv[0], px.uv[1] );
            this.pointArrow( px );
        }
    }

    onPointerUp( e ){
        this.removeEvent( "pointermove", this.bPointerMove );
        this.removeEvent( "pointerup", this.bPointerUp );

        this.app.orbit.enabled      = true;
        this.app.orbit.enableRotate = true;
        this.arrow.visible          = false;
    }

    render(){
        requestAnimationFrame( this.bRender );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.app.renderer.setRenderTarget( this.fboPixel.target );
        this.app.renderer.render( this.app.scene, this.app.camera );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.app.renderer.setRenderTarget( null );
        this.app.renderer.render( this.scene, this.camera );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //let gl = this.app.renderer.getContext();
        //gl.disable( gl.DEPTH_TEST );
        this.app.renderer.autoClearColor = false;   // Dont clear Frame !!
        this.app.renderer.render( this.afterScene, this.app.camera );
        this.app.renderer.autoClearColor = true;    // Reenable clearing
        //gl.enable( gl.DEPTH_TEST );
    }

    previewUVMap( geo ){
        const ind   = geo.index.array;
        const uv    = geo.attributes.uv.array;
        const w     = 256; 
        const h     = 256;
        const size  = new THREE.Vector2( w, h );
        const can   = new Canvas( "txUV", w, h ).line_width( 1 ).stroke( "#bbbbbb" );
    
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
        let a = new THREE.Vector2(), 
            b = new THREE.Vector2(), 
            c = new THREE.Vector2();
    
        for( let i=0; i < ind.length; i+=3 ){
            a.fromArray( uv, ind[  i  ] * 2 ).multiply( size );
            b.fromArray( uv, ind[ i+1 ] * 2 ).multiply( size );
            c.fromArray( uv, ind[ i+2 ] * 2 ).multiply( size );
    
            can.line( a.x, a.y, b.x, b.y );
            can.line( b.x, b.y, c.x, c.y );
            can.line( c.x, c.y, a.x, a.y );
        }
    }
}


const POST_VERTSRC = `#version 300 es
in vec3 position;
in vec2 uv;

out vec2 vUv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    vUv         = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

const POST_FRAGSRC = `#version 300 es
precision highp float;
precision highp int;
layout(location = 0) out vec4 pc_FragColor;
in vec2 vUv;

uniform sampler2D tColor;
uniform sampler2D tNorm;
uniform sampler2D tUv;
uniform sampler2D tDepth;

void main(){
    vec3 diffuse        = texture( tColor, vUv ).rgb;
    vec3 normal         = texture( tNorm, vUv ).rgb;
    vec3 uv             = texture( tUv, vUv ).rgb;
    float depth         = texture( tDepth, vUv ).r;

    pc_FragColor.rgb    = mix( diffuse, normal, step( 0.5, vUv.x ) );
    pc_FragColor.a      = 1.0;

    pc_FragColor.rgb    = diffuse;
    //pc_FragColor.rgb    = normal;
    //pc_FragColor.rgb    = uv;
    //pc_FragColor.rgb    = vec3( depth );
}
`;
