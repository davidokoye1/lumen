/**
 * High-frequency English words grouped by length, used by recognition drills.
 * Concrete, everyday vocabulary keeps the drill about visual recognition
 * rather than vocabulary knowledge.
 */
export const wordBank: Record<number, string[]> = {
  3: ["sun", "map", "cup", "key", "box", "pen", "jar", "fox", "owl", "bed", "car", "hat", "ice", "leg", "net", "oak", "pie", "row", "sky", "toy", "web", "zip", "art", "bus", "dog", "egg", "fig", "gem", "ink", "jet"],
  4: ["lamp", "book", "tree", "rain", "milk", "door", "fish", "bird", "road", "ship", "coin", "leaf", "moon", "star", "wind", "fire", "gold", "hand", "king", "lake", "nest", "park", "rock", "salt", "town", "wall", "wave", "wolf", "corn", "desk", "frog", "hill", "kite", "mint", "page", "rose", "seed", "tent", "vase", "yarn"],
  5: ["chair", "plant", "river", "stone", "cloud", "bread", "clock", "dream", "field", "glass", "horse", "light", "music", "ocean", "paper", "queen", "smile", "table", "train", "water", "apple", "beach", "crown", "flame", "grape", "house", "lemon", "money", "night", "piano", "radio", "sheep", "tiger", "voice", "whale", "brush", "candle", "earth", "honey", "pearl"],
  6: ["garden", "window", "bridge", "candle", "forest", "planet", "silver", "winter", "basket", "castle", "doctor", "engine", "flower", "guitar", "island", "jacket", "kitten", "letter", "market", "orange", "pencil", "rabbit", "summer", "ticket", "violin", "wallet", "anchor", "butter", "camera", "dinner", "father", "hammer", "mirror", "pepper", "rocket", "saddle", "tunnel", "valley", "yellow", "spring"],
  7: ["blanket", "picture", "kitchen", "morning", "teacher", "library", "mountain", "balloon", "captain", "diamond", "evening", "feather", "holiday", "journey", "lantern", "monster", "orchard", "pyramid", "rainbow", "sandals", "theater", "village", "weather", "compass", "dolphin", "giraffe", "harvest", "lettuce", "network", "penguin", "pumpkin", "shelter", "station", "thunder", "uniform", "volcano", "whistle", "cabinet", "glacier", "lobster"],
  8: ["elephant", "notebook", "sandwich", "umbrella", "airplane", "calendar", "dinosaur", "envelope", "festival", "hospital", "keyboard", "language", "magazine", "mountain", "painting", "question", "sunlight", "treasure", "universe", "vacation", "building", "cucumber", "daughter", "exercise", "football", "grateful", "hedgehog", "lemonade", "marathon", "necklace", "ornament", "pancakes", "railroad", "scissors", "seashell", "skeleton", "squirrel", "triangle", "whisper", "workshop"],
};

export function wordsOfLength(min: number, max: number): string[] {
  const out: string[] = [];
  for (let n = min; n <= max; n++) out.push(...(wordBank[n] ?? []));
  return Array.from(new Set(out.filter((w) => w.length >= min && w.length <= max)));
}
