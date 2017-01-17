import numpy as np
def chinnery(f,x,p,L,W,q,dip,nu):
    u = f(x,p,q,dip,nu) \
    - f(x,p-W,q,dip,nu) \
    - f(x-L,p,q,dip,nu) \
    + f(x-L,p-W,q,dip,nu)
    return u
def I4(db,eta,q,dip,nu,R):
    I = 0.0*eta
    if (np.cos(dip)>np.finfo(1.0).eps):
        I = (1.-2*nu)*1./np.cos(dip)*(np.log(R+db)-np.sin(dip)*np.log(R+eta))
    else:
        I = -(1.-2.*nu)*q/(R+db)
    return I
def I5(xi,eta,q,dip,nu,R,db):
    X = np.sqrt(xi**2+q**2)
    I = 0.0*xi
    if np.cos(dip)>np.finfo(1.0).eps:
        I = (1-2.*nu)*2./np.cos(dip) \
                    *np.arctan( (eta*(X+q*np.cos(dip)) + X*(R+X)*np.sin(dip)  ) \
                    /(xi*(R+X)*np.cos(dip)))
        I = np.where(np.isclose(xi,0.0),0.0,I)
    else:
        I = -(1-2*nu)*xi*np.sin(dip)/(R+db)
    return I 
def uz_ss(xi,eta,q,dip,nu):
    R = np.sqrt(xi**2+eta**2+q**2)
    db = eta*np.sin(dip) - q*np.cos(dip)
    u = db*q/(R*(R+eta)) \
        + q*np.sin(dip)/(R+eta) \
        + I4(db,eta,q,dip,nu,R)*np.sin(dip)
    return u
def uz_ds(xi,eta,q,dip,nu):
    R = np.sqrt(xi**2+eta**2+q**2)
    db = eta*np.sin(dip) - q*np.cos(dip)
    u = db*q/(R*(R+xi)) \
        - I5(xi,eta,q,dip,nu,R,db)*np.sin(dip)*np.cos(dip)
    u = np.where(q!=0.0,
                 u+np.sin(dip)*np.arctan((xi*eta)/(q*R)),
                 u)
    return u
def uz_tf(xi,eta,q,dip,nu):
    R = np.sqrt(xi**2+eta**2+q**2)
    db = eta*np.sin(dip) - q *np.cos(dip)
    u = (eta*np.cos(dip) + q*np.sin(dip))*q/(R*(R+xi)) \
        + np.cos(dip)*xi*q/(R*(R+eta)) \
        - I5(xi,eta,q,dip,nu,R,db)*np.sin(dip)**2
    u = np.where( q!=0.0, 
                 u - np.cos(dip)*np.arctan(xi*eta/(q*R)),
                u)
    return u
def okada(n,e,depth,strike,dip,L,W,rake,slip,U3):
    nu = 0.25
    strike = strike*np.pi/180.
    dip = dip*np.pi/180.
    rake = rake*np.pi/180.
    
    U1 = np.cos(rake)*slip
    U2 = np.sin(rake)*slip
    
    d = depth + np.sin(dip)*W/2.0
    ec = e + np.cos(strike)*np.cos(dip)*W/2.0
    nc = n - np.sin(strike)*np.cos(dip)*W/2.0
    x = np.cos(strike)*nc + np.sin(strike)*ec+L/2.0
    y = np.sin(strike)*nc - np.cos(strike)*ec + np.cos(dip)*W    
    
    p = y*np.cos(dip) + d*np.sin(dip)
    q = y*np.sin(dip) - d*np.cos(dip)    
    
    uz = -U1/(2.*np.pi) * chinnery(uz_ss,x,p,L,W,q,dip,nu) \
        - U2/(2.*np.pi) * chinnery(uz_ds,x,p,L,W,q,dip,nu) \
        + U3/(2.*np.pi) * chinnery(uz_tf,x,p,L,W,q,dip,nu)    
    return chinnery(uz_ds,x,p,L,W,q,dip,nu)