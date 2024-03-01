function computeConvexHullSVG(points) {
    if (points.length === 0) {
        // Return an empty string if there are no points
        return '';
    }

    let pathData = '';
  
    // Sort points by x-coordinate (in case of a tie, sort by y-coordinate)
    points.sort((a, b) => a.x - b.x || a.y - b.y);
  
    // Function to compute the cross product of three points
    function crossProduct(a, b, c) {
      return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
    }
  
    // Compute the lower half of the convex hull
    const lowerHull = [];
    for (const point of points) {
      while (lowerHull.length >= 2 && crossProduct(lowerHull[lowerHull.length - 2], lowerHull[lowerHull.length - 1], point) <= 0) {
        lowerHull.pop();
      }
      lowerHull.push(point);
    }
  
    // Compute the upper half of the convex hull
    const upperHull = [];
    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i];
      while (upperHull.length >= 2 && crossProduct(upperHull[upperHull.length - 2], upperHull[upperHull.length - 1], point) <= 0) {
        upperHull.pop();
      }
      upperHull.push(point);
    }
  
    // Combine the lower and upper hulls to form the convex hull
    const convexHull = lowerHull.concat(upperHull.slice(1, upperHull.length - 1));
  
    // Construct the path data
    if (convexHull.length > 0) {
      const startPoint = convexHull[0];
      pathData += `M ${startPoint.x},${startPoint.y} `;
      for (let i = 1; i < convexHull.length; i++) {
        const point = convexHull[i];
        pathData += `L ${point.x},${point.y} `;
      }
      pathData += 'Z'; // Close the path
    }
  
    // Return the SVG path data
    return pathData;
}
