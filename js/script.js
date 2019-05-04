// function generates the specified number of pairs of
// very different random hues and returns them as array
const getRandomHues = function getSomeNumberPairsRandomHues(huesCount = 8) {
  let colorWheelRandomPoint = Math.floor(Math.random() * 360);
  const hues = [];
  // hues generation
  for (let i = 0; i < huesCount; i += 1) {
    const validValue = colorWheelRandomPoint % 360;
    hues.push(validValue, validValue);
    colorWheelRandomPoint += Math.trunc(360 / huesCount);
  }
  // hues random distribution
  for (let i = hues.length - 1; i > 0; i -= 1) {
    let j = Math.floor(Math.random() * (i + 1));
    [hues[i], hues[j]] = [hues[j], hues[i]];
  }
  return hues;
};

// the function creates an internal representation of the playing field and
// and initializes the cells with hues from the array
const getPlayingField = function initializePlayingFieldRepresentation(hues) {
  const playingField = {};
  for (let i = 0; i < hues.length; i += 1) {
    playingField[`cell${i + 1}`] = { bgColor: `hsl(${hues[i]} 100% 50%)`, hue: hues[i], isOpened: false };
  }
  playingField.needMatches = hues.length / 2;
  playingField.firstElemOfPair = null;
  playingField.secondElemOfPair = null;
  return playingField;
};
