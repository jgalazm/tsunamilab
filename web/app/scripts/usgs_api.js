
var USGSAPI = function(historicalData){

  function makeUSGSQuery(){
    /* loads data from the usgs
    select only scenarios with moment tensor information available*/

    var baseQueryString = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson"
    var startTime = "&starttime=1990-01-01"
    var endTime = "&endtime=2016-12-31"
    var minMagnitudeString = "&minmagnitude=7.0"
    var productType = "&producttype=moment-tensor"
    qString = baseQueryString + startTime + endTime + minMagnitudeString
    var finished = $.ajax({
      dataType: "json",
      url: qString,
      async: true,
      success: function(data) {
        loadUSGSScenario(data);
      }
    });

    return finished;
  }

  function loadUSGSScenario(data){
    /* Second query: for each scenario loaded
      get its properties, add it to the collection of scenarios
      and ask for moment tensor data
    */
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

      if(historicalData[place]==undefined){
        historicalData[place] = {};
        historicalData[place]["name"] = place;
      }

      historicalData[place]["time"] = time;
      historicalData[place]["date"] = date;
      historicalData[place]["year"] = year;
      historicalData[place]["cn"]= coords[1],
      historicalData[place]["ce"]= coords[0],
      historicalData[place]["depth"]= coords[2]*1000,
      historicalData[place]["Mw"]= mag,
      historicalData[place]["L"]= LWslip.L,
      historicalData[place]["W"]= LWslip.W,
      historicalData[place]["slip"]= LWslip.slip,
      historicalData[place]["strike"]= 0.0,
      historicalData[place]["dip"]= 9.0,
      historicalData[place]["rake"]= 45.0,
      historicalData[place]["U3"]= 0.0


      // TODO : sacar esto de aquí

      $('#scenarios').append($('<option>', {
        text: mag.toString()+' M - ' +
            '('+year.toString() + ') '+
            historicalData[place]["name"],
            value: place
      }));

      getMomentTensorInfo(place, f["id"]);

      getNOAAInfo(place);
    }
  }

  function getMomentTensorInfo(place, eventid){
    // query moment tensor data
    var baseQueryString = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson"
    var eventIdString ="&eventid="+eventid;
    var qMomentString = baseQueryString + eventIdString

    $.ajax({
      dataType: "json",
      url: qMomentString,
      async: true,
      success: function(data) {
        loadMomentTensorData(place,data, historicalData);
        console.log( "success" );

        if(place=="39km SSW of Puerto Quellon, Chile"){
          document.getElementById("scenarios").selectedIndex = "2";
          changeScenario("39km SSW of Puerto Quellon, Chile");
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

  function getNOAAInfo(place){
    var cn = historicalData[place]["cn"];
    var ce = historicalData[place]["ce"];
    var year = historicalData[place]["year"];
    var date = historicalData[place]["date"];
    var time = historicalData[place]["time"];
//
// "https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/hazards/MapServer/identify?f=json&tolerance=1&returnGeometry=false&imageDisplay=1568,915,96&geometry={"x":-73.9395,"y":-43.4029-36.474}&geometryType=esriGeometryPoint&sr=4326&mapExtent=50,-82,49,85&layers=visible:1,11&layerDefs=0:EVENT_VALIDITY_CODE>0;1:EVENT_VALIDITY_CODE>0"
// https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/hazards/MapServer/identify?
// f=json&tolerance=5&returnGeometry=false&imageDisplay=1568,915,96&geometry={"x":-73.125,"y":-36.474}&geometryType=esriGeometryPoint&sr=4326&mapExtent=50,-82,49,85&layers=visible:1,11&layerDefs=0:EVENT_VALIDITY_CODE>0;1:EVENT_VALIDITY_CODE>0

    var  noaaQuery = 'https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/hazards/MapServer/identify?';
    noaaQuery += 'f=json&tolerance=5&returnGeometry=false&imageDisplay=1568,915,96';
    noaaQuery +='&geometry={"x":'+ce+',"y":'+cn+'}&getGeometry=false';
    noaaQuery += '&geometryType=esriGeometryPoint&sr=4326&mapExtent=50,-82,49,85&layers=visible:1,11';
    noaaQuery += '&layerDefs=0:EVENT_VALIDITY_CODE>0;1:EVENT_VALIDITY_CODE>0';

    $.ajax({
      dataType: "json",
      url: noaaQuery,
      async: true,
      success: function(data) {
        // compare dates from noaa and usgs scenarios
        // only first result from noaa
        for(var i=0; i<data.results.length;i++){
          if(data.results[i]!=undefined){
            if(data.results[i].attributes.Year==undefined||data.results[i].attributes.Year=="Null"
            ||data.results[i].attributes.Month==undefined||data.results[i].attributes.Month=="Null"
            ||data.results[i].attributes.Day==undefined||data.results[i].attributes.Day=="Null"){
              continue;
            }
            var attributes = data.results[i].attributes;
            var targetDate = new Date(time);
            var Hour = attributes.Hour && attributes.Hour != "Null" ? attributes.Hour : 0;
            var Minute = attributes.Minute && attributes.Minute != "Null" ? attributes.Minute : 0;
            var Second = attributes.Second && attributes.Second != "Null" ? attributes.Second : 0;
            var thisDate = new Date(
              parseInt(attributes.Year),
              parseInt(attributes.Month)-1, // ok ..
              parseInt(attributes.Day),
              parseInt(Hour),
              parseInt(Minute),
              parseInt(Second),0);

            var UTCOffset = thisDate.getTimezoneOffset();
            thisDate = new Date(thisDate-UTCOffset*60*1000);

            var honeOur = 60*60*1000; // tolerate only one hour offset
            if (Math.abs(thisDate-targetDate)<= honeOur){
              historicalData[place]["deaths"] = attributes["Deaths"];
              historicalData[place]["injuries"] = attributes["Injuries"];
              historicalData[place]["houses destroyed"] = attributes["Houses Destroyed"];
              historicalData[place]["max runup"] = attributes["Max Event Runup"];
              historicalData[place]["mill usd damage"] = attributes["Damage in millions of dollars"];
              historicalData[place]["damage level"] = attributes["Damage Amount Order"]
              historicalData[place]["noaaURL"] = attributes["URL"];
            }
          }
        }
      }
    });
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

  return {
    makeUSGSQuery: makeUSGSQuery,
    historicalData: historicalData
  }
}
