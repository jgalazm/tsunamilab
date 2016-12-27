varying vec2 vUv;
uniform sampler2D tSource;
uniform vec2 delta;
uniform vec4 colors[16];

uniform float zmin;
uniform float zmax;

vec3 getpcolor(float value){
    vec3 pseudoColor;
    //
    if(value <= colors[0].a){
        pseudoColor = colors[0].rgb;
    }
    else if (value > colors[15].a){
        pseudoColor = colors[15].rgb;
    }
    else{
        for (int i=1; i<16; i++){
            vec4 cleft = colors[i-1];
            vec4 cright = colors[i];

            if (value>cleft.a && value <=cright.a){
                float t = (value - cleft.a)/(cright.a - cleft.a);
                pseudoColor = mix(cleft.rgb, cright.rgb, t);
                break;
            }
        }
    }
    return pseudoColor;
}


void main()
{

    vec4 texval = texture2D(tSource, vUv);
    float value = texval.r;
    vec3 pseudoColor = getpcolor(value);

    // gl_FragColor = vec4(pseudoColor.r, pseudoColor.g,pseudoColor.b, value*0.7+0.3);

    float bati = texval.a;
    float bati_real = zmin + (zmax-zmin)*bati;

    float corrected_color =  pow(value,0.2);
    if (bati_real>0.0){
        corrected_color = 0.0;
    }
    else{
        float t = 0.4;
        corrected_color = t*corrected_color+1.0-t;
    }
    gl_FragColor = vec4(pseudoColor.r, pseudoColor.g,pseudoColor.b,corrected_color);
}
