varying vec2 vUv;
uniform sampler2D tSource;
uniform vec2 delta;

uniform float rad_min;
uniform float rad_deg;
uniform float gx;
uniform float dx;
uniform float dy;
uniform float RR;
uniform float RS;
uniform float g;
uniform float xmin;
uniform float xmax;
uniform float ymin;
uniform float ymax;
uniform float zmin;
uniform float zmax;

float peridicBoundaries(vec4 u_ij, vec4 u_ijm, vec4 u_imj,
	float h_ij, float h_ijm){
		/*
			I keep this in case the other one does not work
			I need a real proof that these "open" boundary
			conditions are good...
		*/
	float eta = 0.0;

	//j=0
	float k = 1.0;
	if (vUv.y>=1.0-k*delta.y){
		eta = 0.0;
	}
	if (vUv.y <=k*delta.y){
		if (vUv.x > k*delta.x && vUv.x <=1.0-k*delta.x){
			if (h_ij>gx){
				float cc = sqrt(g*h_ij);
				float uh = 0.5*(u_ij.g+u_imj.g);
				float uu = sqrt(uh*uh+ u_ij.b*u_ij.b);
				float zz = uu/cc;
				if (u_ij.b>0.0){
					zz = -zz;
				}
				eta = zz;
			}
			else {
				eta = 0.0;
			}
		}
	}

	return eta;
}

float openBoundaries(vec4 u_ij, vec4 u_ijm, vec4 u_imj,
	float h_ij, float h_ijm){

	float eta = 0.0;

	//j=0
	if (vUv.y <=delta.y){
			if (h_ij>gx){
				float cc = sqrt(g*h_ij);
				float uh = 0.5*(u_ij.g+u_imj.g);
				float uu = sqrt(uh*uh+ u_ij.b*u_ij.b);
				float zz = uu/cc;
				if (u_ij.b>0.0){
					zz = -zz;
				}
				eta = zz;
			}
			else {
				eta = 0.0;
			}
	}
		//j=ny
	else if (vUv.y>=1.0-delta.y) {
			if (h_ij>gx){
				float cc = sqrt(g*h_ij);
				float uh = 0.5*(u_ij.g+u_imj.g);
				float uu = sqrt(uh*uh + u_ijm.b*u_ijm.b);
				float zz = uu/cc;
				if (u_ijm.b<0.0){
					zz = -zz;
				}
				eta = zz;
			}
			else {
				eta = 0.0;
			}
	}
	return eta;
}

vec3 getR1R11R6(float V){
	// V = vertical coordinate in [0,1];
	float ymesh = ymin + (ymax-ymin)*V;
	float angM = ymesh*rad_deg;
	float cosM = cos(angM);
	float sinM = sin(angM);
	float R1  = RR/(cosM*dx*rad_min);
	float R11 = RR/(cosM*dy*rad_min);
	float R6 = cos((ymesh+0.5*dy/60.0)*rad_deg);
	vec3 r1r11r6 = vec3(R1,R11,R6);
	return r1r11r6;
}

vec2 getR2R4(float V, float hp, float hq){
	float ymesh = ymin + (ymax-ymin)*V;
	float angM = ymesh*rad_deg;
	float cosM = cos(angM);

	float R2 = RS*max(hp,0.0)/(cosM*dx*rad_min);
	float R4 = RS*max(hq,0.0)/(cosM*dy*rad_min);

	vec2 r2r4 = vec2(R2,R4);
	return r2r4;
}

float massEquation(vec2 vUv, float h_ij, vec4 u_ij, vec4 u_imj, vec4 u_ijm){
	float eta2_ij = 0.0;
	//mass equation for ij
	if (h_ij >gx){
		vec3 RRRij = getR1R11R6(vUv.y);
		float  R1ij = RRRij.x;
		float R11ij = RRRij.g;
		float R6ij = RRRij.b;

		vec3 RRRijm = getR1R11R6(vUv.y-delta.y);
		float  R1ijm = RRRijm.r;
		float R11ijm = RRRijm.g;
		float R6ijm = RRRijm.b;

		eta2_ij = u_ij.r -R1ij*(u_ij.g-u_imj.g) - R11ij*(R6ij*u_ij.b - R6ijm*u_ijm.b);
	}
	return eta2_ij;
}

float myMod(float x){
	return x - floor(x);
}

vec2 mod1x(float x, float y){
	return vec2(myMod(x), y);
}

void main()
{
	// u = (eta, p, q, h)
	// eta: free surface
	// p: x-momentum
	// q: y-momentum
	// h: water depth, >0 if wet, <0 if dry.
	//
	// old vals
	vec4 u_ij = texture2D(tSource,vUv);

	//neighbors old vals
	vec4 u_imj = texture2D(tSource, mod1x(vUv.x - delta.x, vUv.y));
	vec4 u_ipj = texture2D(tSource, mod1x(vUv.x + delta.x, vUv.y));
	vec4 u_ijm = texture2D(tSource, mod1x(vUv.x + 0.0, vUv.y -delta.y));
	vec4 u_ijp = texture2D(tSource, mod1x(vUv.x + 0.0, vUv.y + delta.y));

	vec4 u_ipjm = texture2D(tSource, mod1x(vUv.x + delta.x,  vUv.y - delta.y));
	vec4 u_imjp = texture2D(tSource, mod1x(vUv.x + -delta.x, vUv.y + delta.y));


	//new vals
	vec4 u2_ij, u2_ipj, u2_ijp;

	//bati depth vals
	float h_ij = -(u_ij.a*(zmax-zmin)+zmin);
	float h_ipj = -(u_ipj.a*(zmax-zmin)+zmin);
	float h_ijp = -(u_ijp.a*(zmax-zmin)+zmin);
	float h_ijm = -(u_ijm.a*(zmax-zmin)+zmin);

	// solve mass equation in three points
	// this is needed for the momentum equation
	// (blame the leapfrog scheme)

	//mass equation for ij
	u2_ij.r = massEquation(vUv, h_ij, u_ij, u_imj, u_ijm);

	// mass equation for i+1,j
	u2_ipj.r = massEquation(vUv+vec2(delta.x,0.0), h_ipj, u_ipj, u_ij, u_ipjm);

  //mas equation for  i,j+1
	u2_ijp.r = massEquation(vUv+vec2(0.0,delta.x), h_ijp, u_ijp, u_imjp, u_ij);

	//handle boundaries (Open)
	if (vUv.y <=delta.y || vUv.y>1.0-delta.y){
		u2_ij.r = openBoundaries(u_ij, 	u_ijm, u_imj, h_ij, h_ijm);
		// u2_ij.r = periodicBoundary(u_ij, u_ijm, u_imj, h_ij, h_ijm);
	}

	float hpij = 0.5*(h_ij+h_ipj);
	float hqij = 0.5*(h_ij+h_ijp);
	vec2 RRij = getR2R4(vUv.y, h_ipj, h_ijp);
	float R2ij = RRij.r;
	float R4ij = RRij.g;

	// x -momentum
	if (vUv.y<1.0-delta.y && vUv.y>delta.y){
		if ((h_ij>gx) && (h_ipj>gx)){
			u2_ij.g = u_ij.g - R2ij*(u2_ipj.r-u2_ij.r);
		}
		else{
			u2_ij.g = 0.0;
		}
	}

	// y - momentum
	if (vUv.y<1.0-delta.y  && vUv.y>delta.y){
		if ( (h_ij>gx) && (h_ijp>gx)){
			u2_ij.b = u_ij.b - R4ij*(u2_ijp.r-u2_ij.r);
		}
		else{
			u2_ij.b = 0.0;
		}
	}

	u2_ij.a = u_ij.a;

	//sometimes .. it just blows up
	if (abs(u2_ij.r)>50.0){
		u2_ij.r = 0.0;
		u2_ij.g = 0.0;
		u2_ij.b = 0.0;
	}

	gl_FragColor = vec4(u2_ij);
}
