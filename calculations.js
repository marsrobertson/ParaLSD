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