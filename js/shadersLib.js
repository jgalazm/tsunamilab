var shadersCode = function(){
    var vertexShaderText = `
varying vec2 vUv;
void main()
{	
	vUv = uv;
	gl_Position = projectionMatrix* modelViewMatrix*vec4(position,1.0);
}
    `;

    var initialFragmentShaderText = `
varying vec2 vUv;
// uniform sampler2D tSource;
uniform vec2 delta;
uniform vec4 colormap[7];
void main()
{

    float value = vUv.x;//texture2D(tSource, vUv).r;

    gl_FragColor = vec4((1.0-value)*colormap[6].a, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4((1.0-value), 0.0, 0.0, 1.0);
}
    `;

    var modelFragmentShaderText = `
varying vec2 vUv;
uniform sampler2D tSource;
uniform vec2 delta;
// uniform vec2 texel;

void main()
{
	//neighbors values
	float u_ij = texture2D(tSource, vUv).r;
	float u_imj = texture2D(tSource, vUv+vec2(-1.0*delta.x,0.0)).r;
	float u_ipj = texture2D(tSource, vUv+vec2(delta.x,0.0)).r;
	float u_ijm = texture2D(tSource, vUv+vec2(0.0,-1.0*delta.y)).r;
	float u_ijp = texture2D(tSource, vUv+vec2(0.0,delta.y)).r;
	float dt = 0.2*delta.x*delta.x;


	//boundaries
	if (vUv.x <=delta.x || vUv.x>=1.0-delta.x ||
		vUv.y<=delta.y || vUv.y>=1.0-delta.y){
		gl_FragColor = vec4(0.0,0.0,0.0,1.0);
		return;
	}

	//interior: u^{n+1}
	float u_np = u_ij;
	u_np += dt/(delta.x*delta.x)*(u_imj+u_ipj-2.0*u_ij);
	u_np += dt/(delta.x*delta.x)*(u_ijm+u_ijp-2.0*u_ij);

	gl_FragColor = vec4(u_np,0.0,0.0,1.0);
	// gl_FragColor = vec4(delta.x*10.0, 0.0, 0.0, 1.0);

}
    `;

    var screenFragmentShaderText = `
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
    `;

    var shadersCode = {
            vshader: vertexShaderText,
            iFshader: initialFragmentShaderText,
            mFshader: modelFragmentShaderText,
            sFshader: screenFragmentShaderText
        };
    return shadersCode;
}