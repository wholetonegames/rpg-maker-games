function SeededRandom(seed) {
  if (!seed || typeof seed !== "number") {
    throw Error("seed is not a number");
  }
  // saving inside RPG Maker
  $gameVariables._data[7] = seed;
  this.seed = seed;

  this.random = function () {
    const x = Math.sin((this.seed += 123)) * 10000;
    // console.log('seed', this.seed);
    // saving inside RPG Maker
    $gameVariables._data[7] = this.seed;
    return x - Math.floor(x);
  };

  /**
   * upper bound is exclusive
   * @param min
   * @param max
   * @returns
   */
  this.randomInRange = function (min, max) {
    const diff = Math.abs(max - min);
    // console.log({max, min, diff});
    return Math.floor(this.random() * diff) + min;
  };

  /**
   * upper bound is exclusive
   * @param min
   * @param max
   * @param except
   * @returns
   */
  this.randomInRangeExceptFor = function (min, max, except) {
    // console.log({min, max, except});
    const payload = this.randomInRange(min, max);
    if (except.includes(payload)) {
      return this.randomInRangeExceptFor(min, max, except);
    }
    return payload;
  };

  this.choice = function (arr) {
    return arr[this.randomInRange(0, arr.length)];
  };

  this.shuffle = function (unshuffled) {
    return unshuffled
      .map((value) => ({ value, sort: this.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };
}

function createSeed() {
  if ($gameVariables._data[7]) {
    // alert("didn't create seed");
    return;
  }
  // alert("seed created");
  $gameVariables._data[7] = Math.floor(Math.random() * 1000);
}

function mazeGen(w, h) {
  var sr = new SeededRandom($gameVariables._data[7]);
  this.maze = function (x, y) {
    var totalNumberOfCells = x * y - 1;
    if (totalNumberOfCells < 0) {
      alert("illegal maze dimensions");
      return;
    }
    var horizontalPassages = [];
    var verticalPassages = [];
    var here = [Math.floor(sr.random() * x), Math.floor(sr.random() * y)];
    var path = [here];
    var unvisitedCells = [];

    // adding columns to rows
    for (var verticalIndex = 0; verticalIndex < x + 1; verticalIndex++) {
      horizontalPassages[verticalIndex] = new Array(x + 1).fill(false);
      verticalPassages[verticalIndex] = new Array(y - 1).fill(false);
    }
    for (var verticalIndex = 0; verticalIndex < x + 2; verticalIndex++) {
      unvisitedCells[verticalIndex] = [];
      for (
        var horizontalIndex = 0;
        horizontalIndex < y + 1;
        horizontalIndex++
      ) {
        unvisitedCells[verticalIndex].push(
          verticalIndex > 0 &&
            verticalIndex < x + 1 &&
            horizontalIndex > 0 &&
            (verticalIndex != here[0] + 1 || horizontalIndex != here[1] + 1)
        );
      }
    }
    while (0 < totalNumberOfCells) {
      var potential = [
        [here[0] + 1, here[1]],
        [here[0], here[1] + 1],
        [here[0] - 1, here[1]],
        [here[0], here[1] - 1],
      ];
      var neighbors = [];
      for (var verticalIndex = 0; verticalIndex < 4; verticalIndex++)
        if (
          unvisitedCells[potential[verticalIndex][0] + 1][
            potential[verticalIndex][1] + 1
          ]
        ) {
          neighbors.push(potential[verticalIndex]);
        }
      if (neighbors.length) {
        totalNumberOfCells = totalNumberOfCells - 1;
        next = neighbors[Math.floor(sr.random() * neighbors.length)];
        unvisitedCells[next[0] + 1][next[1] + 1] = false;
        if (next[0] == here[0])
          horizontalPassages[next[0]][(next[1] + here[1] - 1) / 2] = true;
        else verticalPassages[(next[0] + here[0] - 1) / 2][next[1]] = true;
        path.push((here = next));
      } else {
        here = path.pop();
      }
    }
    return {
      x: x,
      y: y,
      horizontalPassages: horizontalPassages,
      verticalPassages: verticalPassages,
    };
  };

  this.display = function (m) {
    var text = [];
    for (var verticalIndex = 0; verticalIndex < m.x * 2 + 1; verticalIndex++) {
      var line = [];
      if (0 == verticalIndex % 2) {
        for (
          var horizontalIndex = 0;
          horizontalIndex < m.y * 4 + 1;
          horizontalIndex++
        ) {
          if (0 == horizontalIndex % 4) {
            line[horizontalIndex] = "+";
          } else {
            if (
              verticalIndex > 0 &&
              m.verticalPassages[verticalIndex / 2 - 1][
                Math.floor(horizontalIndex / 4)
              ]
            ) {
              line[horizontalIndex] = " ";
            } else {
              line[horizontalIndex] = "-";
            }
          }
        }
      } else {
        for (
          var horizontalIndex = 0;
          horizontalIndex < m.y * 4 + 1;
          horizontalIndex++
        )
          if (0 == horizontalIndex % 4) {
            if (
              horizontalIndex > 0 &&
              m.horizontalPassages[(verticalIndex - 1) / 2][
                horizontalIndex / 4 - 1
              ]
            ) {
              line[horizontalIndex] = " ";
            } else {
              line[horizontalIndex] = "|";
            }
          } else {
            line[horizontalIndex] = " ";
          }
      }
      // creating entrance and exit
      // if (0 == verticalIndex) {
      //   line[1] = line[2] = line[3] = " ";
      // }
      // if (m.x * 2 - 1 == verticalIndex) {
      //   line[4 * m.y] = " ";
      // }
      text.push(line.join("") + "\n");
    }
    return text.join("");
  };

  this.createReducedMap = function (m) {
    const displayMap = this.display(m);
    const maze = [];
    let row = [];
    for (let j = 0; j < displayMap.length; j++) {
      const cell = displayMap[j];
      const isBreak = cell === "\n";
      const isWall = cell === "|" || cell === "-" || cell === "+";
      if (isBreak) {
        maze.push(row);
        row = [];
      } else {
        row.push(isWall);
      }
    }
    const reducedMaze = [];
    for (let i = 0; i < maze.length; i++) {
      const r = maze[i];
      const row = [];
      for (let j = 0; j < r.length; j++) {
        const shouldDisplay = j % 4 === 0 || j % 4 === 1;
        const isRoom = i % 2 === 1 && j % 2 === 1;
        if (shouldDisplay) {
          row.push(r[j] ? "X" : isRoom ? "R" : " ");
        }
      }
      reducedMaze.push(row);
    }
    return reducedMaze;
  };

  this.getPassages = function (reducedMaze) {
    const rooms = [];
    for (let i = 0; i < reducedMaze.length; i++) {
      const r = reducedMaze[i];
      for (let j = 0; j < r.length; j++) {
        const cell = r[j];
        const isRoom = cell === "R";
        if (isRoom) {
          rooms.push({
            north: rooms.length < 1 || reducedMaze[i - 1][j] !== "X" ? 1 : 2,
            south:
              rooms.length >= w * h - 1 || reducedMaze[i + 1][j] !== "X"
                ? 1
                : 2,
            west: reducedMaze[i][j - 1] !== "X" ? 1 : 2,
            east: reducedMaze[i][j + 1] !== "X" ? 1 : 2,
            rowSize: w,
            maxRoom: w * h - 1,
          });
        }
      }
    }
    return rooms;
  };

  var m = this.maze(h, w);
  var reducedMaze = this.createReducedMap(m);
  return this.getPassages(reducedMaze);
}

function left_random(value) {
  var r = value & 0xff;
  var t = (r >> 6) ^ (r >> 5) ^ (r >> 4) ^ r;
  r >>= 1;
  r |= t << 7;
  return r & 0xff;
}

function right_random(value) {
  var r = value & 0xff;
  var t = (r >> 7) ^ (r >> 5) ^ (r >> 4) ^ (r >> 3);
  r <<= 1;
  r |= t & 1;
  return r & 0xff;
}

function wrapAroundScreenIndex(index) {
  if (index < 1) {
    return 255;
  } else if (index > 255) {
    return 1;
  }
  return index;
}

function getScreenDataByIndex(value, initialValue) {
  var formattedIndex = wrapAroundScreenIndex(value);
  var index = 1;
  var data = initialValue;
  while (index < formattedIndex) {
    data = right_random(data);
    index += 1;
  }
  return data;
}

function populateRoom(seed) {
  var seed8bit = (seed >>> 0) & 0xff;

  // Treasures? 3 bit mask - 15 total but only 3 per dungeon
  var treasureIndex = seed8bit & 0b111;
  // Obstacle position? 4 bit mask - some blocks are available when mask equals 1,2,3 … 15
  var obstacleLevel = (seed8bit >> 3) & 0b1111;
  // Unset all self switched? 1 bit mask
  var resetDungeonSwitches = (seed8bit >> 7) & 0b1;

  return {
    seed8bit: seed8bit,
    treasureIndex: treasureIndex,
    obstacleLevel: obstacleLevel,
    resetDungeonSwitches: resetDungeonSwitches,
  };
}

function settingNEWS() {
  var dungeons = $gameVariables._data[9];
  var dungeonIndex = $gameVariables._data[1];
  var roomIndex = $gameVariables._data[2];
  $gameVariables._data[3] = dungeons[dungeonIndex][roomIndex].north;
  $gameVariables._data[4] = dungeons[dungeonIndex][roomIndex].east;
  $gameVariables._data[5] = dungeons[dungeonIndex][roomIndex].west;
  $gameVariables._data[6] = dungeons[dungeonIndex][roomIndex].south;

  var roomData = populateRoom($gameVariables._data[8]);
  $gameVariables._data[10] = roomData.treasureIndex;
  $gameVariables._data[11] = roomData.obstacleLevel;
  $gameVariables._data[12] = roomData.resetDungeonSwitches;

  // going to a new room, no treasures found yet
  if (
    roomData.resetDungeonSwitches &&
    roomData.resetDungeonSwitches % 2 === 0 &&
    $gameVariables._data[13] > 1
  ) {
    $gameVariables._data[13] = 0;
  }
}

function goWest() {
  $gameVariables._data[2] -= 1;
  $gameVariables._data[8] = left_random($gameVariables._data[8]);
  settingNEWS();
}

function goEast() {
  $gameVariables._data[2] += 1;
  $gameVariables._data[8] = right_random($gameVariables._data[8]);
  settingNEWS();
}

function goNorth() {
  var dungeons = $gameVariables._data[9];
  var dungeonIndex = $gameVariables._data[1];
  var rowSize = dungeons[dungeonIndex][0].rowSize;
  $gameVariables._data[2] -= rowSize;
  for (let index = 0; index < rowSize; index++) {
    $gameVariables._data[8] = left_random($gameVariables._data[8]);
  }
  settingNEWS();
}

function goSouth() {
  var dungeons = $gameVariables._data[9];
  var dungeonIndex = $gameVariables._data[1];
  var rowSize = dungeons[dungeonIndex][0].rowSize;
  $gameVariables._data[2] += rowSize;
  for (let index = 0; index < rowSize; index++) {
    $gameVariables._data[8] = right_random($gameVariables._data[8]);
  }
  settingNEWS();
}

function initMazeNav() {
  $gameVariables._data[9] = [
    // debug
    mazeGen(3, 3),
    // lvl 1 - port
    mazeGen(3, 3),
    // lvl 2 - 30 rock
    mazeGen(3, 3),
    // lvl 3 - lybia
    mazeGen(3, 3),
    // lvl 4 - dino
    mazeGen(3, 3),
    // lvl 5 - somalia
    mazeGen(3, 3),
    // lvl 6 - chicago
    mazeGen(3, 3),
    // lvl 7 - laptop repair center
    mazeGen(3, 3),
    // lvl 8 - white house
    mazeGen(3, 3),
    // lvl 9 - rusty movie set
    mazeGen(3, 3),
    // lvl 10 - 30 rock
    mazeGen(3, 3),
  ];
}

function initDungeon(dungeonIndex) {
  var sr = new SeededRandom($gameVariables._data[7]);
  initMazeNav();  // TODO: remove this
  var dungeons = $gameVariables._data[9];
  if (!dungeons) {
    initMazeNav();
    dungeons = $gameVariables._data[9];
  }
  // dungeonIndex
  $gameVariables._data[1] = dungeonIndex;
  // roomIndex
  $gameVariables._data[2] = dungeons[dungeonIndex][0].maxRoom;
  // roomData
  $gameVariables._data[8] = sr.randomInRange(1, 256);
  // maxRoomIndex
  $gameVariables._data[14] = dungeons[dungeonIndex][0].maxRoom;
  // going to a new dungeon, no treasures found yet
  $gameVariables._data[13] = 0;
  settingNEWS();
}
