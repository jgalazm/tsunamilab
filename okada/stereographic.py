import numpy as np
def stereographic_projection(latin,lonin,lat0,lon0):
    """
        Gives the stereographic projection of points (lat,lon) 
        onto the plane tangent to the Earth's ellipsoid in (lat0,lon0)
        Input:
            latin,lonin : coordinates of points in degrees (array)
            lat0,lon0: coordinates of tangency point in degrees (float)
    """
    pole = np.pi/2.0 - 1e-5
    rad_deg = np.pi/180
    
    lat = latin*rad_deg
    lon = lonin*rad_deg
    lt0 = lat0*rad_deg
    ln0 = lon0*rad_deg

    lat = np.where(lat>pole,pole,lat)
    lat = np.where(lat<-pole,-pole,lat)
    # lon = np.where(lat>pole,pole,lat)
    # lon = np.where(lat<pole,pole,lat)
    # if lat>pole : lat=pole
    # if lat<-pole: lat=-pole
    if lt0>pole: lt0 = pole
    if lt0<-pole: lt0 = -pole
    CS = np.cos(lat)
    SN = np.sin(lat)
    CS0 = np.cos(lt0)
    SN0 = np.sin(lt0)
    xf = 0.0 #falsee easting
    yf = 0.0 #false northing

    A = 6378137.0000            # ELLIPSOIDAL SEMI-MAJOR AXIS
    B = 6356752.3142            # ELLIPSOIDAL SEMI-MINOR AXIS
    F = 0.00335281067183      # FLATTENING, F = (A-B)/A
    E = 0.08181919092891        # ECCENTRICITY, E = SQRT(2.0*F-F**2)
    F2 = 0.00669438000426        # F2 = E**2
    ES = 0.00673949675659        # 2ND ECCENTRICITY, ES = E**2/(1-E**2)

    K0 = 0.9996                # SCALE FACTOR

    TMP = np.sqrt(1.0-F2*SN**2)
    TMP0 = np.sqrt(1.0-F2*SN0**2)
    RHO0 = A*(1.0-F2)/TMP0**3
    NU0 = A/TMP0
    R = np.sqrt(RHO0*NU0)
    N = np.sqrt(1.0+F2*CS0**4/(1.0-F2))

    S1 = (1.0+SN0)/(1.0-SN0)
    S2 = (1.0-E*SN0)/(1.0+E*SN0)
    W1 = (S1*S2**E)**N
    SN_XI0 = (W1-1.0)/(W1+1.0)
    C = (N+SN0)*(1.0-SN_XI0)/(N-SN0)/(1.0+SN_XI0)

    W2 = C*W1
    SA = (1.0+SN)/(1.0-SN)
    SB = (1.0-E*SN)/(1.0+E*SN)
    W = C*(SA*SB**E)**N


    XI0 = np.arcsin((W2-1.0)/(W2+1.0))
    LM0 = ln0

    LM = N*(lon-LM0)+LM0
    XI = np.arcsin((W-1.0)/(W+1.0))

    BETA = 1.0 + np.sin(XI)* np.sin(XI0) + np.cos(XI)*np.cos(XI0)*np.cos(LM-LM0)

    Y = yf + 2.0*R*K0*(np.sin(XI)*np.cos(XI0) \
                     - np.cos(XI)*np.sin(XI0)*np.cos(LM-LM0))/BETA
    X = xf + 2.0*R*K0*np.cos(XI)*np.sin(LM-LM0)/BETA
    return X,Y