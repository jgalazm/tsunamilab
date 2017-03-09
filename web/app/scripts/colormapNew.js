"use strict";

function getColormapArray(cmap,k,d){
	var colors = {
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
		'wave2': [ new THREE.Vector4(4, 29, 59,  (0.00-d)*k),
				new THREE.Vector4(8, 59, 118,  (0.01-d)*k),

				new THREE.Vector4(24, 77, 157,  (0.011-d)*k),
				new THREE.Vector4(59, 106, 204,  (0.05-d)*k),

				new THREE.Vector4(39, 32, 228,  (0.051-d)*k),
				new THREE.Vector4(113, 184, 249,  (0.10-d)*k),

				new THREE.Vector4(0, 106, 17,  (0.101-d)*k),
				new THREE.Vector4(0, 208, 0,  (0.25-d)*k),

				new THREE.Vector4(137, 130, 0,  (0.251-d)*k),
				new THREE.Vector4(254, 229, 20,  (0.50-d)*k),

				new THREE.Vector4(131, 80, 0,  (0.501-d)*k),
				new THREE.Vector4(225, 128, 16,  (0.750-d)*k),

				new THREE.Vector4(159, 19, 0,  (0.751-d)*k),
				new THREE.Vector4(249, 26, 0,  (1.000-d)*k),

				new THREE.Vector4(255, 255, 255,  (1.001-d)*k),
				new THREE.Vector4(255, 64, 196,  (2.25-d)*k)],
		'seismic': [
				new THREE.Vector4(0.000000, 0.000000, 0.300000, (0.000000-d)*k),
				new THREE.Vector4(0.000000, 0.000000, 0.486667, (0.066667-d)*k),
				new THREE.Vector4(0.000000, 0.000000, 0.673333, (0.133333-d)*k),
				new THREE.Vector4(0.000000, 0.000000, 0.860000, (0.200000-d)*k),
				new THREE.Vector4(0.066667, 0.066667, 1.000000, (0.266667-d)*k),
				new THREE.Vector4(0.333333, 0.333333, 1.000000, (0.333333-d)*k),
				new THREE.Vector4(0.600000, 0.600000, 1.000000, (0.400000-d)*k),
				new THREE.Vector4(0.866667, 0.866667, 1.000000, (0.466667-d)*k),
				new THREE.Vector4(1.000000, 0.866667, 0.866667, (0.533333-d)*k),
				new THREE.Vector4(1.000000, 0.600000, 0.600000, (0.600000-d)*k),
				new THREE.Vector4(1.000000, 0.333333, 0.333333, (0.666667-d)*k),
				new THREE.Vector4(1.000000, 0.066667, 0.066667, (0.733333-d)*k),
				new THREE.Vector4(0.900000, 0.000000, 0.000000, (0.800000-d)*k),
				new THREE.Vector4(0.766667, 0.000000, 0.000000, (0.866667-d)*k),
				new THREE.Vector4(0.633333, 0.000000, 0.000000, (0.933333-d)*k),
				new THREE.Vector4(0.500000, 0.000000, 0.000000, (1.000000-d)*k),
		],
		'inferno': [
				new THREE.Vector4(0.001462, 0.000466, 0.013866, (0.000000-d)*k),
				new THREE.Vector4(0.046915, 0.030324, 0.150164, (0.066667-d)*k),
				new THREE.Vector4(0.142378, 0.046242, 0.308553, (0.133333-d)*k),
				new THREE.Vector4(0.258234, 0.038571, 0.406485, (0.200000-d)*k),
				new THREE.Vector4(0.366529, 0.071579, 0.431994, (0.266667-d)*k),
				new THREE.Vector4(0.472328, 0.110547, 0.428334, (0.333333-d)*k),
				new THREE.Vector4(0.578304, 0.148039, 0.404411, (0.400000-d)*k),
				new THREE.Vector4(0.682656, 0.189501, 0.360757, (0.466667-d)*k),
				new THREE.Vector4(0.780517, 0.243327, 0.299523, (0.533333-d)*k),
				new THREE.Vector4(0.865006, 0.316822, 0.226055, (0.600000-d)*k),
				new THREE.Vector4(0.929644, 0.411479, 0.145367, (0.666667-d)*k),
				new THREE.Vector4(0.970919, 0.522853, 0.058367, (0.733333-d)*k),
				new THREE.Vector4(0.987622, 0.645320, 0.039886, (0.800000-d)*k),
				new THREE.Vector4(0.978806, 0.774545, 0.176037, (0.866667-d)*k),
				new THREE.Vector4(0.950018, 0.903409, 0.380271, (0.933333-d)*k),
				new THREE.Vector4(0.988362, 0.998364, 0.644924, (1.000000-d)*k)
		],
		'viridis': [
				new THREE.Vector4(0.267004, 0.004874, 0.329415, (0.000000-d)*k),
				new THREE.Vector4(0.282656, 0.100196, 0.422160, (0.066667-d)*k),
				new THREE.Vector4(0.277134, 0.185228, 0.489898, (0.133333-d)*k),
				new THREE.Vector4(0.253935, 0.265254, 0.529983, (0.200000-d)*k),
				new THREE.Vector4(0.221989, 0.339161, 0.548752, (0.266667-d)*k),
				new THREE.Vector4(0.190631, 0.407061, 0.556089, (0.333333-d)*k),
				new THREE.Vector4(0.163625, 0.471133, 0.558148, (0.400000-d)*k),
				new THREE.Vector4(0.139147, 0.533812, 0.555298, (0.466667-d)*k),
				new THREE.Vector4(0.120565, 0.596422, 0.543611, (0.533333-d)*k),
				new THREE.Vector4(0.134692, 0.658636, 0.517649, (0.600000-d)*k),
				new THREE.Vector4(0.208030, 0.718701, 0.472873, (0.666667-d)*k),
				new THREE.Vector4(0.327796, 0.773980, 0.406640, (0.733333-d)*k),
				new THREE.Vector4(0.477504, 0.821444, 0.318195, (0.800000-d)*k),
				new THREE.Vector4(0.647257, 0.858400, 0.209861, (0.866667-d)*k),
				new THREE.Vector4(0.824940, 0.884720, 0.106217, (0.933333-d)*k),
				new THREE.Vector4(0.993248, 0.906157, 0.143936, (1.000000-d)*k),
		],
		'plasma': [
				new THREE.Vector4(0.050383, 0.029803, 0.527975, (0.000000-d)*k),
				new THREE.Vector4(0.200445, 0.017902, 0.593364, (0.066667-d)*k),
				new THREE.Vector4(0.312543, 0.008239, 0.635700, (0.133333-d)*k),
				new THREE.Vector4(0.417642, 0.000564, 0.658390, (0.200000-d)*k),
				new THREE.Vector4(0.517933, 0.021563, 0.654109, (0.266667-d)*k),
				new THREE.Vector4(0.610667, 0.090204, 0.619951, (0.333333-d)*k),
				new THREE.Vector4(0.692840, 0.165141, 0.564522, (0.400000-d)*k),
				new THREE.Vector4(0.764193, 0.240396, 0.502126, (0.466667-d)*k),
				new THREE.Vector4(0.826588, 0.315714, 0.441316, (0.533333-d)*k),
				new THREE.Vector4(0.881443, 0.392529, 0.383229, (0.600000-d)*k),
				new THREE.Vector4(0.928329, 0.472975, 0.326067, (0.666667-d)*k),
				new THREE.Vector4(0.965024, 0.559118, 0.268513, (0.733333-d)*k),
				new THREE.Vector4(0.988260, 0.652325, 0.211364, (0.800000-d)*k),
				new THREE.Vector4(0.994141, 0.753137, 0.161404, (0.866667-d)*k),
				new THREE.Vector4(0.977995, 0.861432, 0.142808, (0.933333-d)*k),
				new THREE.Vector4(0.940015, 0.975158, 0.131326, (1.000000-d)*k),
		],
		'hot': [
				new THREE.Vector4(0.041600, 0.000000, 0.000000, (0.000000-d)*k),
				new THREE.Vector4(0.216612, 0.000000, 0.000000, (0.066667-d)*k),
				new THREE.Vector4(0.391625, 0.000000, 0.000000, (0.133333-d)*k),
				new THREE.Vector4(0.566637, 0.000000, 0.000000, (0.200000-d)*k),
				new THREE.Vector4(0.741649, 0.000000, 0.000000, (0.266667-d)*k),
				new THREE.Vector4(0.916662, 0.000000, 0.000000, (0.333333-d)*k),
				new THREE.Vector4(1.000000, 0.091667, 0.000000, (0.400000-d)*k),
				new THREE.Vector4(1.000000, 0.266667, 0.000000, (0.466667-d)*k),
				new THREE.Vector4(1.000000, 0.441667, 0.000000, (0.533333-d)*k),
				new THREE.Vector4(1.000000, 0.616667, 0.000000, (0.600000-d)*k),
				new THREE.Vector4(1.000000, 0.791666, 0.000000, (0.666667-d)*k),
				new THREE.Vector4(1.000000, 0.966666, 0.000000, (0.733333-d)*k),
				new THREE.Vector4(1.000000, 1.000000, 0.212499, (0.800000-d)*k),
				new THREE.Vector4(1.000000, 1.000000, 0.474999, (0.866667-d)*k),
				new THREE.Vector4(1.000000, 1.000000, 0.737500, (0.933333-d)*k),
				new THREE.Vector4(1.000000, 1.000000, 1.000000, (1.000000-d)*k),
		],
		'bwr': [
				new THREE.Vector4(0.000000, 0.000000, 1.000000, (0.000000-d)*k),
				new THREE.Vector4(0.133333, 0.133333, 1.000000, (0.066667-d)*k),
				new THREE.Vector4(0.266667, 0.266667, 1.000000, (0.133333-d)*k),
				new THREE.Vector4(0.400000, 0.400000, 1.000000, (0.200000-d)*k),
				new THREE.Vector4(0.533333, 0.533333, 1.000000, (0.266667-d)*k),
				new THREE.Vector4(0.666667, 0.666667, 1.000000, (0.333333-d)*k),
				new THREE.Vector4(0.800000, 0.800000, 1.000000, (0.400000-d)*k),
				new THREE.Vector4(0.933333, 0.933333, 1.000000, (0.466667-d)*k),
				new THREE.Vector4(1.000000, 0.933333, 0.933333, (0.533333-d)*k),
				new THREE.Vector4(1.000000, 0.800000, 0.800000, (0.600000-d)*k),
				new THREE.Vector4(1.000000, 0.666667, 0.666667, (0.666667-d)*k),
				new THREE.Vector4(1.000000, 0.533333, 0.533333, (0.733333-d)*k),
				new THREE.Vector4(1.000000, 0.400000, 0.400000, (0.800000-d)*k),
				new THREE.Vector4(1.000000, 0.266667, 0.266667, (0.866667-d)*k),
				new THREE.Vector4(1.000000, 0.133333, 0.133333, (0.933333-d)*k),
				new THREE.Vector4(1.000000, 0.000000, 0.000000, (1.000000-d)*k),
		]





			};
	for (var i=0;i<16;i++){
		colors['wave'][i].x = colors['wave'][i].x/255;
		colors['wave'][i].y = colors['wave'][i].y/255;
		colors['wave'][i].z = colors['wave'][i].z/255;
		colors['wave2'][i].x = colors['wave2'][i].x/255;
		colors['wave2'][i].y = colors['wave2'][i].y/255;
		colors['wave2'][i].z = colors['wave2'][i].z/255;
	}


	return colors[cmap];
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
	return c;
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

function colorbar(cmap3js, labelMap, canvas){
	/*cmap3js: list of THREE.Vector4 containing rgb colors
			and cuts in  the alpha channel
	  canvas: where to plot the colorbar, now horizontal only
	  fstart: fraction (in (0,1]) from where to start in the colorbar range
	  labels: list of labels and cuts to put on the colorbar

	*/
	var istart = 0;
	//number of color segments

	var n = 16;

	var ctx = canvas.getContext('2d');

	//colorbar canvas siz
	canvas.width = 100;
	canvas.height = 400;
	var L = canvas.width;
	var W = canvas.height-30;

	//cmap3js
	for(var i = istart; i < W; i++) {
 		// curent fraction in the canvas
		var t = i/W;

		//color segment index for this t
		var k = parseInt(t*n);
		for(var j = 0; j < n-1; j++) {
			if(labelMap[j+1][1] > t){
				k = j;
				break;
			}
		}
		//re-scale to color range
		var vk0 = cmap3js[k].w;
		if(k==n-1){
			var vkf = vk0;
		}else{
			var vkf = cmap3js[k+1].w;		
		}
		// var s = n*t-k;
		var s = (t-labelMap[k][1])/(labelMap[k+1][1]-labelMap[k][1]);
		var v = vk0*(1-s) + vkf*s;

		//get pseudo color for this value
		var pcolor = getpcolor(v,cmap3js,n);


		//build color string
		var color = 'rgb('+pcolor[0]+', '+pcolor[1]+', '+pcolor[2]+ ')';

		// set color
		ctx.fillStyle = color;

 		//draw a rectangle for this color
	    ctx.beginPath();
	    //5% offset in both sides
    	ctx.fillRect(0,
					 W-W*((i)/W)+15,
					 L*0.4,
					 L/30);
	}


	//write labels
	var fontSize = L*0.12;
	ctx.font = "bold " + fontSize + "pt Verdana";//better exact px based on % of canvas.height?
	ctx.fillStyle ="#fff";
	ctx.textAlign = "right";
	ctx.lineWidth = 4;
	for (var i=0; i<labelMap.length;i++){
		var display = labelMap[i][0];
		var position = labelMap[i][1];
		if(!display)
			continue;
		var labelText,labelPosX,labelPosY;
		var labelText  = cmap3js[i].w.toFixed(2).toString();
		var labelPosX = 90.0;
		if(i == labelMap.length-1){
			labelText = labelText + '+';
			labelPosX += 9;
		}
		var labelPosY = W-((i)/labelMap.length*W*1)+15;
		var newLabelPosY = W-(position*W*1)+15;
		labelPosY = newLabelPosY;

		ctx.fillText(labelText, labelPosX, labelPosY+10);
		//draw a tick line
	    ctx.beginPath();
	    ctx.strokeStyle = "white";
		
	    labelPosY = labelPosY + 4;
	    ctx.moveTo(L/3*1.4,labelPosY);
	    ctx.lineTo(L/3,labelPosY);
		
	    ctx.stroke();
	}
}
