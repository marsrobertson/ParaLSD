function calculatePerpendicularSection(point1, point2, point3) {
    // Calculate the slope of the line passing through point1 and point2
    const slope = (point2.y - point1.y) / (point2.x - point1.x);

    // Calculate the slope of the line perpendicular to the line passing through point1 and point2
    const perpendicularSlope = -1 / slope;

    // Calculate the y-intercept of the line passing through point3 and perpendicular to the line passing through point1 and point2
    const yIntercept = point3.y - perpendicularSlope * point3.x;

    // Calculate the x-coordinate of the intersection point
    const intersectionX = (slope * point1.x - perpendicularSlope * point3.x + point3.y - point1.y) / (slope - perpendicularSlope);

    // Calculate the y-coordinate of the intersection point
    const intersectionY = perpendicularSlope * intersectionX + yIntercept;

    // Calculate the distance from point1 to the intersection point
    const distanceToIntersection = Math.sqrt((intersectionX - point1.x) ** 2 + (intersectionY - point1.y) ** 2);

    // Calculate the total length of the line segment
    const totalLength = Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);

    // Calculate the percentage of the distance from the start of the line segment to the intersection point
    const percentage = (distanceToIntersection / totalLength) * 100;

    // Return the intersection point and the percentage
    return { intersectionPoint: { x: intersectionX, y: intersectionY }, percentage };
}

function createRectangles(startPoint, endPoint, index = 0) {

    // Calculate the length of the section
    const length = Math.sqrt((endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2);

    // Calculate the length of each rectangle
    const rectangleLength = length / 6;

    // Calculate the direction vector of the section
    const dx = (endPoint.x - startPoint.x) / length;
    const dy = (endPoint.y - startPoint.y) / length;

    // Create a new SVG container
    const svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgContainer.setAttribute("width", "100%");
    svgContainer.setAttribute("height", "100%");

    // Loop to create and draw each rectangle
    for (let i = 0; i < 6; i++) {
        // Calculate the coordinates of the top-left corner of the current rectangle
        const x1 = startPoint.x + i * rectangleLength * dx;
        const y1 = startPoint.y + i * rectangleLength * dy;

        // Create a <rect> element for the rectangle
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x1);
        rect.setAttribute("y", y1);
        rect.setAttribute("width", rectangleLength);
        rect.setAttribute("height", 30); // Width of the rectangle is 30px
        rect.setAttribute("fill", "none"); // No fill color
        rect.setAttribute("stroke", "black"); // Black border
        rect.setAttribute("stroke-width", "1"); // Border width
        svgContainer.appendChild(rect);

        // Calculate the coordinates for drawing the letter "x" inside the rectangle
        const centerX = x1 + rectangleLength / 2;
        const centerY = y1 + 15; // Vertical center of the rectangle

        // Create a <text> element for the letter "x"
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", centerX);
        text.setAttribute("y", centerY);
        text.setAttribute("text-anchor", "middle"); // Center the text horizontally
        text.setAttribute("dominant-baseline", "middle"); // Center the text vertically
        text.setAttribute("font-family", "Arial"); // Font family
        text.setAttribute("font-size", "12"); // Font size
        text.textContent = letters[index][i];
        svgContainer.appendChild(text);
    }

    return svgContainer;
}

// Find closest point on the path to each centroid
function sortCentroidsAndStuff() {
    
    let closestPoints = [];
    for (let i = 0; i < centroids.length; i++) {
        let minDistance = Infinity;
        let closestPoint = null;
        for (let j = 0; j < defaultPath.length; j++) {
            let distance = _distanceBetweenPoints(centroids[i], defaultPath[j]);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = defaultPath[j];
            }
        }
        closestPoints.push(closestPoint);
    }

    dataObject = [];
    for (let i = 0; i < 5; i++) {
        dataObject.push({
            centroids: centroids[i],
            closestPoint: closestPoints[i],
            longestPaths: longestPaths[i]
        });
    }

    console.log(dataObject);

    // Sort dataObject based on the distance from centroid to the closest point on defaultPath
    dataObject.sort((a, b) => {
        let distanceA = _distanceBetweenPoints(a.centroid, a.closestPoint);
        let distanceB = _distanceBetweenPoints(b.centroid, b.closestPoint);
        return distanceA - distanceB;
    });

    console.log(dataObject);

    // UPDATING GLOBAL VARIABLES
    clusters = dataObject.clusters;
    longestPaths = dataObject.longestPaths;
    centroids = dataObject.centroids;

}