const PLACEHOLDER_EMOJIS = [
  "🚀", "💡", "⭐", "🔥", "💼", "🎯", "🌟", "✨", "🏆", "📈",
  "🌱", "💻", "🎨", "📱", "🛒", "🏥", "⚖️", "🏠", "🔐", "📊",
];

/** Returns a deterministic emoji for the given name (e.g. startup name). Same name always gets the same emoji. */
export function getPlaceholderEmoji(name: string | null | undefined): string {
  const str = name ?? "";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return PLACEHOLDER_EMOJIS[Math.abs(hash) % PLACEHOLDER_EMOJIS.length];
}
