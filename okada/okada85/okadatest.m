	   [E,N] = meshgrid(linspace(-10,10,100));
	   [uE,uN,uZ] = okada85(E,N,2,30,70,5,3,-45,1,1);
	   figure, surf(E,N,uN)
