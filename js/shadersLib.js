var shadersCode = function (name) {
	var tsunamiVertexShaderText = `
varying vec2 vUv;
void main()
{
	vUv = uv;
	gl_Position = projectionMatrix* modelViewMatrix*vec4(position,1.0);
}
    `;

	var tsunamiInitialFragmentShaderText = `
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



	// Stereographic projection function

	vec2 stereographic_projection(float latin, float lonin,
									float lat0, float lon0){
	    /*
	        Gives the stereographic projection of points (lat,lon)
	        onto the plane tangent to the Earth's ellipsoid in (lat0,lon0)
	        Input:
	            latin,lonin : coordinates of points in degrees (array)
	            lat0,lon0: coordinates of tangency point in degrees (float)
	    */
	    float pi = 3.141592653589793 ;
	    float pole = pi/2.0 - 1e-5;
	    float rad_deg = pi/180.0;

	    float lat = latin*rad_deg;
	    float lon = lonin*rad_deg;
	    float lt0 = lat0*rad_deg;
	    float ln0 = lon0*rad_deg;

	    lat = max(-pole,min(pole,lat));
	    lt0 = max(-pole,min(pole,lt0));
	    float CS = cos(lat);
	    float SN = sin(lat);
	    float CS0 = cos(lt0);
	    float SN0 = sin(lt0);
	    float xf = 0.0; //false easting
	    float yf = 0.0; //false northing

	    float A = 6378137.0000;            //ELLIPSOIDAL SEMI-MAJOR AXIS
	    float B = 6356752.3142;            //ELLIPSOIDAL SEMI-MINOR AXIS
	    float F = 0.00335281067183;      // FLATTENING, F = (A-B)/A
	    float E = 0.08181919092891;        // ECCENTRICITY, E = SQRT(2.0*F-F**2)
	    float F2 = 0.00669438000426;        // F2 = E**2
	    float ES = 0.00673949675659;        // 2ND ECCENTRICITY, ES = E**2/(1-E**2)

	    float K0 = 0.9996;                // SCALE FACTOR

	    float TMP = sqrt(1.0-F2*SN*SN);
	    float TMP0 = sqrt(1.0-F2*SN0*SN0);
	    float RHO0 = A*(1.0-F2)/(TMP0*TMP0*TMP0);
	    float NU0 = A/TMP0;
	    float R = sqrt(RHO0*NU0);
	    float N = sqrt(1.0+F2*CS0*CS0*CS0*CS0/(1.0-F2));

	    float S1 = (1.0+SN0)/(1.0-SN0);
	    float S2 = (1.0-E*SN0)/(1.0+E*SN0);
	    float W1 = pow((S1*pow(S2,E)),N);
	    float SN_XI0 = (W1-1.0)/(W1+1.0);
	    float C = (N+SN0)*(1.0-SN_XI0)/(N-SN0)/(1.0+SN_XI0);

	    float W2 = C*W1;
	    float SA = (1.0+SN)/(1.0-SN);
	    float SB = (1.0-E*SN)/(1.0+E*SN);
	    float W = pow(C*(SA*pow(SB,E)),N);


	    float XI0 = asin((W2-1.0)/(W2+1.0));
	    float LM0 = ln0;

	    float LM = N*(lon-LM0)+LM0;
	    float XI = asin((W-1.0)/(W+1.0));

	    float BETA = 1.0 + sin(XI)* sin(XI0) + cos(XI)*cos(XI0)*cos(LM-LM0);

	    float Y = yf + 2.0*R*K0*(sin(XI)*cos(XI0)
	                     - cos(XI)*sin(XI0)*cos(LM-LM0))/BETA;
	    float X = xf + 2.0*R*K0*cos(XI)*sin(LM-LM0)/BETA;

	    vec2 XY = vec2(X,Y);
	    return XY;
	}

	// float L = 450000.0;
	// float W = 150000.0;
	// float depth = 30100.0;
	// float slip = 6.06;
	// float strike = 18.0;
	// float dip = 18.0;
	// float rake = 112.0;
	// float U3 = 0.0;
	// float cn = -35.5;
	// float ce = -73.0;

	void main()
	{

		float n = ymin + vUv.y*(ymax-ymin);
		float e = xmin + vUv.x*(xmax-xmin);

		vec2 pos = stereographic_projection(n,e,cn,ce);

		float value = 0.0;
		value  = okada(pos.g,pos.r,depth,strike,dip,L,W,rake,slip,U3);

		float bati = texture2D(tBati, vUv).r;
		float bati_real = zmin + bati*(zmax-zmin);

		// value = value*step(0.0,-bati_real);

		gl_FragColor = vec4(value,0.0,0.0,bati);
		// gl_FragColor = vec4(vUv.x*2.0-1.0,0.0,0.0,bati);

	}
    `;

	var tsunamiModelFragmentShaderText = `
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

	gl_FragColor = vec4(u_ij,0.0,0.0,1.0);
	// gl_FragColor = vec4(delta.x*10.0, 0.0, 0.0, 1.0);

}
    `;

	var tsunamiScreenFragmentShaderText = `
varying vec2 vUv;
uniform sampler2D tSource;
uniform vec2 delta;
const int nColors = 16;
uniform vec4 colormap[nColors];

uniform float zmin;
uniform float zmax;

vec3 getpcolor(float value){
    vec3 pseudoColor;
    //
    if(value <= colormap[0].a){
        pseudoColor = colormap[0].rgb;
    }
    else if (value > colormap[nColors-1].a){
        pseudoColor = colormap[nColors-1].rgb;
    }
    else{
        for (int i=1; i<nColors; i++){
            vec4 cleft = colormap[i-1];
            vec4 cright = colormap[i];

            if (value>cleft.a && value <=cright.a){
                float t = (value - cleft.a)/(cright.a - cleft.a);
                pseudoColor = mix(cleft.rgb, cright.rgb, t);
                break;
            }
        }
    }

	// return value*vec3(0.0,0.0,1.0);
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
    // gl_FragColor = vec4(0.0, value,0.0,1.0);
}
    `;


	var tsunamiShadersCode = {
		vshader: tsunamiVertexShaderText,
		iFshader: tsunamiInitialFragmentShaderText,
		mFshader: tsunamiModelFragmentShaderText,
		sFshader: tsunamiScreenFragmentShaderText
	};


	var shaders = {
		'tsunami': tsunamiShadersCode
	}

	var getShader = function(name){
		return shaders[name];
	}
	return getShader(name);
}
