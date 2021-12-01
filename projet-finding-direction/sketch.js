/* eslint-disable no-undef, no-unused-vars */

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

var a;
var b;

var rectangle = [
  new Point(100, 150),
  new Point(100, 600),
  new Point(300, 600),
  new Point(300, 150)
];

var points = [];
var ratio = 0;
var iteration = 0;
var rectangleExtremePoints;
var rectangleCenter;

var EPSILON = 0.2; //can be changed for precision
var U = [];
var V = [];

var d;
var f1;
var f2;
var q = new Point(0, 0);

var validDirections = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Put setup code here
  fill("black");
  textSize(40);

  computeConstantValues();

  button = createButton("Clear");
  button.position(10, 85);
  button.mousePressed(resetpoints);

  button = createButton("1-1");
  button.position(10, 110);
  button.mousePressed(setRatio1);

  button = createButton("1-3");
  button.position(50, 110);
  button.mousePressed(setRatio3);

  button = createButton("1-5");
  button.position(90, 110);
  button.mousePressed(setRatio5);

  button = createButton("1-10");
  button.position(130, 110);
  button.mousePressed(setRatio10);

  //for the purpose of testing, I always check the first drawed edge of the polygon
  button = createButton("Generate points");
  button.position(10, 135);
  button.mousePressed(createPointsForNewIteration);

  button = createButton("Show best directions");
  button.position(10, 160);
  button.mousePressed(showBestDirections);
}

function computeConstantValues() {
  rectangleExtremePoints = getRectangleExtremes();

  rectangleCenter = new Point(
    Math.round(average(rectangleExtremePoints[0], rectangleExtremePoints[1])),
    Math.round(average(rectangleExtremePoints[2], rectangleExtremePoints[3]))
  );

  a = rectangle[0];
  b = rectangle[3];

  d = new Point(rectangleCenter.x, rectangleExtremePoints[2]);
  f1 = new Point(d.x + (b.x - d.x) * EPSILON, rectangleExtremePoints[2]);
  f2 = new Point(d.x - (b.x - d.x) * EPSILON, rectangleExtremePoints[2]);
}

function average(x, y) {
  return (x + y) / 2;
}

function setRatio1() {
  setRatio(1);
}

function setRatio3() {
  setRatio(3);
}

function setRatio5() {
  setRatio(5);
}

function setRatio10() {
  setRatio(10);
}

function setRatio(i) {
  if (ratio === 0) {
    ratio = i;
    EPSILON = 1 / i;
    computeConstantValues();
  } else {
    document.getElementById("my_res").innerHTML =
      "Clear to choose a new ratio. The ratio is 1-" + ratio;
  }
}

function resetpoints() {
  U = [];
  V = [];
  validDirections = [];
  ratio = 0;
  q = new Point(0, 0);
  document.getElementById("my_res").innerHTML =
    "Choose the ratio of points in one set compared with the other set";
}

function draw() {
  background(200);

  stroke("red");
  for (i in U) {
    ellipse(U[i].x, U[i].y, 4, 4);
  }
  stroke("blue");
  for (i in V) {
    ellipse(V[i].x, V[i].y, 4, 4);
  }
  stroke("black");

  for (let corner = 0; corner < 3; corner++) {
    ellipse(rectangle[corner].x, rectangle[corner].y, 4, 4);
    line(
      rectangle[corner].x,
      rectangle[corner].y,
      rectangle[corner + 1].x,
      rectangle[corner + 1].y
    );
  }
  ellipse(rectangle[3].x, rectangle[3].y, 4, 4);
  line(rectangle[0].x, rectangle[0].y, rectangle[3].x, rectangle[3].y);

  stroke("green");
  ellipse(rectangleCenter.x, rectangleCenter.y, 4, 4);
  ellipse(f1.x, f1.y, 4, 4);
  ellipse(f2.x, f2.y, 4, 4);

  for (let i = 0; i < validDirections.length - 1; i = i + 2) {
    line(
      validDirections[i].x,
      validDirections[i].y,
      validDirections[i + 1].x,
      validDirections[i + 1].y
    );
  }
  stroke("black");
}

function mousePressed() {}

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
    document.getElementById("my_res").innerHTML = "The ratio is 1-" + ratio;
  }
  iteration = iteration + 1;
  //rectangleExtremePoints = getRectangleExtremes();
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

function showBestDirections() {
  for (let u = 0; u < U.length; u++) {
    for (let v = 0; v < V.length; v++) {
      if (isDirectionValid(U[u], V[v])) {
        validDirections.push(U[u], V[v]);
      }
    }
  }
}

function isDirectionValid(u, v) {
  deltaY = Math.round((v.y - u.y) * 100) / 100;
  deltaX = Math.round((v.x - u.x) * 100) / 100;
  q = new Point(rectangleCenter.x + deltaX, rectangleCenter.y + deltaY);
  return doesDirectionIntersectF1F2(q);
}

function doesDirectionIntersectF1F2(q) {
  return (
    (isTurnRight(rectangleCenter, q, f1) &&
      !isTurnRight(rectangleCenter, q, f2)) ||
    (!isTurnRight(rectangleCenter, q, f1) &&
      isTurnRight(rectangleCenter, q, f2))
  );
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};
