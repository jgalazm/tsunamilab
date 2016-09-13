function makeUSGSQuery(){
  var baseQueryString = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson"
  var startTime = "&starttime=0000-01-01"
  var endTime = "&endtime=2016-01-02"
  var minMagnitudeString = "&minmagnitude=8.0"
  qString = baseQueryString + startTime + endTime + minMagnitudeString
  $.ajax({
    dataType: "json",
    url: qString,
    async: false,
    success: function(data) {
      loadUSGSScenario(data);
      console.log( "success" );
    }
  });
}

function loadUSGSScenario(data){
  var f = data["features"][0];//feature
  var coords = f['geometry']['coordinates']
  var place = f['properties']['place']
  var mag = f['properties']['mag']
  var magType = f['properties']['magType']
  var tsunamiFlag = f['properties']['tsunami']

  var LWslip = getLengthWidthSlip(mag);

  historicalData[place] = {
    cn: coords[1],
    ce: coords[0],
    depth: coords[2],
    Mw: mag,
    L: LWslip.L,
    W: LWslip.W,
    slip: LWslip.slip,
    strike: 0.0,
    dip: 9.0,
    rake: 45.0,
    U3: 0.0
  }
}

function Mw2Mo(Mw){
  return Math.pow(10., 1.5*Mw+9.1)
}

function getLengthWidthSlip(Mw,mu=2.0e10){
  var L = Math.pow(10., 0.5*Mw-1.80)*1000
  var W = 0.5*L
  var slip = Mw2Mo(Mw)/(mu*L*W)
  return {L:L, W:W, slip:slip}
}
//
// "alaska1964": {
//   "depth": 25000.0,
//   "slip": 9.9763115748443738,
//   "rake": 90.0,
//   "L": 630957.34448019299,
//   "ce": -147.339,
//   "Mw": 9.2,
//   "U3": 0.0,
//   "W": 315478.67224009649,
//   "strike": 218.0,
//   "dip": 8.0,
//   "cn": 60.908
// },
