function makeUSGSQuery(){
  /* loads data from the usgs
  select only scenarios with moment tensor information available*/

  var baseQueryString = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson"
  var startTime = "&starttime=1990-01-01"
  var endTime = "&endtime=2016-01-02"
  var minMagnitudeString = "&minmagnitude=8.0"
  var productType = "&producttype=moment-tensor"
  qString = baseQueryString + startTime + endTime + minMagnitudeString
  $.ajax({
    dataType: "json",
    url: qString,
    async: true,
    success: function(data) {
      loadUSGSScenario(data);
    }
  });
}

function loadUSGSScenario(data){
  var nfeatures = data["features"].length;
  for (var ifeature=0; ifeature<nfeatures; ifeature++){
    var f = data["features"][ifeature];//feature
    var coords = f['geometry']['coordinates'];
    var place = f['properties']['place'];
    var mag = f['properties']['mag'];
    var magType = f['properties']['magType'];
    var tsunamiFlag = f['properties']['tsunami'];
    var title = f['properties']['title'];
    var time = f['properties']['time'];
    var date = new Date(time);
    var year = date.getYear()+1900;
    if (place.toUpperCase().indexOf("BOLIVIA")>-1){
      break;
    }

    var LWslip = getLengthWidthSlip(mag);

    historicalData[place]["cn"]= coords[1],
    historicalData[place]["ce"]= coords[0],
    historicalData[place]["depth"]= coords[2],
    historicalData[place]["Mw"]= mag,
    historicalData[place]["L"]= LWslip.L,
    historicalData[place]["W"]= LWslip.W,
    historicalData[place]["slip"]= LWslip.slip,
    historicalData[place]["strike"]= 0.0,
    historicalData[place]["dip"]= 9.0,
    historicalData[place]["rake"]= 45.0,
    historicalData[place]["U3"]= 0.0


    $('#scenarios').append($('<option>', {
      text: mag.toString()+' M - ' +
          '('+year.toString() + ') '+
          historicalData[place]["name"],
      value: place
    }));

    makeMomentTensorQuery(place, f["id"]);
  }
}



function makeMomentTensorQuery(place,eventid){
  // query moment tensor data
  var baseQueryString = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson"
  var eventIdString ="&eventid="+eventid;
  var qMomentString = baseQueryString + eventIdString

  $.ajax({
    dataType: "json",
    url: qMomentString,
    async: true,
    success: function(data) {
      loadMomentTensorData(place,data);
      console.log( "success" );

      if(place=="48km W of Illapel, Chile"){
        document.getElementById("scenarios").selectedIndex = "2";
        changeScenario("48km W of Illapel, Chile");
      }
    }
  });


}

function loadMomentTensorData(place, data){
  var tensors = data['properties']['products']['moment-tensor'];
  var ntensors = tensors.length;
  var nBestTensor = 0;
  var weightBestTensor = 0;
  for (var itensor=0; itensor<ntensors; itensor++){
    if (tensors[itensor]['preferredWeight']>weightBestTensor){
      nBestTensor = itensor;
      weightBestTensor = tensors[itensor]['preferredWeight'];
    }
  }

  var dip = tensors[nBestTensor]['properties']['nodal-plane-1-dip'];
  var rake = tensors[nBestTensor]['properties']['nodal-plane-1-rake'];
  var strike = tensors[nBestTensor]['properties']['nodal-plane-1-strike'];

  historicalData[place]["dip"] = dip;
  historicalData[place]["rake"] = rake;
  historicalData[place]["strike"] = strike;
}

function Mw2Mo(Mw){
  return Math.pow(10., 1.5*Mw+9.1)
}

function getLengthWidthSlip(Mw){
  var mu = 2.0e10
  var L = Math.pow(10., 0.5*Mw-1.80)*1000
  var W = 0.5*L
  var slip = Mw2Mo(Mw)/(mu*L*W)
  return {L:L, W:W, slip:slip}
}
