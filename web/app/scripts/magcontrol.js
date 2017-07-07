var magcontrol = function(parentId,x,y){
  `
    parentId= Id of the parent dom object (the parent div for example)
    x,y: canvas coordinates where tu put the resizable circle
  `

  var currentMw = 8.8;
  var Mwmax = 9.6
  var MwMagGuides = [7,8,  9];
  var magnitudeToRadius = function(Mw){
    // Returns the "relative" radius of a sphere
    // such that its volume equals M0 and
    // r=1 implies Mw = Mwmax
    var M0 =  Math.pow(10.0, 1.5*(Mw-Mwmax));
    return Math.pow(M0,1/3.);
  };

  var radiusToMagnitude = function(r,rmax){
    // inverse of magnitudeToRadius
    var M0max = Math.pow(10, 1.5*(Mwmax+6.07));
    var M0 = Math.pow(r/rmax,3)*M0max;
    var Mw = 2/3*Math.log10(M0)-6.07;
    return Mw;
  }

  // write visualization guidelines

  var guides = MwMagGuides.map(magnitudeToRadius);

  // identify where to draw

  var parent = document.getElementById(parentId);
  var canvas = document.createElement('canvas');
  var rectObject = parent.getBoundingClientRect();
  parent.appendChild(canvas);
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;

  // position of the bottom point of the circle

  var x = canvas.width*0.5;
  var y = canvas.height;
  var context = canvas.getContext("2d");
  var elemLeft = rectObject.left;//parent.offsetLeft; //canvas.offsetLeft;
  var elemTop = rectObject.top;//parent.offsetTop; //canvas.offsetTop;
  var rmax = Math.min(canvas.width,canvas.height)*0.5;

  var draw = function(x1,y1,x2,y2,color){

    // custom sphere
    var r1 = y1 < y ? Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1)): 0;
    var r2 = y2 < y ? Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2)): 0;
    var dr = r2-r1

    var r = Math.max(Math.min(r1+dr, rmax), 0.0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.arc(x, y - r, r, 0, 2 * Math.PI, false);
    context.fillStyle =  color;
    context.fill();

    // draw guides

    for(var i = 0; i<guides.length; i++){
      context.beginPath();
      context.arc(x, y-guides[i]*rmax, guides[i]*rmax, 0, 2 * Math.PI, false);
      context.lineWidth = 0.5;
      context.strokeStyle = 'black';
      context.setLineDash([4,2]);
      context.stroke();

      Mw = MwMagGuides[i];
      context.font = "8pt Arial";
      context.fillStyle = 'black';
      context.textAlign = "center";
      context.fillText(Mw.toString()+' Mw',x,y-2*guides[i]*rmax-2);
    }
    context.beginPath();
    context.arc(x, y-rmax, rmax, 0, 2 * Math.PI, false);
    context.lineWidth = 0.15;
    context.strokeStyle = 'black';
    context.setLineDash([4,0]);
    context.stroke();

    currentMw = radiusToMagnitude(r,rmax);
    return currentMw;
  }

  draw(x,y, x,y-magnitudeToRadius(currentMw)*rmax,'orange');

  var resize = false;

  return {
    currentMw : currentMw,
    resize: resize,
    canvas: canvas,
    draw: draw,
    coords :   {
      top: elemTop,
      left: elemLeft
    }
  }
}
