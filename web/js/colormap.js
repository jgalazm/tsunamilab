function getColormapArray(cmap,k,d){
	colors = {
		'heat': [new THREE.Vector4(1, 1, 1, (-1-d)*k), //white
				new THREE.Vector4(0, 1, 1, (-6.6-d)*k),  //cyan
				new THREE.Vector4(0, 0, 1, (-3.3-d)*k),  //blue
				new THREE.Vector4(0, 0, 0, 0.0),   //red
				new THREE.Vector4(1, 0, 0, (3.3-d)*k),   //yellow
				new THREE.Vector4(1, 1, 0, (6.6-d)*k),	  //red
				new THREE.Vector4(1, 1, 1, (6.6-d)*k), //red
				new THREE.Vector4(1, 1, 1, (6.6-d)*k), //red
				new THREE.Vector4(1, 1, 1, (6.6-d)*k), //red
				new THREE.Vector4(1, 1, 1, (6.6-d)*k), //red
				new THREE.Vector4(1, 1, 1, (6.6-d)*k), //red
				new THREE.Vector4(1, 1, 1, (6.6-d)*k), //red
				new THREE.Vector4(1, 1, 1, (6.6-d)*k), //red
				new THREE.Vector4(1, 1, 1, (6.6-d)*k), //red
				new THREE.Vector4(1, 1, 1, (6.6-d)*k), //red
				new THREE.Vector4(1, 1, 1, (9.9-d)*k)], //white
		'jet': [new THREE.Vector4(0, 0, 1, 0.0*2), //azul
				new THREE.Vector4(0, 1, 1, (0.33-d)*k),  //cyan
				new THREE.Vector4(0, 1, 0, (0.5-d)*k),  //verde
				new THREE.Vector4(1, 1, 0, (0.66-d)*k),   //amarillo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),   //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),	  //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),	  //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),	  //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),	  //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),	  //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),	  //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),	  //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),	  //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),	  //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k),	  //rojo
				new THREE.Vector4(1, 0, 0, (1.0-d)*k)],
		'blues': [new THREE.Vector4(0, 0, 0.3, (0.0-d)*k),    //azul
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, (1.0-d)*k)],
		'batitopo': [new THREE.Vector4(0, 0, 0.3, 0.0),    //azul
				new THREE.Vector4(0.5, 0.5, 0.5, d),  //blanco
				new THREE.Vector4(0.0, 0.5, 0.0, d*1.01),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0)],  //blanco,				
	      // Add getColormapArrays
	     'wave': [ new THREE.Vector4(4, 29, 59,  (0.006-d)*k),
				new THREE.Vector4(8, 59, 118,  (0.120-d)*k),
				new THREE.Vector4(24, 77, 157,  (0.130-d)*k),
				new THREE.Vector4(59, 106, 204,  (0.250-d)*k),
				new THREE.Vector4(39, 32, 228,  (0.260-d)*k),
				new THREE.Vector4(113, 184, 249,  (0.380-d)*k),
				new THREE.Vector4(0, 106, 17,  (0.390-d)*k),
				new THREE.Vector4(0, 208, 0,  (0.500-d)*k),
				new THREE.Vector4(137, 130, 0,  (0.510-d)*k),
				new THREE.Vector4(254, 229, 20,  (0.620-d)*k),
				new THREE.Vector4(131, 80, 0,  (0.630-d)*k),
				new THREE.Vector4(225, 128, 16,  (0.750-d)*k),
				new THREE.Vector4(159, 19, 0,  (0.760-d)*k),
				new THREE.Vector4(249, 26, 0,  (0.870-d)*k),
				new THREE.Vector4(255, 255, 255,  (0.880-d)*k),
				new THREE.Vector4(255, 64, 196,  (1.000-d)*k)],
		'seismic': [ new THREE.Vector4(0, 0, 0.4, (-1.0-d)*k),
				new THREE.Vector4(1.0, 1.0, 1.0, (0.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.01-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
				new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k)]};
	for (var i=0;i<16;i++){
		colors['wave'][i].x = colors['wave'][i].x/255;
		colors['wave'][i].y = colors['wave'][i].y/255;
		colors['wave'][i].z = colors['wave'][i].z/255;
	}


	return colors[cmap];
}

function getColormapLabels(cmap,k,d){
	label_colors = {
		'batitopo': [[mUniforms.zmin.value,0.0],
					[0.0, d], 
					[ mUniforms.zmax.value, 1.0]],
		'wave':  [[(0.006-d)*k,(0.006-d)*k],
				 [(0.250-d)*k,(0.250-d)*k],
				 [(0.500-d)*k,(0.500-d)*k],
				 [(0.750-d)*k,(0.750-d)*k],
				 [(1.000-d)*k,(1.000-d)*k]]
	};

	return label_colors[cmap];
}

function mix(cleft,cright,t){
	//cleft,cright: THREE.Vector4
	//t: float
	//c: Array[3]
	var c = [0,0,0];
	c[0] = t*cleft.x +(1-t)*cright.x;
	c[1] = t*cleft.y +(1-t)*cright.y;
	c[2] = t*cleft.z +(1-t)*cright.z;
	c[0] = parseInt(c[0]*255);
	c[1] = parseInt(c[1]*255);
	c[2] = parseInt(c[2]*255);
	return c
}
function getpcolor(value, colors, ncolors){
	//float value
	//THREE.Vector4 colors
	//int ncolors
	//returns 1x3 array with values in [0,1]

    var pseudoColor;
    // 
    if(value <= colors[0].w){
        pseudoColor = [colors[0].x, colors[0].y, colors[0].z];
    }
    else if (value > colors[ncolors-1].w){
        pseudoColor = [colors[ncolors-1].x, colors[ncolors-1].y, colors[ncolors-1].z];
    }
    else{
        for (var i=1; i<ncolors; i++){
            var cleft = colors[i-1];
            var cright = colors[i];

            if (value>cleft.w && value <=cright.w){
                var t = 1-(value - cleft.w)/(cright.w - cleft.w);
                pseudoColor = mix(cleft, cright, t);
                break;
            }
        }           
    }
    return pseudoColor;
}

function colorbar(cmap3js, canvas, ncolors, fstart, labels){
	/*cmap3js: list of THREE.Vector4 containing rgb colors 
			and cuts in  the alpha channel
	  canvas: where to plot the colorbar, now horizontal only
	  ncolors: length of the cmap3js list
	  fstart: fraction (in (0,1]) from where to start in the colorbar range
	  labels: list of labels and cuts to put on the colorbar
	
	*/
	if (typeof(fstart)=="undefined"){
		istart = 0;
	}
	else{
		istart = parseInt(canvas.width * fstart);
	}
	var ctx = canvas.getContext('2d');
	//cmap3js
	for(var i = istart; i <= canvas.width; i++) {
		var t = i/canvas.width; //normalize [0,1]
		t = cmap3js[0].w+(cmap3js[ncolors-1].w - cmap3js[0].w)*t; //normalize to cmap
	    ctx.beginPath();
	    var pcolor = getpcolor(t,cmap3js,16);
	    var color = 'rgb('+pcolor[0]+', '+pcolor[1]+', '+pcolor[2]+ ')';
	    ctx.fillStyle = color;		    
	    if (typeof(fstart)=="undefined"){
	    	ctx.fillRect((i-istart)*0.9+0.05*canvas.width,0 , 
	    		canvas.width*0.95, canvas.height/2);	
	    }
	    else{
	    	ctx.fillRect((i-istart)*0.9+0.05*canvas.width,0 , 
	    		canvas.width*0.95, canvas.height/2);
	    }
	    
	}

	for (var i=0; i<labels.length;i++){
		if (labels[i][1]>=fstart){
			ctx.font = "10pt Arial";//better exact px based on % of canvas.height?
			ctx.fillStyle ="#aaaaaa";
			ctx.textAlign = "left";

			ctx.fillText(labels[i][0].toFixed(2),
					(labels[i][1]-fstart)*canvas.width*0.9+0.05,
					canvas.height*0.7);
		}
		
	}



	canvas.onclick = function(e) {
	    var x = e.offsetX,
	        y = e.offsetY,
	        p = ctx.getImageData(x, y, 1, 1),
	        x = p.data;
	    
	    alert('Color: rgb(' + x[0] + ', ' + x[1] + ', ' + x[2] + ')');
	};
}