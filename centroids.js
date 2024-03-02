function _calculateCenterOfGravity(points) {
    if (points.length === 0) {
      return { x: 0, y: 0 }; // Return {0, 0} if there are no points
    }
  
    let sumX = 0;
    let sumY = 0;
    for (const point of points) {
      sumX += point.x;
      sumY += point.y;
    }
  
    const centerX = sumX / points.length;
    const centerY = sumY / points.length;
  
    return { x: centerX, y: centerY };
}

function _distanceBetweenPoints(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function _calculateLongestPath(clusterPoints) {
  let longestDistance = 0;
  let longestPath = [];

  // Calculate distances between all pairs of points
  for (let i = 0; i < clusterPoints.length - 1; i++) {
      for (let j = i + 1; j < clusterPoints.length; j++) {
          const distance = _distanceBetweenPoints(clusterPoints[i], clusterPoints[j]);
          if (distance > longestDistance) {
              longestDistance = distance;
              longestPath = [clusterPoints[i], clusterPoints[j]];
          }
      }
  }

  return longestPath;
}
  
  function kMeansClustering(points, k) {
    let bestClusters = null;
    let minTotalDistance = Infinity;
  
    // Deep copy of the points array
    const originalPoints = JSON.parse(JSON.stringify(points));
  
    for (let iteration = 0; iteration < 5000; iteration++) {
      let centroids = [];
      let clusters = [];
  
      // Restore points array to its original state before each iteration
      points = JSON.parse(JSON.stringify(originalPoints));
  
      // Initialize centroids with k random points
      for (let i = 0; i < k; i++) {
        const randomIndex = Math.floor(Math.random() * points.length);
        centroids.push(points[randomIndex]);
        clusters.push([]); // Initialize clusters
        points.splice(randomIndex, 1); // Remove selected point from points array
      }
  
      // Main loop to assign points to clusters
      while (points.length > 0) {
        const point = points.shift(); // Get the first point from the array
  
        let minDistance = Infinity;
        let closestCentroidIndex = -1;
  
        // Find the closest centroid for the current point
        for (let i = 0; i < centroids.length; i++) {
          const distance = _distanceBetweenPoints(point, centroids[i]);
          if (distance < minDistance) {
            minDistance = distance;
            closestCentroidIndex = i;
          }
        }
  
        // Assign the point to the closest cluster
        clusters[closestCentroidIndex].push(point);
      }
  
      // Calculate total distance for the current clustering
      let totalDistance = 0;
      for (let i = 0; i < k; i++) {
        const centroid = centroids[i];
        const clusterPoints = clusters[i];
        for (const point of clusterPoints) {
          totalDistance += _distanceBetweenPoints(point, centroid);
        }
      }
  
      // Update best clustering if current clustering has lower total distance
      if (totalDistance < minTotalDistance) {
        bestClusters = clusters;
        minTotalDistance = totalDistance;
      }
    }
  
    // Return the clusters with the lowest total distance
    return bestClusters;
  }
  