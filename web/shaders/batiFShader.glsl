varying vec2 vUv;
uniform sampler2D tSource;
uniform vec2 delta;
uniform vec4 bcolors[7];

vec3 getpcolor(float value){
    vec3 pseudoColor;
    // 
    if(value <= bcolors[0].a){
        pseudoColor = bcolors[0].rgb;
    }
    else if (value > bcolors[6].a){
        pseudoColor = bcolors[6].rgb;
    }
    else{
        for (int i=1; i<7; i++){
            vec4 cleft = bcolors[i-1];
            vec4 cright = bcolors[i];

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
    float bati = texval.a;

    vec3 pseudoColor = getpcolor(bati);

    gl_FragColor = vec4(pseudoColor.r, pseudoColor.g,pseudoColor.b, 1.0); 
}
