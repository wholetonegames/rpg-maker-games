const { writeFile } = require("fs");

const adjectives = [
  "Amazing",
  "Big League",
  // "Elegant",
  // "Fantastic",
  "Great",
  // "Incredible",
  // "Outstanding",
  // "Phenomenal",
  // "Successful",
  "Tremendous",
  "Unbelievable",
];

const items = [
  "Covfefe",
  "Art of the Deal",
  "Fist",
  "Lash",
  "Heal",
  "Heal All",
  "Suit",
  "Dress",
  "Gadget",
  "Tesla Coil",
  "Flamethrower",
];

const data = {};

for (const item of items) {
  data[item] = [];
  for (const adj of adjectives) {
    const fullItem = `${adj} ${item}`;
    console.log(fullItem);
    data[item].push(fullItem);
  }
}

writeFile(`./items.json`, JSON.stringify(data, null, 1), (error) => {
  if (error) {
    console.log("An error has occurred ", error);
    return;
  }
});
