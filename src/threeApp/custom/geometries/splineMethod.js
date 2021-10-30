// https://www.youtube.com/watch?v=FlieT66N9OM
// https://github.com/OneLoneCoder/videos/blob/master/OneLoneCoder_RacingLines.cpp

export const splineMethod = (cpPoints, binormals, tangents, trackHalfWidth) => {
  const displacement = new Array(cpPoints.length).fill(0);
  const racingLine = cpPoints.map((p) => p.clone());
  const nIterations = 5;
  const edgeTouches = {};
  const tolerance = 0.5;

  const alpha = 6; // shortest
  const beta = 0.2; // curvature

  for (let i = 0; i < nIterations; i++) {
    for (let j = 0; j < racingLine.length; j++) {
      // Get locations of neighbour nodes
      const pointRight = racingLine[(j + 1) % racingLine.length].clone();
      const pointLeft = racingLine[(j + racingLine.length - 1) % racingLine.length].clone();
      const pointMiddle = racingLine[j].clone();

      // Create vectors to neighbours & normalize
      const vectorLeft = pointLeft.clone().sub(pointMiddle).normalize();
      const vectorRight = pointRight.clone().sub(pointMiddle).normalize();

      // Add together to create bisector vector
      const vectorSum = vectorLeft.add(vectorRight);

      // Get point gradient and normalise
      const g = binormals[j].clone();

      // Project required correction onto point tangent to give displacement
      const dotProduct = g.dot(vectorSum);

      // Shortest path
      displacement[j] += (dotProduct * alpha);

      // Curvature
      // displacement[(j + 1) % racingLine.length] += dotProduct * -beta;
      // displacement[(j + racingLine.length) % racingLine.length] += dotProduct * -beta;

      // create weights of points as they approach edge
      if (
        (displacement[j] > trackHalfWidth - tolerance
        || displacement[j] < -trackHalfWidth + tolerance)
      ) {
        if (!Object.prototype.hasOwnProperty.call(edgeTouches, j)) {
          edgeTouches[j] = { idx: j, dir: Math.sign(displacement[j]), weight: 1 };
        } else {
          edgeTouches[j].weight++;
        }
      }
    }

    // Clamp displaced points to track width
    for (let j = 0; j < cpPoints.length; j++) {
      if (displacement[j] >= trackHalfWidth) displacement[j] = trackHalfWidth;
      if (displacement[j] <= -trackHalfWidth) displacement[j] = -trackHalfWidth;

      racingLine[j] = cpPoints[j].clone().add(binormals[j].clone().multiplyScalar(displacement[j]));
    }
  }

  // hmmm.... need to work out what to do at end/finish
  racingLine[0] = cpPoints[0].clone();
  racingLine[cpPoints.length - 1] = cpPoints[cpPoints.length - 1].clone();


  const apexIndices = edgeTouchesFilter(edgeTouches);

  return { racingLine, edgeTouches, apexIndices };
};

// create simple array of best edgeTouches
const edgeTouchesFilter = (et) => {
  const arr = Object.values(et);
  const grouped = arr.reduce((apexes, curr, i) => {
    if (
      arr[i - 1]
      && curr.idx !== arr[i - 1].idx + 1
    ) {
      return [...apexes, [curr]]; // return if next touch is not adjacent
    }
    if (
      apexes[apexes.length - 1]
      && apexes[apexes.length - 1].map((a) => a.idx).includes(curr.idx - 1)
      && apexes[apexes.length - 1][0].dir === curr.dir
    ) {
      // push this edgeTouch to current group
      apexes[apexes.length - 1].push(curr);
      return [...apexes];
    }
    return apexes;
  }, []);

  // filter arrays to "best" apex point
  const filtered = grouped.map((group) => (
    group.reduce((best, curr) => {
      if (curr.weight > best.weight) {
        return curr;
      }
      return best;
    })
  ));
  return filtered;
};
