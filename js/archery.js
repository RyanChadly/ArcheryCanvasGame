// Ryan Gliever -- 2015

///////////////////////
// CREATE THE CANVAS //
let canvas = document.createElement("canvas");
canvas.id = "canvas";
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 15;
canvas.height = window.innerHeight - 15;
document.body.appendChild(canvas);
const cWidth = canvas.width;
const cHeight = canvas.height;
// // // // // // // //
///////////////////////

// gravity and stuff
let gravity = 0.4;
let groundPoint = cHeight - cHeight / 4;

// drawnBack and firedArrow booleans to assert state of currArrow
let drawnBack = false;
let firedArrow = false;

// calculate distance between two points
let distBetween = function (p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// checks if the mouse position is within < radius distance to the center
// of the shooting circle
let isInCircle = function (mousePosition) {
  let distFromCenter = distBetween(drawBackCirc, mousePosition);
  return distFromCenter < drawBackCirc.r;
};

function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

/////////////////////
// EVENT LISTENERS //
let mousePos;
let mouseDown = false;
let mouseUp = false;
// MOUSE MOVE
addEventListener(
  "mousemove",
  function (evt) {
    mousePos = getMousePos(canvas, evt);
  },
  false
);
// MOUSE DOWN
addEventListener(
  "mousedown",
  function (evt) {
    mousePos = getMousePos(canvas, evt);
    mouseDown = true;
    mouseUp = false;
  },
  false
);
// MOUSE UP
addEventListener(
  "mouseup",
  function (evt) {
    mousePos = getMousePos(canvas, evt);
    mouseUp = true;
    mouseDown = false;
  },
  false
);
// // // // // // //
/////////////////////

let drawScene = function () {
  // increased groundPoint so arrows stick where they should in the ground
  let ground = groundPoint + 15;
  // sky
  ctx.fillStyle = "rgba(0,0,200,0.2)";
  ctx.fillRect(0, 0, cWidth, ground);
  // ground
  ctx.beginPath();
  ctx.moveTo(0, ground);
  ctx.lineTo(cWidth, ground);
  ctx.strokeStyle = "rgba(0,100,50,0.6)";
  ctx.stroke();
  ctx.fillStyle = "rgba(0,200,100,0.6)";
  ctx.fillRect(0, ground, cWidth, cHeight);
};

// calculate angle between two points
let angleBetween = function (p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

// SHOOTING CIRCLES //
let getAimCoords = function (mousePos) {
  /* NOTE: angleBetween(p1, p2) is 180deg opposite of angleBetween(p2, p1) */
  let angle = Math.PI / 2 - angleBetween(mousePos, shootingCirc);
  let distance = Math.min(distBetween(shootingCirc, mousePos), shootingCirc.r);
  let x = shootingCirc.x + distance * Math.sin(angle);
  let y = shootingCirc.y + distance * Math.cos(angle);
  return { x: x, y: y };
};

let drawAimer = function () {
  if (drawnBack) {
    const aimCoords = getAimCoords(mousePos);
    ctx.beginPath();
    ctx.moveTo(aimCoords.x, aimCoords.y);
    ctx.lineTo(shootingCirc.x, shootingCirc.y);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.stroke();
  }
};

let shootingCirc = {
  x: 200,
  y: groundPoint - 200,
  r: 75,
};

let drawBackCirc = {
  x: shootingCirc.x,
  y: shootingCirc.y,
  r: 10,
};

let drawCircles = function () {
  ctx.beginPath();
  ctx.arc(shootingCirc.x, shootingCirc.y, shootingCirc.r, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(drawBackCirc.x, drawBackCirc.y, drawBackCirc.r, 0, 2 * Math.PI);
  ctx.stroke();
  drawAimer();
};

let isFiredArrow = function () {
  if (mousePos && drawnBack && mouseUp) {
    drawnBack = false;
    firedArrow = true;
  }
};

let isDrawnBack = function () {
  if (mousePos && isInCircle(mousePos)) {
    if (mouseDown) drawnBack = true;
    else if (mouseUp) drawnBack = false;
  }
};

let writeInfo = function (mousePos) {
  ctx.font = "11px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  if (isInCircle(mousePos) && mouseDown) {
    ctx.fillStyle = "red";
  } else {
    ctx.fillStyle = "black";
  }
  ctx.fillText("Mouse Position: " + mousePos.x + ", " + mousePos.y, 20, 20);
  ctx.fillText(
    "Circle Position: " + shootingCirc.x + ", " + shootingCirc.y,
    20,
    40
  );
  ctx.fillText("Angle: " + angleBetween(mousePos, shootingCirc), 20, 60);
};

// UPDATE //
let update = function () {
  isDrawnBack();
  isFiredArrow();
  if (firedArrow) {
    currArrow.fireArrow();
    firedArrow = false;
  }
  // clear the canvas
  ctx.clearRect(0, 0, cWidth, cHeight);
};

// RENDER //
let render = function () {
  if (mousePos) writeInfo(mousePos);
  drawCircles();
  for (i = 0; i < arrows.length; i++) {
    arrows[i].drawArrow();
  }
  drawScene();
};

// *** |\/| /_\ | |\| *** //
let main = function () {
  update();
  render();
  requestAnimationFrame(main);
};

let w = window;
requestAnimationFrame =
  w.requestAnimationFrame ||
  w.webkitRequestAnimationFrame ||
  w.msRequestAnimationFrame ||
  w.mozRequestAnimationFrame;
// add initial arrow
addArrow();
currArrow = arrows[0];
main();
