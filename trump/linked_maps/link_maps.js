const { readFileSync, writeFile } = require("fs");

function writeToMap(originJSONdata, originId, destinationMap, whiteList) {
  // we need to change the events in place
  //   console.log(originJSONdata.events[1].pages[0].list);
  // { code: 201, indent: 0, parameters: [ 0, 4, 8, 11, 0, 0 ] },

  for (let i = 0; i < originJSONdata.events.length; i++) {
    // const element = originJSONdata.events[i];
    // console.log(element);
    if (!originJSONdata.events[i]) {
      continue;
    }
    for (let i2 = 0; i2 < originJSONdata.events[i].pages.length; i2++) {
      //   const element = originJSONdata.events[i].pages[i2];
      //   console.log(element);
      for (
        let i3 = 0;
        i3 < originJSONdata.events[i].pages[i2].list.length;
        i3++
      ) {
        const element = originJSONdata.events[i].pages[i2].list[i3];
        // 201 is the move event
        if (element.code === 201 && whiteList.includes(element.parameters[1])) {
          // switching the destination map
          element.parameters[1] = originId;
          console.log(element);
          // saving back
          originJSONdata.events[i].pages[i2].list[i3] = element;
        }
      }
    }
  }

  writeFile(
    `../trump-rpg/data/${destinationMap}`,
    JSON.stringify(originJSONdata, null, 1),
    (error) => {
      if (error) {
        console.log("An error has occurred ", error);
        return;
      }
      console.log("Data written successfully to disk");
    }
  );
}

function linkMaps(originId, destinationId) {
  const originMap = `Map${String(originId).padStart(3, "0")}.json`;
  const destinationMap = `Map${String(destinationId).padStart(3, "0")}.json`;

  const originData = readFileSync(`../trump-rpg/data/${originMap}`);
  const originJSONdata = JSON.parse(originData);

  // destination
  writeToMap(originJSONdata, originId, destinationMap, [
    originId,
    destinationId,
  ]);
  // origin (this allows me to copy the debug map and not have
  // to repoint the move events)
  writeToMap(originJSONdata, destinationId, originMap, [
    originId,
    destinationId,
  ]);
}

// debug
linkMaps(2, 4);
// dungeon 1
linkMaps(12, 13);
// dungeon 2
linkMaps(14, 15);
// dungeon 10
linkMaps(37, 38);
// dungeon 3
linkMaps(40, 41);
// dungeon 4
linkMaps(42, 43);
// dungeon 5
linkMaps(44, 45);
// dungeon 6
linkMaps(46, 47);
// dungeon 7
linkMaps(48, 49);
// dungeon 8
linkMaps(50, 51);
// dungeon 9
linkMaps(52, 53);
