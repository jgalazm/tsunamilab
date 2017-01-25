function TsunamiController(model, view, params){
  var historicalData = params.historicalData;
  var paused = true;

  var flyTo = function () {
    // TODO: set location as input
    var a = 8;
    view.viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(-80 - 3 * a, -45 - 3 * a, -70 + 3 * a, -35 + 3 * a)
    });
  }

  var tick = function () {
    if (!paused) {
      model.renderSimulation();
      view.rectangle.appearance.material.uniforms.image = model.renderScreen();
    }
    return model.getTime();
  }

  var play = function () {
    paused = false;
  }
  var pause = function () {
    paused = true;
  }

  function addCesiumPin(lat=-45,lon=-75.59777){
    view.viewer.entities.add({
          position : Cesium.Cartesian3.fromDegrees(lon, lat,100000),
          billboard : {
              width: 48,
              height: 48,
              image : 'img/pin.svg',//,
              scaleByDistance :  new Cesium.NearFarScalar(1.5e1, 1.5, 4.0e7, 0.0)
              // translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5)
          }
      });
  }

  for(var k = 0;k < Object.keys(historicalData).length;k++){

    var key = Object.keys(historicalData)[k];
    var scenario = historicalData[key];

    if (scenario.cn != undefined && scenario.ce!=undefined){
      var lat = scenario.cn;
      var lon = scenario.ce;
    }

    addCesiumPin(lat,lon);
  }

  flyTo();

  console.log(historicalData);

  var reset = function () {
    model.setSimulation();
    view.rectangle.appearance.material.uniforms.image = model.renderScreen();
  }
  var increaseSpeed = function () {
    model.simulation.speed += 10;
  }
  var decreaseSpeed = function () {
    if(model.simulation.speed > 10)
      model.simulation.speed -= 10;
  }
  var resetSpeed = function () {
    model.simulation.speed = 10;
  }
  var getSpeed = function () {
    return model.simulation.speed;
  }
  return {
    play: play,
    pause: pause,
    reset: reset,
    flyTo: flyTo,
    increaseSpeed: increaseSpeed,
    decreaseSpeed: decreaseSpeed,
    resetSpeed: resetSpeed,
    getSpeed: getSpeed,
    tick: tick
  }
}
