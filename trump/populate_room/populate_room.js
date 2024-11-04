// this will only be used in this file
const pad = (value, length) => {
  let str = value;
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
};
const formatBin = (value) => pad(value.toString(2), 8);
const formatBin4bitMask = (value) => pad(value.toString(2), 4);
const formatBin2bitMask = (value) => pad(value.toString(2), 2);

// this will be used in RPG Maker
function populateRoom(seed) {
  const seed8bit = (seed >>> 0) & 0xff;

  // Treasures? 2 bit mask - 15 total but only 3 per dungeon
  const treasureIndex = seed8bit & 0b11;
  // Obstacle position? 4 bit mask - some blocks are available when mask equals 1,2,3 … 15
  const obstacleLevel = (seed8bit >> 2) & 0b1111;
  // Unset all self switched? 2 bit mask
  const resetDungeonSwitches = (seed8bit >> 6) & 0b11;

  return {
    seed8bit,
    treasureIndex,
    obstacleLevel,
    resetDungeonSwitches,
  };
}

// lets's test this
for (let index = 1000; index < 1010; index++) {
  const r = populateRoom(index);

  console.log({
    seed8bit: formatBin(r.seed8bit),
    treasureIndex: formatBin2bitMask(r.treasureIndex),
    obstacleLevel: formatBin4bitMask(r.obstacleLevel),
    resetDungeonSwitches: formatBin2bitMask(r.resetDungeonSwitches),
  });
}
