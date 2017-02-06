function TsunamiController(model, view){
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


  flyTo();

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
