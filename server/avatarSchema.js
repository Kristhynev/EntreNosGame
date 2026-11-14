export const AVATAR_SCHEMA = {
  skin: ["skin_01", "skin_02", "skin_03", "skin_04", "skin_05", "skin_06"],
  hair: [
    "hair_short",
    "hair_curly",
    "hair_long",
    "hair_bun",
    "hair_mohawk",
    "hair_afro",
    "hair_ponytail",
    "hair_bald",
    "hair_spiky",
    "hair_wavy",
  ],
  hairColor: [
    "hair_black",
    "hair_brown",
    "hair_blonde",
    "hair_red",
    "hair_blue",
    "hair_pink",
    "hair_green",
    "hair_purple",
  ],
  eyes: [
    "eyes_happy",
    "eyes_wink",
    "eyes_sleepy",
    "eyes_star",
    "eyes_angry",
    "eyes_cute",
    "eyes_round",
    "eyes_cool",
  ],
  mouth: [
    "mouth_smile",
    "mouth_grin",
    "mouth_neutral",
    "mouth_surprised",
    "mouth_tongue",
    "mouth_sad",
  ],
  accessory: [
    "acc_none",
    "acc_glasses",
    "acc_sunglasses",
    "acc_hat_party",
    "acc_crown",
    "acc_bowtie",
    "acc_headphones",
    "acc_mustache",
    "acc_flower",
  ],
  bgColor: [
    "#FFD93D",
    "#FF6B9D",
    "#A8E6CF",
    "#6BCBFF",
    "#FF8C42",
    "#B983FF",
    "#FF5C5C",
    "#4ECDC4",
  ],
};

const REQUIRED_KEYS = [
  "skin",
  "hair",
  "hairColor",
  "eyes",
  "mouth",
  "accessory",
  "bgColor",
];

/**
 * Valida se o objeto de avatar possui apenas chaves permitidas pela whitelist.
 * @param {unknown} avatar
 * @returns {boolean}
 */
export function isValidAvatar(avatar) {
  if (!avatar || typeof avatar !== "object" || Array.isArray(avatar)) {
    return false;
  }

  const keys = Object.keys(avatar);
  if (keys.length !== REQUIRED_KEYS.length) {
    return false;
  }

  for (const key of REQUIRED_KEYS) {
    const value = avatar[key];
    if (typeof value !== "string") {
      return false;
    }
    if (!AVATAR_SCHEMA[key].includes(value)) {
      return false;
    }
  }

  return true;
}

/**
 * Gera a assinatura visual (sem bgColor) para avisar caso dois jogadores tenham visuais idênticos.
 * @param {{ skin: string, hair: string, hairColor: string, eyes: string, mouth: string, accessory: string }} avatar
 * @returns {string}
 */
export function getAvatarSignature(avatar) {
  return `${avatar.skin}|${avatar.hair}|${avatar.hairColor}|${avatar.eyes}|${avatar.mouth}|${avatar.accessory}`;
}

/**
 * Gera um avatar aleatório válido segundo AVATAR_SCHEMA.
 */
export function generateRandomAvatar() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return {
    skin: pick(AVATAR_SCHEMA.skin),
    hair: pick(AVATAR_SCHEMA.hair),
    hairColor: pick(AVATAR_SCHEMA.hairColor),
    eyes: pick(AVATAR_SCHEMA.eyes),
    mouth: pick(AVATAR_SCHEMA.mouth),
    accessory: pick(AVATAR_SCHEMA.accessory),
    bgColor: pick(AVATAR_SCHEMA.bgColor),
  };
}
