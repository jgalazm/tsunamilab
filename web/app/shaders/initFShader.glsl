varying vec2 vUv;
uniform sampler2D tSource;
uniform sampler2D tBati;
uniform vec2 delta;
uniform vec4 colors[7];

uniform float xmin;
uniform float xmax;
uniform float ymin;
uniform float ymax;
uniform float zmin;
uniform float zmax;

uniform float L;
uniform float W;
uniform float depth;
uniform float slip;
uniform float strike;
uniform float dip;
uniform float rake;
uniform float U3;
uniform float cn;
uniform float ce;

float I4(float db, float eta, float q, float dip, float nu, float R){
	float I = 0.0;
	if (cos(dip)>1e-24){
		I = (1.0-2.0*nu)*1.0/cos(dip)*(log(R+db)-sin(dip)*log(R+eta));
	}
	else{
		I = -(1.0-2.0*nu)*q/(R+db);
	}
	return I;

}

float I5(float xi, float eta, float q, float dip, 
	float nu, float R, float db){
	float x = sqrt(xi*xi+q*q);
	float I = 0.0;
	if (cos(dip)>1e-24){
		I = (1.0-2.0*nu)*2.0/cos(dip)*
			atan(eta*(x+q*cos(dip)) + x*(R+x)*sin(dip) )
				/(xi*(R+x)*cos(dip));
	}
	else{
		I = (-1.0-2.0*nu)*xi*sin(dip)/(R+db);
	}
	return I;
}

float uz_ss(float xi, float eta, float q, float dip, float nu){
	float R = sqrt(xi*xi+eta*eta+q*q);
	float db = eta*sin(dip) - q*cos(dip);
	float u = db*q/(R*(R+eta)) 
			+ q*sin(dip)/(R+eta) 
			+ I4(db,eta,q,dip,nu,R)*sin(dip);
	return u;
}


float uz_ds(float xi, float eta, float q, float dip, float nu){
	float R = sqrt(xi*xi+eta*eta+q*q);
	float db = eta*sin(dip) - q*cos(dip);
	float u = db*q/(R*(R+xi))
		- I5(xi,eta,q,dip,nu,R,db)*sin(dip)*cos(dip);
	if (q!=0.0){
		u = u + sin(dip)*atan(xi*eta/(q*R));
	}
	return u;
}

float uz_tf(float xi, float eta, float q, float dip, float nu){
	float R = sqrt(xi*xi+eta*eta+q*q);
	float db = eta*sin(dip) - q*cos(dip);
	float u = (eta*cos(dip)+q*sin(dip))*q/(R*(R+xi))
			+ cos(dip)*xi*q/(R*(R+eta))
			- I5(xi,eta,q,dip,nu,R,db)*sin(dip)*sin(dip);
	if (q!=0.0){
		u = u - cos(dip)*atan(xi*eta/(q*R));
	}
	return u;
}

//finally
float okada(float n, float e, float depth, float strike, float dip, float L, 
			float W, float rake, float slip, float U3){
	float nu = 0.25;
	float pi = 3.14159265359;
	strike = strike*pi/180.0;
	dip = dip*pi/180.0;
	rake = rake*pi/180.0;

	float U1 = cos(rake)*slip;
	float U2 = sin(rake)*slip;

	float d = depth + sin(dip)*W/2.0;
	float ec = e + cos(strike)*cos(dip)*W/2.0;
	float nc = n - sin(strike)*cos(dip)*W/2.0;
	float x = cos(strike)*nc + sin(strike)*ec +L/2.0;
	float y = sin(strike)*nc - cos(strike)*ec + cos(dip)*W;

	float p = y*cos(dip) + d*sin(dip);
	float q = y*sin(dip) - d*cos(dip);

	float F1 = uz_ss(x  ,p  ,q,dip,nu);
	float F2 = uz_ss(x  ,p-W,q,dip,nu);
	float F3 = uz_ss(x-L,p  ,q,dip,nu);
	float F4 = uz_ss(x-L,p-W,q,dip,nu);
	float F = F1-F2-F3+F4;

	float G1 = uz_ds(x  ,p  ,q,dip,nu);
	float G2 = uz_ds(x  ,p-W,q,dip,nu);
	float G3 = uz_ds(x-L,p  ,q,dip,nu);
	float G4 = uz_ds(x-L,p-W,q,dip,nu);
	float G = G1-G2-G3+G4;

	float H1 = uz_tf(x  ,p  ,q,dip,nu);
	float H2 = uz_tf(x  ,p-W,q,dip,nu);
	float H3 = uz_tf(x-L,p  ,q,dip,nu);
	float H4 = uz_tf(x-L,p-W,q,dip,nu);
	float H = H1-H2-H3+H4;	


	float uz = -U1/(2.0*pi)*F - U2/(2.0*pi)*G + U3/(2.0*pi)*H;
	return uz;
}



void main()
{

	float n = ymin + vUv.y*(ymax-ymin);
	float e = xmin + vUv.x*(xmax-xmin);

	float value  = okada(n-cn,e-ce,depth,strike,dip,L,W,rake,slip,U3);
	float bati = texture2D(tBati, vUv).r;
	float bati_real = zmin + bati*(zmax-zmin);

	value = value*step(0.0,-bati_real);	
	
    gl_FragColor = vec4(value, 0.0, 0.0, bati); 

}
