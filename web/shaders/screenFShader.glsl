varying vec2 vUv;
uniform sampler2D tSource;
uniform vec2 delta;
uniform vec4 colors[7];

vec3 getpcolor(float value){
    vec3 pseudoColor;
    // 
    if(value <= colors[0].a){
        pseudoColor = colors[0].rgb;
    }
    else if (value > colors[6].a){
        pseudoColor = colors[6].rgb;
    }
    else{
        for (int i=1; i<7; i++){
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
    gl_FragColor = vec4(pseudoColor.r, pseudoColor.g,pseudoColor.b,pow(value,0.5)); 
}
