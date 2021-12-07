/* eslint-disable no-undef, no-unused-vars */

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

var points = [];
var vertices = [];

var SW = [];
var SE = [];
var NE = [];
var NW = [];
var array_r = [];

var NRPOINTS = 10;
var EPSILON = 0.1; //TODO: if time, let the user choose
var U = [];
var V = [];
var possibleDirections = [];

var FIRST = 1;
var BACK = -1;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Put setup code here
  fill("black");
  textSize(40);
  button = createButton("Clear");
  button.position(10, 35);
  button.mousePressed(resetpoints);

  button = createButton("I finished my polygon construction");
  button.position(10, 55);
  button.mousePressed(convexhull);

  //for the purpose of testing, I always check the first drawed edge of the polygon
  button = createButton("Find the largest rectangle");
  button.position(10, 75);
  button.mousePressed(launchAlgorithm);
}

function resetpoints() {
  points = [];
  vertices = [];

  maxY = 0;
  minY = 0;
  maxX = 0;
  minX = 0;

  SW = [];
  SE = [];
  NE = [];
  NW = [];

  array_r = [];

  U = [];
  V = [];
  possibleDirections = [];
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

  stroke("green");
  if (array_r.length !== 0) {
    line(
      array_r[0].x,
      array_r[0].y,
      array_r[array_r.length - 1].x,
      array_r[array_r.length - 1].y
    );
    for (let i = 0; i < array_r.length - 1; i = i + 1) {
      line(array_r[i].x, array_r[i].y, array_r[i + 1].x, array_r[i + 1].y);
    }
  }

  if (array_r.length > 0) {
    for (v in array_r) {
      ellipse(array_r[v].x, array_r[v].y, 8, 8);
    }
  }
  stroke("black");
}

function mousePressed() {
  if (mouseX > 250 || mouseY > 100) {
    points.push(new Point(mouseX, mouseY));
  }
}

/*CREATION POLYGON*/

function convexhull() {
  //use graham scan to find the convex hull

  //first step is finding x min
  let min_i = 0;
  let min = points[0].x;
  for (i in points) {
    if (points[i].x <= min) {
      min = points[i].x;
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
  points = JSON.parse(JSON.stringify(vertices));
}

function getPolygonExtremes(listePoints) {
  var maxY = 0;
  var minY = 0;
  var maxX = 0;
  var minX = 0;

  for (p in listePoints) {
    if (listePoints[p].x > listePoints[maxX].x) {
      maxX = p;
    } else if (listePoints[p].x < listePoints[minX].x) {
      minX = p;
    }
    if (listePoints[p].y > listePoints[maxY].y) {
      maxY = p;
    } else if (listePoints[p].y < listePoints[minY].y) {
      minY = p;
    }
  }
  return [int(minX), int(maxX), int(minY), int(maxY)]; //CAUTION : those are the indexes
}

/*FINDING DIRECTIONS*/

function computePossibleDirections() {
  createPointsInsidePolygon();
  for (let u = 0; u < U.length; u++) {
    for (let v = 0; v < V.length; v++) {
      possibleDirections.push([U[u], V[v]]);
    }
  }
}

function createPointsInsidePolygon() {
  U = U.concat(generateRandomPointsInside(NRPOINTS)); //todo: see what's the problem
  V = V.concat(generateRandomPointsInside(NRPOINTS / EPSILON));
}

function generateRandomPointsInside(numberOfPointsNeeded) {
  pointsList = [];
  extremes = getPolygonExtremes(points);
  while (pointsList.length < numberOfPointsNeeded) {
    pointsList.push(
      generateOneInsidePoint(extremes[0], extremes[1], extremes[2], extremes[3])
    );
  }
  return pointsList;
}

function generateOneInsidePoint(minX, maxX, minY, maxY) {
  y = Math.random() * (points[maxY].y - points[minY].y) + points[minY].y;
  x = Math.random() * (points[maxX].x - points[minX].x) + points[minX].x;
  newPoint = new Point(x, y);
  while (!isInsideConvexHull(newPoint)) {
    x = Math.random() * (points[maxX].x - points[minX].x) + points[minX].x;
    newPoint.x = x;
  }
  return newPoint;
}

function isInsideConvexHull(queryPoint) {
  limiteIndex = pointsBinarySearch(fct, queryPoint);
  if (limiteIndex === 0 || limiteIndex === points.length - 1) {
    return false;
  }
  return isInside(
    points[0],
    points[limiteIndex],
    points[limiteIndex + 1],
    queryPoint
  );
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

/*ROTATION*/

function rotatePoints(u, v, backForth, rectangle = undefined) {
  //if backForth = 1, normal. if =-1, back rotation
  theta = Math.atan((v.y - u.y) / (v.x - u.x));
  maxmin = getPolygonExtremes(vertices);
  tx = (vertices[maxmin[0]].x + vertices[maxmin[1]].x) / 2;
  ty = (vertices[maxmin[2]].y + vertices[maxmin[3]].y) / 2;
  actualRotation(tx, ty, theta, backForth, points);
  if (rectangle !== undefined && backForth === -1) {
    actualRotation(tx, ty, theta, backForth, rectangle);
  }
}

function actualRotation(tx, ty, theta, backForth, liste) {
  for (p in liste) {
    ancienX = liste[p].x;
    ancienY = liste[p].y;
    liste[p].x =
      (ancienX - tx) * Math.cos(backForth * theta) +
      (ancienY - ty) * Math.sin(backForth * theta) +
      tx;
    liste[p].y =
      -(ancienX - tx) * Math.sin(backForth * theta) +
      (ancienY - ty) * Math.cos(backForth * theta) +
      ty;
  }
}

/*FINDING LARGEST RECTANGLE*/

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
    } else if (f(i + 1, queryPoint) === true) {
      l = i;
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

function BS_region(f, val, region) {
  let i;
  let u = region.length;
  let l = 0;
  let flag = true;
  if (u === 2) {
    return 0;
  }
  while (flag) {
    i = int((l + u) / 2);
    if (i === region.length - 1) {
      return i;
    }
    if (f(i, val, region) === false) {
      u = i;
    } else if (f(i + 1, val, region) === true) {
      l = i;
    } else {
      return i;
    }
    if (l === u) {
      return i;
    }
  }
}

/* Function used to do binary search on 
regions (SW, SE, NW, NE) of the polygon*/
function BS_edges(f, region, reg_name) {
  let i;
  let u = region.length;
  let l = 0;
  let flag = true;
  while (flag) {
    i = int((l + u) / 2);

    if (i === region.length - 1) {
      return i;
    }
    area1 = f(region[i].x, reg_name);
    area2 = f(region[i + 1].x, reg_name);
    if (area1 < area2) {
      u = i;
    } else if (area1 > area2) {
      l = i;
    } else {
      return i;
    }
    if (l + 1 === u) {
      return i;
    }
    if (l === u) {
      return i;
    }
  }
}
function x_south(i, val, region) {
  return region[i].x < val;
}
function x_north(i, val, region) {
  return region[i].x > val;
}
function y_west(i, val, region) {
  return region[i].y < val;
}
function y_east(i, val, region) {
  return region[i].y > val;
}

/* Binary Search to find the x that give max area */
function BS_xMaxArea(f, region, reg_name, x_min, x_max) {
  let i;
  let u = x_max;
  let l = x_min;
  let flag = true;
  let counter = 0;
  while (flag && counter < 10) {
    counter = counter + 1;
    i = int((l + u) / 2);
    //console.log("BS_xMA-i & reg_name", i, " ", reg_name);
    area1 = f(i, reg_name);
    area2 = f(i + 1, reg_name);
    //console.log("BS-XMA-area1 :", area1);
    //console.log("BS-XMA-area2 :", area2);
    if (int(area1) > int(area2)) {
      u = i;
    } else if (int(area1) < int(area2)) {
      l = i;
    } else {
      return i;
    }
    if (l === u || l + 1 === u) {
      return i;
    }
  }
}

/** Find the largest area rectangle // to axes*/
function searchLargestRectangle() {
  array_minmax = getPolygonExtremes(points);
  i_minX = array_minmax[0];
  i_maxX = array_minmax[1];
  i_minY = array_minmax[2];
  i_maxY = array_minmax[3];

  l_points = points.length;

  //SW
  SW = [];
  if (i_minX < i_maxY) {
    SW = points.slice(i_minX, i_maxY);
  } else if (i_minX > i_maxY) {
    SW = points.slice(i_minX);
    SW = SW.concat(points.slice(0, i_maxY));
  }
  SW.push(points[i_maxY % l_points]);

  //SE
  SE = [];
  if (i_maxY < i_maxX) {
    SE = points.slice(i_maxY, i_maxX);
  } else if (i_maxY > i_maxX) {
    SE = points.slice(i_maxY);
    SE = SE.concat(points.slice(0, i_maxX));
  }
  SE.push(points[i_maxX % l_points]);

  //NE
  NE = [];
  if (i_maxX < i_minY) {
    NE = points.slice(i_maxX, i_minY);
  } else if (i_maxX > i_minY) {
    NE = points.slice(i_maxX);
    NE = NE.concat(points.slice(0, i_minY));
  }
  NE.push(points[i_minY % l_points]);

  //NW
  NW = [];
  if (i_minY < i_minX) {
    NW = points.slice(i_minY, i_minX);
  } else if (i_minY > i_minX) {
    NW = points.slice(i_minY);
    NW = NW.concat(points.slice(0, i_minX));
  }
  NW.push(points[i_minX % l_points]);

  x_min_w = SW[0].x;
  x_max_w = Math.min(SW[SW.length - 1].x, NW[0].x);
  x_min_e = Math.max(NE[NE.length - 1].x, SE[0].x);
  x_max_e = NE[0].x;

  if (SW.length === 1 || NW.length === 1) {
    sol_w = undefined;
    west_solution = 0;

  } else {
    try{
      sol_w = BS_xMaxArea(
        AreaofRectanglefromXandRegion,
        SW,
        "SW",
        x_min_w,
        x_max_w
      );
      west_solution = AreaofRectanglefromXandRegion(sol_w, "SW");
    }
    catch (error){
      sol_w = undefined;
      west_solution = 0;
      console.error("west error");
    }
    
    if (west_solution === NaN){
      west_solution = 0;
    }
  }

  if (SE.length === 1 || NE.length === 1) {
    sol_e = undefined;
    east_solution = 0;
  } else {
    try{
      sol_e = BS_xMaxArea(
        AreaofRectanglefromXandRegion,
        SE,
        "SE",
        x_min_e,
        x_max_e
      );
      east_solution = AreaofRectanglefromXandRegion(sol_e, "SE");
    } catch (error){
      sol_e = undefined;
      east_solution = 0;
      console.error("east error");
    }
    if (east_solution === NaN){
      east_solution =0 ;
    }
  }

  if (west_solution !== 0 || east_solution !== 0) {
    if (west_solution > east_solution) {
      max_areaX = sol_w;
      max_reg = "SW";
    } else {
      max_areaX = sol_e;
      max_reg = "SE";
    }
    try{
      res = AreaofRectanglefromXandRegion(max_areaX, max_reg, true);
    } catch (error){
      res = [0,[]];
    }
  } else {
    res = [0, []];
  }
  max_area = res[0];
  max_rectangle = res[1];

  return [max_area, max_rectangle];
}

/* Find the Area of a rectangle // to axes
the rectangle has 2 pts on the border of the
polygon with coordinate x*/
function AreaofRectanglefromXandRegion(x, region, verbose = false) {
  //region should be one of the four name "SW","SE","NE","NW"
  if (region === "SW") {
    domaine = SW;
  } else if (region === "SE") {
    domaine = SE;
  } else if (region === "NE") {
    domaine = NE;
  } else if (region === "NW") {
    domaine = NW;
  }

  x_min = domaine[0].x;
  x_max = domaine[domaine.length - 1].x;
  if (x_max < x_min) {
    t = x_max;
    x_max = x_min;
    x_min = t;
  }
  if (x < x_min || x > x_max) {
    return false;
  }
  let area = 0;

  //first step : find intersection of x with polygon -> y1 & y2
  if (region === "SW" || region === "NW") {
    v1 = BS_region(x_south, x, SW);
    v2 = BS_region(x_north, x, NW);

    y1 = find_y_intersection(SW[v1], SW[v1 + 1], x);
    y2 = find_y_intersection(NW[v2], NW[v2 + 1], x);

    E = SE.concat(NE);
    v3 = BS_region(y_east, y1, E);
    v4 = BS_region(y_east, y2, E);
    u1 = find_x_intersection(E[v3], E[v3 + 1], y1);
    u2 = find_x_intersection(E[v4], E[v4 + 1], y2);
    u = Math.min(u1, u2);

    area = Math.abs((u - x) * (y2 - y1));
    array_rect = [
      new Point(x, y1),
      new Point(x, y2),
      new Point(u, y2),
      new Point(u, y1)
    ];
  }
  if (region === "SE" || region === "NE") {
    v1 = BS_region(x_south, x, SE);
    v2 = BS_region(x_north, x, NE);
    y1 = find_y_intersection(SE[v1], SE[v1 + 1], x);
    y2 = find_y_intersection(NE[v2], NE[v2 + 1], x);

    W = NW.concat(SW);
    v3 = BS_region(y_west, y1, W);
    v4 = BS_region(y_west, y2, W);
    u1 = find_x_intersection(W[v3], W[v3 + 1], y1);
    u2 = find_x_intersection(W[v4], W[v4 + 1], y2);
    u = Math.max(u1, u2);

    area = Math.abs((x - u) * (y2 - y1));
    array_rect = [
      new Point(x, y1),
      new Point(x, y2),
      new Point(u, y2),
      new Point(u, y1)
    ];
  }
  if (verbose) {
    return [area, array_rect];
  }

  return area;
}

function find_y_intersection(p1, p2, x) {
  let m = (p2.y - p1.y) / (p2.x - p1.x);
  let p = p1.y - m * p1.x;

  return m * x + p;
}

function find_x_intersection(p1, p2, y) {
  let m = (p2.y - p1.y) / (p2.x - p1.x);
  let p = p1.y - m * p1.x;

  return (y - p) / m;
}

function launchAlgorithm() {
  if (vertices.length === 0) {
    return false;
  }
  areaMax = 0;
  rectMax = [];
  computePossibleDirections();
  for (direction in possibleDirections) {
    //console.log("rotation for direction", direction);
    rotatePoints(
      possibleDirections[direction][0],
      possibleDirections[direction][1],
      FIRST
    );
    rectangleAreaAndVertices = searchLargestRectangle();
    //console.log("got rectangle");
    if (rectangleAreaAndVertices[0] > areaMax) {
      //console.log("for direction -better direction:", direction);
      rectMax = rectangleAreaAndVertices[1];
      areaMax = rectangleAreaAndVertices[0];
      //console.log("for direction - areaMax", areaMax);
      //console.log("for direction - rectMax", rectMax);
      rotatePoints(
        possibleDirections[direction][0],
        possibleDirections[direction][1],
        BACK,
        rectMax
      );
      //console.log("finished my rotation when better");
    } else {
      //console.log("no better direction:");
      rotatePoints(
        possibleDirections[direction][0],
        possibleDirections[direction][1],
        BACK
      );
      //console.log("finished my rotation when no");
    }
  }
  array_r = rectMax;
  console.log("final : ", array_r);
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};
