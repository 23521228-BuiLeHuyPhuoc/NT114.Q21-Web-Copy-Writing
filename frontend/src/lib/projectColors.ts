export const PROJECT_GRADIENT_CLASSES = [
  'from-green-500 to-emerald-600',
  'from-green-500 to-teal-600',
  'from-teal-500 to-emerald-600',
  'from-orange-500 to-red-500',
  'from-teal-500 to-green-600',
  'from-pink-500 to-rose-600',
  'from-teal-500 to-cyan-600',
  'from-indigo-500 to-sky-600',
  'from-orange-500 to-amber-600',
  'from-lime-500 to-green-600',
] as const;

const PROJECT_GRADIENT_CLASS_SET = new Set<string>(PROJECT_GRADIENT_CLASSES);

function getFallbackIndex(seed: string) {
  if (!seed) return 0;

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index)) % PROJECT_GRADIENT_CLASSES.length;
  }

  return hash;
}

export function getProjectGradientClass(color?: string, fallbackSeed = '') {
  const normalized = color?.trim();

  if (normalized && PROJECT_GRADIENT_CLASS_SET.has(normalized)) {
    return normalized;
  }

  return PROJECT_GRADIENT_CLASSES[getFallbackIndex(fallbackSeed)];
}
