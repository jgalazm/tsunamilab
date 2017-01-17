varying vec2 vUv;
uniform sampler2D tSource;
uniform vec2 delta;
uniform vec4 colormap[7];

void main()
{

    float value = texture2D(tSource, vUv).r;
    // float value = vUv.x*10.0;
    //int step = int(floor(value));
    //float a = fract(value);
    float t;
    vec3 pseudoColor;
	// 
    if(value <= colormap[0].a){
        pseudoColor = colormap[0].rgb;
    }
    else if (value > colormap[6].a){
    	pseudoColor = colormap[6].rgb;
    }
    else{
    	for (int i=1; i<7; i++){
			vec4 cleft = colormap[i-1];
			vec4 cright = colormap[i];

			if (value>cleft.a && value <=cright.a){
				t = (value - cleft.a)/(cright.a - cleft.a);
				pseudoColor = mix(cleft.rgb, cright.rgb, t);
				break;
			}
		}			
	}

    gl_FragColor = vec4(pseudoColor.r, pseudoColor.g,pseudoColor.b, 1.0); 
}
