export default function ImageLoader( url ){
    return new Promise( async ( resolve, reject )=>{
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const res = await fetch( url );
        if( !res.ok ){
            reject( 'Response was not ok' );
            return;
        };

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const blob = await res.blob();
        if( !blob ){
            reject( 'Unable to download image blob' );
            return;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src         = window.URL.createObjectURL( blob );
        img.onerror     = reject;
        img.onload      = _=>resolve( img );
    });
}