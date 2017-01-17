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
