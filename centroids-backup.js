function kMeansClustering(points, k) {
    // Initialize cluster centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * points.length);
      centroids.push(points[randomIndex]);
    }
  
    // Function to assign each point to the nearest cluster centroid
    function assignPointsToClusters(points, centroids) {
      const clusters = Array.from({ length: k }, () => []);
      for (const point of points) {
        let minDistance = Infinity;
        let closestCentroidIndex = -1;
        for (let i = 0; i < centroids.length; i++) {
          const distance = Math.sqrt((point.x - centroids[i].x) ** 2 + (point.y - centroids[i].y) ** 2);
          if (distance < minDistance) {
            minDistance = distance;
            closestCentroidIndex = i;
          }
        }
        clusters[closestCentroidIndex].push(point);
      }
      return clusters;
    }
  
    // Function to update cluster centroids based on the mean of points in each cluster
    function updateCentroids(clusters) {
      return clusters.map(cluster => {
        if (cluster.length === 0) return { x: 0, y: 0 };
        // Calculate the centroid as the average of points' coordinates
        const sumX = cluster.reduce((acc, point) => acc + point.x, 0);
        const sumY = cluster.reduce((acc, point) => acc + point.y, 0);
        return { x: sumX / cluster.length, y: sumY / cluster.length };
      });
    }
  
    // Function to check if centroids have converged
    function hasConverged(oldCentroids, newCentroids) {
      const threshold = 1; // Adjust this threshold as needed
      for (let i = 0; i < oldCentroids.length; i++) {
        const oldCentroid = oldCentroids[i];
        const newCentroid = newCentroids[i];
        // Compare the distance between old and new centroids
        const distance = Math.sqrt((oldCentroid.x - newCentroid.x) ** 2 + (oldCentroid.y - newCentroid.y) ** 2);
        if (distance > threshold) {
          return false;
        }
      }
      return true;
    }
  
    // Run K-means algorithm
    let oldCentroids = null;
    let clusters = null;
    do {
      oldCentroids = centroids;
      clusters = assignPointsToClusters(points, centroids);
      centroids = updateCentroids(clusters);
    } while (!hasConverged(oldCentroids, centroids));
  
    // Return the clusters
    return clusters;
  }
  