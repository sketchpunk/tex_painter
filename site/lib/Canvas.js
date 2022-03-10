class Canvas{
	constructor( elm, w = null, h = null ){
		this.canvas		= ( typeof elm == "string" )? document.getElementById( elm ) : elm;
		this.ctx		= this.canvas.getContext("2d");
		this.offsetX	= 0;
		this.offsetY	= 0;
		this.clearX		= 0;
		this.clearY		= 0;

		this._font_family	= "sans-serif";
		this._font_size		= 20;
		this._font_style 	= "";	// normal | italic | oblique | 
		this._font_variant 	= "";	// normal | small-caps
		this._font_weight	= ""; 	// normal | bold | bolder | lighter | 100 to 900

		if( w && h ) 	this.size( w, h );
		else 			this.size( window.innerWidth, window.innerHeight );
	}

	// #region Mouse
	/*
	let x = e.clientX - gNC.mouseOffsetX + window.pageXOffset,
		y = e.clientY - gNC.mouseOffsetY + window.pageYOffset,
	*/
	mouse_on( onDown=null, onMove=null, onUp=null ){
		if(onDown){
			this.canvas.addEventListener("mousedown", (e)=>{
				e.preventDefault(); e.stopPropagation();
				onDown(e, e.clientX - this.offsetX, e.clientY - this.offsetY);
			});
		}
		if(onMove){
			this.canvas.addEventListener("mousemove", (e)=>{
				e.preventDefault(); e.stopPropagation();
				onMove(e, e.clientX - this.offsetX, e.clientY - this.offsetY);
			});
		}
		
		if(onUp){
			this.canvas.addEventListener("mouseup", (e)=>{
				e.preventDefault(); e.stopPropagation();
				onUp(e, e.clientX - this.offsetX, e.clientY - this.offsetY);
			});
		}
		return this;
	}

	on_mouse_up( fn ){
		this.canvas.addEventListener("mouseup", (e)=>{
			e.preventDefault(); e.stopPropagation();
			fn(e, e.clientX - this.offsetX, e.clientY - this.offsetY);
		});
	}
	// #endregion //////////////////////////////////////////////////////////////////

	// #region Coord System

	center(){
		this.ctx.translate(this.width * 0.5, this.height * 0.5);
		this.clearX = -this.width * 0.5;
		this.clearY = -this.height * 0.5;
		return this;
	}

	flip_y(){ this.ctx.scale(1,-1); return this; }

	bottom_left(){
		this.ctx.translate( 0, this.height );
		this.ctx.scale( 1, -1 );
		this.clearX = 0;
		this.clearY = 0;
		return this;
	}

	// #endregion //////////////////////////////////////////////////////////////////
	
	// #region Style

	fill(v){ this.ctx.fillStyle = v; return this; }
	stroke(v){ this.ctx.strokeStyle = v; return this; }
	both(v){ this.ctx.strokeStyle = v; this.ctx.fillStyle = v; return this; }

	style( cFill = "#ffffff", cStroke = "#505050", lWidth = 3 ){
		if(cFill != null) 	this.ctx.fillStyle		= cFill;
		if(cStroke != null) this.ctx.strokeStyle	= cStroke;
		if(lWidth != null) 	this.ctx.lineWidth		= lWidth;
		return this;
	}

	//++++++++++++++++++++++++++++++

	font(font = "12px verdana", textAlign="left"){
		if(font)		this.ctx.font		= font;
		if(textAlign)	this.ctx.textAlign	= textAlign;
		return this;
	}

	font_align( align=null, base=null ){ 
		if( align )	this.ctx.textAlign		= align;
		if( base ) 	this.ctx.textBaseLine	= base;
		return this;
	}
	font_family( v ){ this._font_family = v; return this.font_apply(); }
	font_size( v ){ this._font_size = v; return this.font_apply(); }
	font_weight( v ){ this._font_weight = v; return this.font_apply(); }
	font_apply(){
		this.ctx.font = 
			this._font_style + " " + 
			this._font_variant + " " +
			this._font_weight + " " + 
			this._font_size + "px " +
			this._font_family;
		return this;
	}

	//++++++++++++++++++++++++++++++

	shadow( color=null, size=null, offset_x=null, offset_y=null ){
		if( size )	this.ctx.shadowBlur		= size;
		if( color )	this.ctx.shadowColor 	= color;
		
		if( offset_x != null ) this.ctx.shadowOffsetX = offset_x;
		if( offset_y != null ) this.ctx.shadowOffsetY = offset_y;
		return this;
	}

	unshadow(){
		this.ctx.shadowBlur	= 0;
		this.ctx.shadowColor = "transparent";
		return this;
	}

	//++++++++++++++++++++++++++++++

	dash(){ this.ctx.setLineDash( [4,5] ); return this; }
	undash(){ this.ctx.setLineDash( [0] ); return this; }

	line_width(v){ this.ctx.lineWidth = v; return this; }

	line_dash( ary = null, lineWidth = null ){ 
		if(!ary) ary = [0];
		this.ctx.setLineDash(ary);

		if(lineWidth != null) this.ctx.lineWidth = lineWidth;
		return this;
	}

	join_round(){	this.ctx.lineJoin	= "round"; return this; }
	join_bevel(){	this.ctx.lineJoin 	= "bevel"; return this; }
	join_miter(){	this.ctx.lineJoin	= "miter"; return this; } //default
	cap_butt(){		this.ctx.lineCap	= "butt"; return this; }
	cap_round(){	this.ctx.lineCap	= "round"; return this; }
	cap_square(){	this.ctx.lineCap	= "square"; return this; }

	//++++++++++++++++++++++++++++++

	/*
	https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
	https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
	createRadialGradient()
	gradient=context.createLinearGradient(0,padding,0,padding+height);
	gradient.addColorStop(0, "transparent");
	gradient.addColorStop(0.5, "transparent");
	gradient.addColorStop(0.5, tertiaryColor);
	gradient.addColorStop(1, secondaryColor);
	*/

	// #endregion //////////////////////////////////////////////////////////////////

	// #region Misc
		
	fill_color(c){ return this.fill(c).rect( this.clearX, this.clearY, this.width, this.height, 1 ); }
	clear(){ this.ctx.clearRect(this.clearX, this.clearY, this.width, this.height); return this; }

	restore_transform(){ this.ctx.restore(); return this; }
	save_transform( vpos = null, ang = null, vscale = null ){
		this.ctx.save();
		if(vpos)		this.ctx.translate( vpos[0], vpos[1] );
		if(ang != null)	this.ctx.rotate( ang );
		if(vscale)		this.ctx.scale( vscale[0], vscale[1] );
		return this;
	}

	/** Test text width */
	get_text_width( txt ){ 
		/* CHROME SUPPORTS THIS ONLY BEHIND A FLAG, FIREFOX WILL SUPPORT IT AT SOME POINT
		let metrics = ctx.measureText(text);
		let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
		let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent; */
		return this.ctx.measureText( txt ).width;
	}

	//Set the size of the canvas html element and the rendering view port
	size( w = 500, h = 500 ){
		var box				= this.canvas.getBoundingClientRect();
		this.offsetX		= box.left;	//Help get X,Y in relation to the canvas position.
		this.offsetY		= box.top;
		//TODO, might need to replace offset with mouseOffset
		this.mouseOffsetX	= this.canvas.scrollLeft + this.canvas.offsetLeft; 	//box.left;	// Help get X,Y in relation to the canvas position.
		this.mouseOffsetY	= this.canvas.scrollTop + this.canvas.offsetTop; 	//box.top;

		//set the size of the canvas, on chrome we need to set it 3 ways to make it work perfectly.
		this.canvas.style.width		= w + "px";
		this.canvas.style.height	= h + "px";
		this.canvas.width			= w;
		this.canvas.height			= h;
		this.width 					= w;
		this.height 				= h;

		/* FIXES BLURRYNESS ON HIGHER DPI SCREENS.
		let dpi					= window.devicePixelRatio  * 2.0; // Times to kinda helps
		this.elm.width			= w * dpi;
		this.elm.height			= h * dpi;
		this.elm.style.width	= w + "px";
		this.elm.style.height	= h + "px";
		this.width				= w;
		this.height				= h;
		this.ctx.scale( dpi, dpi );
		*/

		return this;
	}

	// #endregion //////////////////////////////////////////////////////////////////

	// #region Drawing
		
	draw( d ){
		if( (d & 1) != 0 ) this.ctx.fill();
		if( (d & 2) != 0 ) this.ctx.stroke();
	}

	//++++++++++++++++++++++++++++++

	text( txt, x=0, y=0, draw=1 ){ 
		//this.ctx.font = "Bold 30px Arial";
		if( (draw & 1) != 0 ) this.ctx.fillText( txt, x, y );
		if( (draw & 2) != 0 ) this.ctx.strokeText( txt, x, y );
		return this;
	}

	text_center( txt, yOffset=0, draw=1 ){
		let tw = this.ctx.measureText( txt ).width,
			th = this.ctx.measureText( "M" ).width, //this.fontSize,
			cw = this.ctx.canvas.width,
			ch = this.ctx.canvas.height;

		this.text( txt, (cw - tw) * 0.5, th + yOffset, draw );
		return this;
	}

	//++++++++++++++++++++++++++++++

	circle( x, y, radius = 10, draw = 1 ){
		const p2 = Math.PI * 2;
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius ,0, p2, false );
		this.draw( draw );
		return this;
	}

	circle_vec( v, radius = 10, draw = 1 ){
		const p2 = Math.PI * 2;
		this.ctx.beginPath();
		this.ctx.arc( v[0], v[1], radius ,0, p2, false );
		this.draw( draw );
		return this;
	}

	circle_vec_ary( draw, radius, v ){
		const p2 = Math.PI * 2;
		for(var i=1; i < arguments.length; i++){
			this.ctx.beginPath();
			this.ctx.arc( arguments[i][0], arguments[i][1], radius ,0, p2, false );
			this.draw( draw );
		}

		return this;
	}

	ellipse_vec( v, xRadius = 5, yRadius = 10, draw = 2 ){
		const p2 = Math.PI * 2;
		this.ctx.beginPath();
		this.ctx.ellipse(v[0], v[1], xRadius, yRadius , 0, p2, false);
		this.draw( draw );
		return this;
	}

	ellipse( cx, cy, x_radius = 5, y_radius = 10, draw = 2 ){
		const p2 = Math.PI * 2;
		this.ctx.beginPath();
		this.ctx.ellipse( cx, cy, x_radius, y_radius , 0, p2, false);
		this.draw( draw );
		return this;
	}

	//++++++++++++++++++++++++++++++

	rect( x=0, y=0, w=0, h=0, draw = 2 ){
		if(!w) w = this.width;
		if(!h) h = this.height;

		this.ctx.beginPath();
		this.ctx.rect(x, y, w, h);
		this.draw( draw );
		return this;
	}

	rect_pnts( min, max, draw = 2 ){
		this.ctx.beginPath();
		this.ctx.rect( min[0], min[1], max[0]-min[0], max[1]-min[1] );
		this.draw( draw );
		return this;
	}

	rect_round( x, y, w, h, r=0, draw = 1 ){
		this.ctx.beginPath();

		this.ctx.moveTo( x+r, y );
		this.ctx.lineTo( x+w-r, y );
		this.ctx.quadraticCurveTo( x+w, y, x+w, y+r );

		this.ctx.lineTo( x+w, y+h-r );
		this.ctx.quadraticCurveTo( x+w, y+h, x+w-r, y+h );

		this.ctx.lineTo( x+r, y+h );
		this.ctx.quadraticCurveTo( x, y+h, x, y+h-r );

		this.ctx.lineTo( x, y+r );
		this.ctx.quadraticCurveTo( x, y, x+r, y );

		this.ctx.closePath();
		
		this.draw( draw );
		return this;
	}

	rect_border( pad, r, draw = 1 ){
		let x = pad,
			y = pad,
			w = this.ctx.canvas.width - pad * 2,
			h = this.ctx.canvas.height - pad * 2;
		this.rect_round( x, y, w, h, r, draw );
		return this;
	}

	//++++++++++++++++++++++++++++++

	line( x0, y0, x1, y1 ){
		this.ctx.beginPath();
		this.ctx.moveTo( x0, y0 );
		this.ctx.lineTo( x1, y1 );
		this.ctx.stroke();
		return this;
	}

	line_vec( p0, p1 ){
		this.ctx.beginPath();
		this.ctx.moveTo( p0[0], p0[1] );
		this.ctx.lineTo( p1[0], p1[1] );
		this.ctx.stroke();
		return this;
	}

	line_vec_to( p0, p1 ){
		this.ctx.beginPath();
		this.ctx.moveTo( p0[0], p0[1] );
		this.ctx.lineTo( p0[0] + p1[0], p0[1] + p1[1] );
		this.ctx.stroke();
		return this;
	}

	line_vec_ary( draw, p0, p1 ){
		this.ctx.beginPath();
		this.ctx.moveTo( p0[0], p0[1] );

		for(let i=2; i < arguments.length; i++)
			this.ctx.lineTo( arguments[i][0], arguments[i][1] );

		this.draw( draw );
		return this;
	}

	line_vec_flat_ary( draw, ary, close_loop=false ){
		this.ctx.beginPath();
		this.ctx.moveTo( ary[0], ary[1] );

		for(let i=2; i < ary.length; i+=2)
			this.ctx.lineTo( ary[i], ary[i+1] );

		if( close_loop ) this.ctx.lineTo( ary[0], ary[1] );

		this.draw( draw );
		return this;
	}

	//++++++++++++++++++++++++++++++

	tri_vec( wh, hh, offsetX = 0, offsetY = 0, draw=1 ){
		this.ctx.beginPath();
		this.ctx.moveTo(offsetX,		offsetY + hh );
		this.ctx.lineTo(offsetX - wh,	offsetY - hh );
		this.ctx.lineTo(offsetX + wh,	offsetY - hh );
		this.draw( draw );
		return this;
	}

	//++++++++++++++++++++++++++++++
	
	arrow( from, to, head_len=10 ){
		let dx		= to[0] - from[0],
			dy		= to[1] - from[1],
			angle	= Math.atan2(dy, dx),
			inc 	= Math.PI / 6;

		this.ctx.beginPath();
		this.ctx.moveTo( from[0], from[1] );
		this.ctx.lineTo( to[0], to[1]);
		this.ctx.lineTo( 
			to[0] - head_len * Math.cos( angle - inc ), 
			to[1] - head_len * Math.sin( angle - inc )
		);
		this.ctx.moveTo( to[0], to[1]);
		this.ctx.lineTo( 
			to[0] - head_len * Math.cos( angle + inc ), 
			to[1] - head_len * Math.sin( angle + inc )
		);
		this.ctx.stroke();
	}

	// #endregion //////////////////////////////////////////////////////////////////

	// #region Pixel Drawing

	prepare_px_drawing(){
		this.imageData	= this.ctx.getImageData( 0, 0, this.width, this.height );	// Get Image Data object
		this.aryRGBA	= this.imageData.data;										// Then its raw RGBA Array
		return this;
	}

	update_px(){ this.ctx.putImageData( this.imageData, 0, 0 ); return this; }

	set_px( x, y, r, g, b, a=255 ){
		var idx = ( y * this.width + x ) * 4; // RowStart Plus Col Times RGBA component count
		this.aryRGBA[idx]	= r;
		this.aryRGBA[idx+1]	= g;
		this.aryRGBA[idx+2]	= b;
		this.aryRGBA[idx+3]	= a;
		return this;
	}

	set_px_clr( x, y, hex ){
		var bigint	= parseInt( hex, 16 ),
			r 		= (bigint >> 16) & 255,
			g		= (bigint >> 8) & 255,
			b		= bigint & 255;

		var idx = ( y * this.width + x ) * 4; // RowStart Plus Col Times RGBA component count
		this.aryRGBA[idx]	= r;
		this.aryRGBA[idx+1]	= g;
		this.aryRGBA[idx+2]	= b;
		this.aryRGBA[idx+3]	= 255;
		return this;
	}

	// http://iquilezles.org/www/articles/palettes/palettes.htm
	// vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ){
	// return a + b*cos( 6.28318*(c*t+d) );
	set_palette( x, y, t, a, b, c, d ){
		var idx = (y*this.width + x) * 4; //RowStart Plus Col Times RGBA component count
		this.aryRGBA[ idx ]		= ( a[0] + b[0] * Math.cos( 6.28318 * ( c[0] * t + d[0]) ) ) * 255;
		this.aryRGBA[ idx+1 ]	= ( a[1] + b[1] * Math.cos( 6.28318 * ( c[1] * t + d[1]) ) ) * 255;
		this.aryRGBA[ idx+2 ]	= ( a[2] + b[2] * Math.cos( 6.28318 * ( c[2] * t + d[2]) ) ) * 255;
		this.aryRGBA[ idx+3 ]	= 255;
	}

	get_px( x, y ){
		var idx = ( y * this.width + x ) * 4;
		return [
			this.aryRGBA[ idx ],
			this.aryRGBA[ idx+1 ],
			this.aryRGBA[ idx+2 ],
			this.aryRGBA[ idx+3 ]
		];
	}

	download(){
		//Force it to download, instead of view by changing the mime time.
		var uri = this.canvas.toDataURL().replace("image/png","image/octet-stream");
		//window.location.href = uri;
		console.log(uri);
		return this;
	}

	// #endregion //////////////////////////////////////////////////////////////////
}

export default Canvas;