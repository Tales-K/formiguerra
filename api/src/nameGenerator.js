// Game Names Generator

// ===============================
// First Name Parts
// ===============================

const firstNamePrefixes = [
  "Aer",
  "Ael",
  "Ar",
  "Bel",
  "Bael",
  "Cal",
  "Caer",
  "Daer",
  "Dor",
  "El",
  "Eld",
  "Er",
  "Faer",
  "Fen",
  "Gal",
  "Gor",
  "Hal",
  "Hel",
  "Ian",
  "Is",
  "Jar",
  "Kael",
  "Kel",
  "Kor",
  "Laer",
  "Lor",
  "Lun",
  "Maer",
  "Mal",
  "Mor",
  "Naer",
  "Nor",
  "Or",
  "Per",
  "Qua",
  "Rael",
  "Rin",
  "Syl",
  "Ser",
  "Ther",
  "Tor",
  "Ulf",
  "Vael",
  "Var",
  "Vor",
  "Wyn",
  "Xan",
  "Yor",
  "Zal",
  "Zor",
];

const firstNameSuffixes = [
  "ael",
  "aen",
  "aer",
  "ain",
  "al",
  "amar",
  "anor",
  "ar",
  "ara",
  "aris",
  "ath",
  "dor",
  "dris",
  "ean",
  "el",
  "eth",
  "ian",
  "iel",
  "ion",
  "ir",
  "is",
  "ith",
  "mir",
  "nor",
  "or",
  "orn",
  "os",
  "rael",
  "ric",
  "rin",
  "ros",
  "thar",
  "thor",
  "thus",
  "tir",
  "var",
  "vyr",
  "wyn",
  "yr",
  "ys",
];

// ===============================
// Last Name Parts
// ===============================

const lastNamePrefixes = [
  "Amber",
  "Ash",
  "Black",
  "Bright",
  "Bronze",
  "Cloud",
  "Cold",
  "Crimson",
  "Dark",
  "Dawn",
  "Deep",
  "Dragon",
  "Dusk",
  "Eagle",
  "Earth",
  "Ember",
  "Even",
  "Falcon",
  "Fire",
  "Frost",
  "Golden",
  "Gray",
  "Green",
  "Grim",
  "Hawk",
  "High",
  "Ice",
  "Iron",
  "Light",
  "Moon",
  "Night",
  "Oak",
  "Raven",
  "Red",
  "River",
  "Shadow",
  "Silver",
  "Sky",
  "Snow",
  "Star",
  "Steel",
  "Stone",
  "Storm",
  "Sun",
  "Thorn",
  "Thunder",
  "True",
  "Void",
  "White",
  "Wild",
  "Wind",
  "Wolf",
];

const lastNameSuffixes = [
  "bane",
  "bearer",
  "blade",
  "blood",
  "born",
  "brand",
  "breaker",
  "bloom",
  "caller",
  "crest",
  "fall",
  "fang",
  "flame",
  "forge",
  "gaze",
  "guard",
  "hammer",
  "heart",
  "hunter",
  "keeper",
  "lord",
  "mane",
  "mark",
  "reaver",
  "rider",
  "runner",
  "seeker",
  "shield",
  "song",
  "spire",
  "stalker",
  "strider",
  "thorn",
  "walker",
  "warden",
  "weaver",
  "whisper",
  "wind",
  "wing",
  "wrath",
];

// ===============================
// Battle Name Parts
// ===============================

const battleConnectors = ["for", "of"];

const terrainPrefixes = [
  "Skull",
  "Dark",
  "Blood",
  "Iron",
  "Shadow",
  "Black",
  "Red",
  "Frost",
  "Storm",
  "Grim",
  "Ash",
  "Doom",
  "Dragon",
  "Wolf",
  "Raven",
  "Stone",
  "Thunder",
  "Broken",
  "Dead",
  "High",
  "Deep",
  "Silver",
  "Golden",
  "Cinder",
  "Night",
  "Sunken",
  "Ghost",
  "Blight",
  "Dire",
  "Steel",
  "Crimson",
  "Hollow",
  "Ebon",
  "Silent",
  "Savage",
  "Wicked",
  "Ancient",
  "Sacred",
  "Forsaken",
  "Shattered",
  "Burning",
  "Howling",
  "Frozen",
  "Whispering",
  "Jagged",
  "Bleak",
  "Obsidian",
  "Verdant",
  "Blazing",
  "Twilight",
  "Gloom",
  "Radiant",
  "Vile",
  "Dread",
  "Grave",
  "Scarlet",
  "Pale",
];

const terrainSuffixes = [
  "Mountain",
  "Mountains",
  "Forest",
  "Woods",
  "Valley",
  "Pass",
  "Hills",
  "Fields",
  "Plains",
  "Ridge",
  "Swamp",
  "Marsh",
  "Cliff",
  "Canyon",
  "Crossing",
  "River",
  "Peak",
  "Reach",
  "Steppe",
  "Bluff",
  "Tundra",
  "Expanse",
  "Frontier",
  "Basin",
  "Depths",
  "Chasm",
  "Isles",
  "Shore",
  "Coast",
  "Barrens",
  "Wastes",
  "Wilds",
  "Glade",
  "Thicket",
  "Stronghold",
  "Keep",
  "Watch",
  "Bridge",
  "Gate",
  "Terrace",
  "Heights",
  "Lowlands",
  "Foothills",
  "Cavern",
  "Hearth",
  "Citadel",
  "Dominion",
  "Outpost",
  "Encampment",
  "Sanctum",
];

// ===============================
// Fortress Name Parts
// ===============================

const fortressNamePrefixes = [
  "Iron",
  "Storm",
  "Shadow",
  "Dragon",
  "Wolf",
  "Raven",
  "Black",
  "Silver",
  "Stone",
  "Golden",
  "Frost",
  "Ash",
  "Crimson",
  "Night",
  "Bright",
  "High",
  "Deep",
  "Ember",
  "Thunder",
  "Grim",
  "Dread",
  "Obsidian",
  "Ebon",
  "Radiant",
  "Scarlet",
  "Ivory",
  "Steel",
  "Silent",
  "Ancient",
  "Savage",
  "Cinder",
  "Blight",
  "Dire",
  "Burning",
  "Frozen",
  "Sacred",
  "Forsaken",
  "Shattered",
  "Hollow",
  "Twilight",
  "Sunfire",
  "Moonfall",
  "Starfall",
  "Void",
  "Dawn",
  "Gloom",
  "Blazing",
  "Ghost",
  "Howling",
  "Jagged",
];

const fortressNameSuffixes = [
  "hold",
  "guard",
  "watch",
  "keep",
  "spire",
  "wall",
  "gate",
  "crest",
  "rock",
  "peak",
  "rest",
  "ward",
  "crown",
  "haven",
  "fall",
  "strong",
  "bast",
  "fort",
  "shield",
  "mark",
  "cliff",
  "stone",
  "fang",
  "reach",
  "tower",
  "ridge",
  "helm",
  "barrow",
  "moor",
  "pass",
  "brook",
  "hearth",
  "garde",
  "bulwark",
  "sanctum",
  "citadel",
  "redan",
  "palisade",
  "warder",
  "spire",
  "keep",
  "watcher",
  "anchor",
  "barricade",
  "bulwark",
  "rampart",
  "defiance",
  "vigil",
  "stronghold",
  "warden",
];

const fortressTypes = [
  "Fortress",
  "Castle",
  "Bastion",
  "Redoubt",
  "Citadel",
  "Stronghold",
  "Keep",
  "Bulwark",
  "Rampart",
  "Watchtower",
];

// ===============================
// Utility
// ===============================

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ===============================
// Character Name Generators
// ===============================

function generateFirstName() {
  return (
    getRandomElement(firstNamePrefixes) + getRandomElement(firstNameSuffixes)
  );
}

function generateLastName() {
  return (
    getRandomElement(lastNamePrefixes) + getRandomElement(lastNameSuffixes)
  );
}

function generateFullName() {
  return `${generateFirstName()} ${generateLastName()}`;
}

// ===============================
// Battle Name Generator
// Pattern: Battle for/of <TerrainName>
// ===============================

function generateBattleName() {
  const connector = getRandomElement(battleConnectors);
  const terrain =
    getRandomElement(terrainPrefixes) + getRandomElement(terrainSuffixes);

  return `Battle ${connector} ${terrain}`;
}

// ===============================
// Fortress Name Generator
// Pattern: <RandomName> Fortress/Castle/Bastion/Redoubt
// ===============================

function generateFortressName() {
  const name =
    getRandomElement(fortressNamePrefixes) +
    getRandomElement(fortressNameSuffixes);

  const type = getRandomElement(fortressTypes);

  return `${name} ${type}`;
}

// ===============================
// Exports
// ===============================

module.exports = {
  generateFirstName,
  generateLastName,
  generateFullName,
  generateBattleName,
  generateFortressName,
};
