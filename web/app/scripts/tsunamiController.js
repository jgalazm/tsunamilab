function TsunamiController(model, view){
  var paused = true;

  var flyTo = function (lat, lng, scale) {
    var scale = scale ? scale : 8;
    view.viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees((lng-5) - 3 * scale, (lat-5) - 3 * scale,
                                                (lng+5) + 3 * scale, (lat+5) + 3 * scale)
    });
  }

  var flyHome = function (){
    var lng = model.simulation.uniforms.ce.value;
    var lat = model.simulation.uniforms.cn.value;
    var maxL = Math.max(
      model.simulation.uniforms.L.value,
      model.simulation.uniforms.W.value
    );
    // normalize using valdivia as reference
    // but not farther than valdivia's scale
    var scale = Math.min(12,12*maxL/850000);

    flyTo(lat, lng, scale);
  }

  var tick = function () {
    if (!paused) {
      model.renderSimulation();
      model.renderScreenVoid();
    }
    return model.getTime();
  }

  var play = function () {
    paused = false;
  }

  var pause = function () {
    paused = true;
  }
  var isPaused = function(){
    return paused;
  }
  var reset = function () {
    model.setSimulation();
    model.renderScreenVoid();
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

  // $("#popover-btn-simular").click(function(){
  //   console.log('asdfasdfasdf');
  // });

  flyTo();
  return {
    play: play,
    pause: pause,
    isPaused: isPaused,
    reset: reset,
    flyTo: flyTo,
    flyHome: flyHome,
    increaseSpeed: increaseSpeed,
    decreaseSpeed: decreaseSpeed,
    resetSpeed: resetSpeed,
    getSpeed: getSpeed,
    tick: tick
  }
}
