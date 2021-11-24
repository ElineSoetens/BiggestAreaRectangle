/* eslint-disable no-undef, no-unused-vars */

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

var rectangle = [
  new Point(100, 150),
  new Point(100, 400),
  new Point(500, 400),
  new Point(500, 150)
];

var ratio = 0;
var iteration = 0;
var rectangleExtremePoints;

/*var P = 10;
var EPSILON = 0.1;*/
var U = [];
var V = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Put setup code here
  fill("black");
  textSize(40);
  button = createButton("Clear");
  button.position(10, 35);
  button.mousePressed(resetpoints);

  button = createButton("1-1");
  button.position(10, 60);
  button.mousePressed(setRatio1());

  button = createButton("1-3");
  button.position(50, 60);
  button.mousePressed(setRatio3());

  button = createButton("1-5");
  button.position(90, 60);
  button.mousePressed(setRatio5());

  button = createButton("1-10");
  button.position(130, 60);
  button.mousePressed(setRatio10());

  //for the purpose of testing, I always check the first drawed edge of the polygon
  button = createButton("Generate points");
  button.position(10, 85);
  button.mousePressed(createPointsForNewIteration);

  button = createButton("Show best directions");
  button.position(10, 110);
  button.mousePressed();
}

function setRatio1() {
  ratio = 1;
}
function setRatio3() {
  ratio = 3;
}
function setRatio5() {
  ratio = 5;
}
function setRatio10() {
  ratio = 10;
}

function resetpoints() {
  U = [];
  V = [];
  ratio = 0;
  document.getElementById("my_res").innerHTML =
    "Choose the ratio of points in one set compared with the other set";
}

function draw() {
  background(200);

  for (let corner = 0; corner < 5; corner++) {
    ellipse(rectangle[corner].x, rectangle[corner].y, 4, 4);

    line(
      rectangle[corner].x,
      rectangle[corner].y,
      rectangle[(corner + 1) % 4].x,
      rectangle[(corner + 1) % 4].y
    );
  }

  //stroke("red");
  for (i in U) {
    ellipse(U[i].x, U[i].y, 4, 4);
  }
  //stroke("blue");
  for (i in V) {
    ellipse(V[i].x, V[i].y, 4, 4);
  }
  //stroke("black");
}

function mousePressed() {
  if (mouseX > 250 || mouseY > 100) {
    points.push(new Point(mouseX, mouseY));
  }
  //document.getElementById("my_res").innerHTML = mouseX + " , " + mouseY;
}

function isTurnRight(a, b, c) {
  det = b.x * c.y - a.x * c.y + a.x * b.y - b.y * c.x + a.y * c.x - a.y * b.x;
  if (det > 0) {
    return true;
  } else {
    return false;
  }
}

function isInside(a, b, c, d, q) {
  if (
    isTurnRight(a, b, q) &&
    isTurnRight(b, c, q) &&
    isTurnRight(c, d, q) &&
    isTurnRight(d, a, q)
  ) {
    return true;
  } else if (
    !isTurnRight(a, b, q) &&
    !isTurnRight(b, c, q) &&
    !isTurnRight(c, d, q) &&
    !isTurnRight(d, a, q)
  ) {
    return true;
  } else {
    return false;
  }
}

function getRectangleExtremes() {
  maxY = 0;
  minY = 1000;
  maxX = 0;
  minX = 1000;
  for (point in rectangle) {
    if (rectangle[point].x > maxX) {
      maxX = rectangle[point].x;
    } else if (rectangle[point].x < minX) {
      minX = rectangle[point].x;
    }
    if (rectangle[point].y > maxY) {
      maxY = rectangle[point].y;
    } else if (rectangle[point].y < minY) {
      minY = rectangle[point].y;
    }
  }
  return [minX, maxX, minY, maxY];
}

function createPointsForNewIteration() {
  if (ratio === 0) {
    document.getElementById("my_res").innerHTML = "First, choose a ratio";
  } else {
    print(ratio);
    document.getElementById("my_res").innerHTML = "The ratio is 1-" + ratio;
  }
  iteration = iteration + 1;
  rectangleExtremePoints = getRectangleExtremes();
  U = U.concat(generateRandomPointsInside(1));
  V = V.concat(generateRandomPointsInside(ratio));
}

function generateRandomPointsInside(numberOfPointsNeeded) {
  pointsList = [];
  while (pointsList.length < numberOfPointsNeeded) {
    pointsList.push(
      generateOneInsidePoint(
        rectangleExtremePoints[0],
        rectangleExtremePoints[1],
        rectangleExtremePoints[2],
        rectangleExtremePoints[3]
      )
    );
  }
  return pointsList;
}

function generateOneInsidePoint(minX, maxX, minY, maxY) {
  y = Math.random() * (maxY - minY) + minY;
  x = Math.random() * (maxX - minX) + minX;
  newPoint = new Point(x, y);
  while (
    !isInside(rectangle[0], rectangle[1], rectangle[2], rectangle[3], newPoint)
  ) {
    x = Math.random() * (maxX - minX) + minX;
    newPoint.x = x;
  }
  return newPoint;
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};
