
import Canvas               from "./Canvas.js";
import { CanvasTexture }    from "../thirdparty/three.module.js";

class DrawTexture{
    constructor( elmId, width=256, height=256 ){
        this.canvas         = document.getElementById( elmId );
        this.draw           = new Canvas( this.canvas, width, height ).fill_color( "#ffffff" ).fill( "#ff0000" );
        this.tex            = new CanvasTexture( this.canvas );
        this.tex.flipY      = false; // Depending on the texture, dont flip it
        this.brushSize      = 3;
        this.activeColor    = '#ff0000';

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // EVENTS
        this.pointerMove    = this.onPointerMove.bind( this );
        this.pointerUp      = this.onPointerUp.bind( this );
        this.canvas.addEventListener( "pointerdown", this.onPointerDown.bind( this ) );
    }

    setColor( c ){
        this.draw.fill( c );
        this.activeColor = c;
    }

    atPos( x, y ){
        this.draw.circle( x, y, this.brushSize );
        this.tex.needsUpdate = true;
    }

    atUV( u, v ){
        const x = this.draw.width   * u;
        //const y = this.draw.height  * (1 - v); // Invert y
        const y = this.draw.height  * v; // Invert y
        this.atPos( x, y );
    }

    clear(){
        this.draw
            .fill_color( "#ffffff" )    // Set all pixels to white
            .fill( this.activeColor );  // Reset color back to the selected color
        this.tex.needsUpdate = true;    // Texture needs to be uploaded
    }

    save(){
        this.draw.download();
    }

    onPointerDown( e ){
        this.canvas.addEventListener( "pointermove", this.pointerMove );
        this.canvas.addEventListener( "pointerup",   this.pointerUp );
    }

    onPointerMove( e ){
        const x = e.layerX;
        const y = e.layerY;
        this.atPos( x, y );
    }

    onPointerUp( e ){
        this.canvas.removeEventListener( "pointermove", this.pointerMove );
        this.canvas.removeEventListener( "pointerup",   this.pointerUp );
    }
}

export default DrawTexture;