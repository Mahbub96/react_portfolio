/**
 * Pure Mathematical & Geometric Trajectory Algorithms
 * Complies with Sections 82-84 & 213-214:
 * - Pure functions: input -> output
 * - Zero state, zero dependencies, zero DOM operations
 * - Fast squared-distance calculations avoiding Math.sqrt
 */

/**
 * Calculate squared Euclidean distance between two points (x1, y1) and (x2, y2)
 */
export function getDistanceSq(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/**
 * Check whether three points A, B, C are approximately collinear.
 * Uses 2 * Triangle Area from vector cross product:
 * |(xB - xA)*(yC - yA) - (xC - xA)*(yB - yA)|
 */
export function isCollinear(xA, yA, xB, yB, xC, yC, threshold = 25) {
  const cross = Math.abs((xB - xA) * (yC - yA) - (xC - xA) * (yB - yA));
  return cross < threshold;
}

/**
 * Squared perpendicular distance from point p to segment (p1, p2)
 * Coordinates: p[1] = x, p[2] = y
 */
export function getPerpendicularDistanceSq(p, p1, p2) {
  const px = p[1] != null ? p[1] : p[0];
  const py = p[2] != null ? p[2] : p[1];
  const x1 = p1[1] != null ? p1[1] : p1[0];
  const y1 = p1[2] != null ? p1[2] : p1[1];
  const x2 = p2[1] != null ? p2[1] : p2[0];
  const y2 = p2[2] != null ? p2[2] : p2[1];

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    const ddx = px - x1;
    const ddy = py - y1;
    return ddx * ddx + ddy * ddy;
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  const distDx = px - projX;
  const distDy = py - projY;

  return distDx * distDx + distDy * distDy;
}

/**
 * Ramer-Douglas-Peucker (RDP) Trajectory Simplification
 * Operates on array of points: [deltaMs, x, y, scrollY]
 */
export function simplifyTrajectory(points, tolerance = 2.5) {
  if (!Array.isArray(points) || points.length <= 2) {
    return points || [];
  }

  const tolSq = tolerance * tolerance;
  const len = points.length;
  const marker = new Uint8Array(len);
  marker[0] = 1;
  marker[len - 1] = 1;

  const stack = [[0, len - 1]];

  while (stack.length > 0) {
    const [start, end] = stack.pop();
    let maxDistSq = 0;
    let index = -1;

    for (let i = start + 1; i < end; i++) {
      const distSq = getPerpendicularDistanceSq(points[i], points[start], points[end]);
      if (distSq > maxDistSq) {
        maxDistSq = distSq;
        index = i;
      }
    }

    if (maxDistSq > tolSq && index !== -1) {
      marker[index] = 1;
      stack.push([start, index]);
      stack.push([index, end]);
    }
  }

  const result = [];
  for (let i = 0; i < len; i++) {
    if (marker[i]) result.push(points[i]);
  }
  return result;
}
