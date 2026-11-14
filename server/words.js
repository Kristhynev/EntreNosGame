export const WORDS_BY_CATEGORY = {
  Comida: [
    "Pizza",
    "Sushi",
    "Hambúrguer",
    "Feijoada",
    "Brigadeiro",
    "Coxinha",
    "Churrasco",
    "Lasanha",
    "Pipoca",
    "Sorvete",
    "Pastel",
    "Panqueca",
    "Açaí",
    "Tapioca",
    "Pudim",
    "Paçoca",
  ],
  Lugares: [
    "Praia",
    "Escola",
    "Hospital",
    "Aeroporto",
    "Cinema",
    "Museu",
    "Padaria",
    "Biblioteca",
    "Estádio",
    "Zoológico",
    "Shopping",
    "Parque",
    "Castelo",
    "Submarino",
    "Circo",
    "Academia",
  ],
  Animais: [
    "Elefante",
    "Pinguim",
    "Tubarão",
    "Girafa",
    "Coruja",
    "Capivara",
    "Camaleão",
    "Polvo",
    "Canguru",
    "Flamingo",
    "Tartaruga",
    "Golfinho",
    "Preguiça",
    "Tucano",
    "Gorila",
    "Pavão",
  ],
  Filmes: [
    "Titanic",
    "Matrix",
    "Avatar",
    "Frozen",
    "Batman",
    "Shrek",
    "Gladiador",
    "Coringa",
    "Moana",
    "Toy Story",
    "Jurassic Park",
    "Vingadores",
    "Rei Leão",
    "Ratatouille",
    "Aladdin",
    "Encanto",
  ],
};

export const ALLOWED_CATEGORIES = [
  "Comida",
  "Lugares",
  "Animais",
  "Filmes",
  "Aleatório",
];

/**
 * Normaliza texto para comparação sem acentos, caixa baixa e espaços simples.
 * @param {string} text
 * @returns {string}
 */
export function normalizeWord(text) {
  if (typeof text !== "string") return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sorteia uma palavra secreta da categoria escolhida (ou mistura todas em "Aleatório").
 * @param {string} category
 * @param {string} [previousWord]
 * @returns {{ word: string, resolvedCategory: string }}
 */
export function pickSecretWord(category, previousWord = "") {
  const baseCategories = Object.keys(WORDS_BY_CATEGORY);
  const resolvedCategory =
    category === "Aleatório" || !WORDS_BY_CATEGORY[category]
      ? baseCategories[Math.floor(Math.random() * baseCategories.length)]
      : category;

  const list = WORDS_BY_CATEGORY[resolvedCategory];
  const candidates = list.filter((w) => w !== previousWord);
  const pool = candidates.length > 0 ? candidates : list;
  const word = pool[Math.floor(Math.random() * pool.length)];

  return { word, resolvedCategory };
}
