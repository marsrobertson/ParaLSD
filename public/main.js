const touchArea = document.getElementById('touch-area');

// Add touch event listeners
touchArea.addEventListener('touchstart', handleTouch);
touchArea.addEventListener('touchmove', handleTouch);

let points = [];

function handleTouch(event) {
  event.preventDefault();

  const touches = event.touches;

  // TEMP FOR TESTING ON LOCALHOST
  // if (touches.length !== 5) {
  //   $('#infobox').html('Use 5&nbsp;fingers for calibration');
  //   return;
  // } else {
  //   $('#infobox').text('');
  // }

  for (let i = 0; i < touches.length; i++) {
    const touch = touches[i];

    const newPoint = { x: touch.pageX, y: touch.pageY };

    // Check if the new point is at least 5 pixels away from the nearest existing point
    let minDistance = Infinity;
    for (const existingPoint of points) {
      const distance = _distanceBetweenPoints(newPoint, existingPoint);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    if (minDistance >= 5) {
      points.push(newPoint);
      drawCircle(touch.pageX, touch.pageY, i);
    }

    // drawCircle(touch.pageX, touch.pageY, i);
  }
}

let colors = ["black"];

// Function to draw a circle at the touch position
function drawCircle(x, y, id) {
  const circle = document.createElement('div');
  circle.className = 'circle';
  circle.style.left = (x - 15) + 'px';
  circle.style.top = (y - 15) + 'px';
  circle.style.backgroundColor = colors[id % colors.length];
  touchArea.appendChild(circle);
}

let clusters = []; // globally accessible
let centroids = [];
let longestPaths = [];

let letters = [
    ['a', 'b', 'c', 'd', 'e', 'f'],
    ['g', 'h', 'i', 'j', 'k', 'l'],
    ['m', 'n', 'o', 'p', 'q', 'r'],
    ['s', 't', 'u', 'v', 'w', 'x'],
    ['y', 'z', '␣', '↵', '⌫', '...']
]

$("#calibrate").click(function() {
  clusters = kMeansClustering(points, 5);
  calibrate();
});

$("#skip").click(function() {
  clusters = kMeansClustering(pointsBackup, 5);
  calibrate();
});

// $("#saveDefault").click(function() {
//     b = points;
//     console.log(b);
// })

function calibrate() {
  // Assining center of gravity for ease of calculation later on
  for (let i = 0; i < clusters.length; i++) {
    centroids[i] = _calculateCenterOfGravity(clusters[i]);
  }

  // Clear existing content in 'paths' element
  const rectangles = document.getElementById('rectangles');
  const pathsElement = document.getElementById('paths');
  pathsElement.innerHTML = '';

  // Loop through each cluster
  for (let i = 0; i < clusters.length; i++) {
    // Create a new SVG element for each cluster
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('class', 'cluster');

    let svgPath = computeConvexHullSVG(clusters[i]);
    console.log(svgPath);

    // Create a path element for the current cluster
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', svgPath);
    path.setAttribute('stroke', 'blue');
    path.setAttribute('fill', 'blue');
    path.setAttribute('stroke-width', 30);
    svg.appendChild(path);


    longestPaths[i] = _calculateLongestPath(clusters[i]); // LPIC = Longest Path In Cluster
    const LPIC2 = longestPaths[i]; // handy shortcut to keep lines within manageable size
    const pathData = `M ${LPIC2[0].x},${LPIC2[0].y} L ${LPIC2[1].x},${LPIC2[1].y}`;

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', pathData);
    path2.setAttribute('fill', 'red');
    path2.setAttribute('stroke', 'rgba(255, 0, 0, 0.3)');
    path2.setAttribute('stroke-width', 40);
    svg.appendChild(path2);


    // Append the SVG to the 'paths' element
    pathsElement.appendChild(svg);
  }

  setTimeout(cleanupCalibration, 1500); // not sure why delay, probably the visual aspect

  sortCentroidsAndStuff();

  console.log("Longest paths: main.js", longestPaths);

  for (let i=0; i<5; i++) {
    const path = longestPaths[i];
    const rect = createRectangles(path[0], path[1], i);
    console.log(rect);
    rectangles.appendChild(rect);
  }
}

function cleanupCalibration() {
  touchArea.removeEventListener('touchstart', handleTouch);
  touchArea.removeEventListener('touchmove', handleTouch);

  $("#paths").remove();
  $(".circle").remove();

  touchArea.addEventListener('touchstart', handleTouchOperations);
  touchArea.addEventListener('touchmove', handleTouchOperations);
}

const socket = new WebSocket("ws" + window.location.href.replace("http","").replace("https", "") + ":8000");

// Send the current letter whenever it changes
function sendLetter(letter) {
    socket.send(letter);
}

let lineSVG = null;

function handleTouchOperations(event) {
  event.preventDefault();

  if (lineSVG) {
    rectangles.removeChild(lineSVG);
    lineSVG = null;
  }

  const touches = event.touches;

  // TAKING INTO ACCOUNT SINGLE TOUCH ONLY (no chords)
    const touch = touches[0];
    let minDistance = Infinity;
    let closestCentroid = null;
    let closestCentroidIndex = null

    // Iterate through centroids to find the closest one to the current touch point
    for (let j = 0; j < 5; j++) {
        const centroid = centroids[j];
        const distance = Math.sqrt((touch.pageX - centroid.x) ** 2 + (touch.pageY - centroid.y) ** 2);
        if (distance < minDistance) {
            minDistance = distance;
            closestCentroid = centroid;
            closestCentroidIndex = j;
        }
    }

    // 'closestCentroid' now contains the centroid closest to the current touch point
    // console.log("Closest centroid to touch point: ", closestCentroidIndex);

    let result = calculatePerpendicularSection(longestPaths[closestCentroidIndex][0], longestPaths[closestCentroidIndex][1], {x: touch.pageX, y: touch.pageY} );
    // console.log("Perpendicular section:", result); // intersectionPoint: {x: 296.0777670856169, y: 350.50301367561997}, percentage: 136.77813821209946

    if (result.percentage > 100 || result.percentage < 0) return; // OUT OF BOUNDS, do nothing, return

    let currentLetter = letters[closestCentroidIndex][Math.floor(result.percentage / (100 / 6))];
    // console.log("Current letter: " + currentLetter + Math.floor(result.percentage/ (100 / 6)));
    $("#current-letter").text(currentLetter);
    sendLetter(currentLetter);

    // Create a new SVG element
    lineSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // Set the attributes for the SVG element
    lineSVG.setAttribute("width", "100%"); // Set the width to 100%
    lineSVG.setAttribute("height", "100%"); // Set the height to 100%
    lineSVG.setAttribute("viewBox", "0 0 " + rectangles.clientWidth + " " + rectangles.clientHeight); // Set the viewBox to match the SVG container size

    // Create a line element within the SVG
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    // Set the attributes for the line
    line.setAttribute("x1", result.intersectionPoint.x); // Set the starting x-coordinate
    line.setAttribute("y1", result.intersectionPoint.y); // Set the starting y-coordinate
    line.setAttribute("x2", touch.pageX); // Set the ending x-coordinate
    line.setAttribute("y2", touch.pageY); // Set the ending y-coordinate
    line.setAttribute("stroke", "blue"); // Set the stroke color
    line.setAttribute("stroke-width", "2"); // Set the stroke width

    // Append the line to the SVG
    lineSVG.appendChild(line);

    // Append the SVG to the SVG container
    rectangles.appendChild(lineSVG);


}