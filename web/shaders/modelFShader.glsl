varying vec2 vUv;
uniform sampler2D tSource;
uniform vec2 delta;
uniform vec2 texel;

uniform float gx;
uniform float rx;
uniform float ry;
uniform float g;
uniform float xmin;
uniform float xmax;
uniform float ymin;
uniform float ymax;
uniform float zmin;
uniform float zmax;

void main()
{
	// u = (eta, p, q, h)
	// eta: free surface
	// p: x-momentum
	// q: y-momentum
	// h: water depth, >0 if wet, <0 if dry.
	

	// simulation(x,h,eta,p,q,rx,ry,dx,dy,cfl,nt,gx)
	//neighbors values

	//previous step values
	vec4 u_ij = texture2D(tSource,vUv);
	vec4 u_imj = texture2D(tSource, vUv+vec2(-1.0*delta.x,0.0));
	vec4 u_ipj = texture2D(tSource, vUv+vec2(delta.x,0.0));
	vec4 u_ijm = texture2D(tSource, vUv+vec2(0.0,-1.0*delta.y));
	vec4 u_ijp = texture2D(tSource, vUv+vec2(0.0,delta.y));

	vec4 u_ipjm = texture2D(tSource, vUv+vec2(delta.x,-1.0*delta.y));
	vec4 u_imjp = texture2D(tSource, vUv+vec2(-1.0*delta.x,delta.y));
	

	// vec4 u_ij = texture2D(tSource,vUv);
	// vec4 u_imj = texture2D(tSource, vUv+vec2(0.0,-1.0*delta.x));
	// vec4 u_ipj = texture2D(tSource, vUv+vec2(0.0,delta.x));
	// vec4 u_ijm = texture2D(tSource, vUv+vec2(-1.0*delta.y),0.0);
	// vec4 u_ijp = texture2D(tSource, vUv+vec2(delta.y),0.0);

	// vec4 u_ipjm = texture2D(tSource, vUv+vec2(-1.0*delta.y,delta.x));
	// vec4 u_imjp = texture2D(tSource, vUv+vec2(delta.y,-1.0*delta.x));
	//next step vals
	vec4 u2_ij, u2_ipj, u2_ijp;

	float h_ij = -(u_ij.a*(zmax-zmin)+zmin);
	float h_ipj = -(u_ipj.a*(zmax-zmin)+zmin);
	float h_ijp = -(u_ijp.a*(zmax-zmin)+zmin);

	//mass equation
	if (h_ij >gx){
		u2_ij.r = u_ij.r -rx*(u_ij.g-u_imj.g) - ry*(u_ij.b - u_ijm.b);
	}
	else{
		u2_ij.r = 0.0;
	}

	if (h_ipj >gx){

		u2_ipj.r = u_ipj.r -rx*(u_ipj.g-u_ij.g)-ry*(u_ipj.b - u_ipjm.b);
	}
	else{
		u2_ipj.r = 0.0;
	}

	if (h_ijp >gx){
		
		u2_ijp.r = u_ijp.r -rx*(u_ijp.g - u_imjp.g) -ry*(u_ijp.b - u_ij.b);
	}
	else{
		u2_ijp.r = 0.0;
	}

	// x -momentum
	if ((h_ij>gx) && (h_ipj>gx)){
		float hM = 0.5*(h_ij+h_ipj) + 0.5*(u2_ij.r+u2_ipj.r);
		u2_ij.g = u_ij.g - g*rx*hM*(u2_ipj.r-u2_ij.r);
	}
	else{
		u2_ij.g = 0.0;
	}			

	// y - momentum
	if ( (h_ij>gx) && (h_ijp>gx)){
		float hN = 0.5*(h_ij + h_ijp) + 0.5*(u2_ij.r+u2_ijp.r);
		u2_ij.b = u_ij.b - g*ry*hN*(u2_ijp.r-u2_ij.r);
	}
	else{
		u2_ij.b = 0.0;
	}


	u2_ij.a = u_ij.a;

	// //boundaries
	// if (vUv.x <=delta.x){
	// 	gl_FragColor = vec4(0.0,0.0,0.0,1.0);
	// 	return;
	// }
	// else if (vUv.x >=1.0-delta.x){
	// 	gl_FragColor = vec4(0.0,0.0,0.0,1.0);
	// 	return;
	// }

	// if (vUv.y <=delta.y){
	// 	gl_FragColor = vec4(0.0,0.0,0.0,1.0);
	// 	return;
	// }
	// else if (vUv.y>=1.0-delta.y) {
	// 	gl_FragColor = vec4(0.0,0.0,0.0,1.0);
	// 	return;
	// }
	// if (vUv.x <=delta.x){
	// 	gl_FragColor= vec4(u_ipj,0.0,0.0,1.0);
	// 	return;
	// }
	// else if (vUv.x >=1.0-delta.x){
	// 	gl_FragColor= vec4(u_imj,0.0,0.0,1.0);
	// 	return;
	// }

	// if (vUv.y <=delta.y){
	// 	gl_FragColor= vec4(u_ijp,0.0,0.0,1.0);
	// 	return;
	// }
	// else if (vUv.y>=1.0-delta.y) {
	// 	gl_FragColor= vec4(u_ijm,0.0,0.0,1.0);
	// 	return;
	// }	

	// //interior: u^{n+1}
	// float u_np = u_ij;
	// u_np += dt/(delta.x*delta.x)*(u_imj+u_ipj-2.0*u_ij);
	// u_np += dt/(delta.x*delta.x)*(u_ijm+u_ijp-2.0*u_ij);

	gl_FragColor = vec4(u2_ij);
	// gl_FragColor = vec4(u_ipj.a,0.0,0.0,u_ij.a);
}