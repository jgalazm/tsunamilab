varying vec2 vUv;
uniform float t;
void main()
{
	float L = 1.0;
	float T = 120.0;
	float l = length(vUv-vec2(0.5,0.5))/0.5+t/T;
	// float l = vUv.x+t/T;
	float u_ij = cos(l*3.14*2.0*L)*sin(l*3.14*2.0*L)/2.0+0.5;
	// u_ij = step(0.0,u_ij-0.5);
	gl_FragColor = vec4(u_ij,1.0-u_ij,0.0,0.1);
}
