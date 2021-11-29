/* eslint-disable no-undef, no-unused-vars */

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

var points = [];
var vertices = [];

var P = 10;
var EPSILON = 0.1;
var U = [];
var V = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Put setup code here
  fill("black");
  textSize(40);
  button = createButton("Clear");
  button.position(10, 75);
  button.mousePressed(resetpoints);

  button = createButton("I finished my polygon construction");
  button.position(10, 95);
  button.mousePressed(convexhull);

  //for the purpose of testing, I always check the first drawed edge of the polygon
  button = createButton("Find the largest rectangle");
  button.position(10, 115);
  button.mousePressed(searchLargestRectangle);
}

function resetpoints() {
  points = [];
  vertices = [];
  U = [];
  V = [];
  document.getElementById("my_res").innerHTML = "Draw a set of points";
}

function draw() {
  background(200);
  for (i in points) {
    ellipse(points[i].x, points[i].y, 4, 4);
  }

  if (vertices.length !== 0) {
    line(
      vertices[0].x,
      vertices[0].y,
      vertices[vertices.length - 1].x,
      vertices[vertices.length - 1].y
    );
    for (let i = 0; i < vertices.length - 1; i = i + 1) {
      line(vertices[i].x, vertices[i].y, vertices[i + 1].x, vertices[i + 1].y);
    }
  }
  stroke("red");
  for (i in U) {
    ellipse(U[i].x, U[i].y, 4, 4);
  }
  stroke("blue");
  for (i in V) {
    ellipse(V[i].x, V[i].y, 4, 4);
  }
  stroke("black");
}

function mousePressed() {
  if (mouseX > 250 || mouseY > 100) {
    points.push(new Point(mouseX, mouseY));
  }
  //document.getElementById("my_res").innerHTML = mouseX + " , " + mouseY;
}

function convexhull() {
  //use graham scan to find the convex hull

  //first step is finding x min
  let min_i = 0;
  let min = points[0].x;
  for (i in points) {
    if (points[i].x <= min) {
      min_i = i;
    }
  }
  let point_min = points.splice(min_i, 1)[0];

  //order all points radially
  points = [point_min, ...points.slice(0)];
  let sorted_points = points.slice(1);
  sorted_points.sort(compare);
  points = [point_min, ...sorted_points.slice(0)];

  vertices = [points[0], points[1]];

  for (let i = 2; i < points.length; i = i + 1) {
    let l = vertices.length;
    while (isTurnRight(vertices[l - 2], vertices[l - 1], points[i])) {
      vertices.pop();
      l = vertices.length;
    }
    vertices.push(points[i]);
  }
  //console.log(vertices);
  points = JSON.parse(JSON.stringify(vertices));
}

function compare(b, c) {
  if (isTurnRight(points[0], b, c)) {
    return 1;
  } else {
    return -1;
  }
}

function isTurnRight(a, b, c) {
  det = b.x * c.y - a.x * c.y + a.x * b.y - b.y * c.x + a.y * c.x - a.y * b.x;
  if (det > 0) {
    return true;
  } else {
    return false;
  }
}

function isInside(a, b, c, q) {
  if (
    isTurnRight(a, b, q, false) &&
    isTurnRight(b, c, q, false) &&
    isTurnRight(c, a, q, false)
  ) {
    return true;
  } else if (
    !isTurnRight(a, b, q, false) &&
    !isTurnRight(b, c, q, false) &&
    !isTurnRight(c, a, q, false)
  ) {
    return true;
  } else {
    return false;
  }
}

function isInsideConvexHull(queryPoint) {
  //find the last right turn between the first point, the unknown one and the one we are checking
  limiteIndex = pointsBinarySearch(fct, queryPoint);
  //check if the point is inside the triangle
  return isInside(
    points[0],
    points[limiteIndex],
    points[limiteIndex + 1],
    queryPoint
  );
}

function pointsBinarySearch(f, queryPoint) {
  let i;
  let u = vertices.length;
  let l = 0;
  let flag = true;
  while (flag) {
    i = int((l + u) / 2);
    if (i === vertices.length - 1) {
      return i;
    }
    if (f(i, queryPoint) === false) {
      u = i;
      //i = int(arr.length / 2);
    } else if (f(i + 1, queryPoint) === true) {
      l = i;
      //i = int(arr.length / 2);
    } else {
      return i;
    }
    if (l === u) {
      return i;
    }
  }
}

function fct(i, qP) {
  return !isTurnRight(points[0], points[i], qP);
}

function searchLargestRectangle() {
  computeLargestRectangleUV();
  /*U = generateRandomPointsInside(P);
  V = generateRandomPointsInside(Math.floor(P / EPSILON));
  Rapx = 0;
  consol.log("yo");
  for (u in U) {
    for (v in V) {
      newRapx = computeLargestRectangleUV(U[u], V[v]);
      if (newRapx > Rapx) {
        Rapx = newRapx;
      }
    }
  }*/
}

function generateRandomPointsInside(numberOfPointsNeeded) {
  pointsList = [];
  maxY = 0;
  minY = 1000;
  maxX = 0;
  minX = points[0].x;
  for (let i = 0; i < points.length; i = i + 1) {
    if (points[i].x > maxX) {
      maxX = points[i].x;
    }
    if (points[i].y > maxY) {
      maxY = points[i].y;
    }
    if (points[i].y < minY) {
      minY = points[i].y;
    }
  }
  while (pointsList.length < numberOfPointsNeeded) {
    pointsList.push(generateOneInsidePoint(minX, maxX, minY, maxY));
  }
  return pointsList;
}

function generateOneInsidePoint(minX, maxX, minY, maxY) {
  y = Math.random() * (maxY - minY) + minY;
  x = Math.random() * (maxX - minX) + minX;
  newPoint = new Point(x, y);
  while (!isInsideConvexHull(newPoint)) {
    x = Math.random() * (maxX - minX) + minX;
    newPoint.x = x;
  }
  return newPoint;
}

function computeLargestRectangleUV() {
  console.log(
    Math.atan((points[1].y - points[0].y) / (points[1].x - points[0].x))
  );
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};
