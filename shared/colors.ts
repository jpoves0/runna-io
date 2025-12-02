// Predefined user colors for territory visualization - Vibrant & attractive palette
export const USER_COLORS = [
  '#10b981', // emerald-500 - Verde vibrante
  '#3b82f6', // blue-500 - Azul brillante
  '#f43f5e', // rose-500 - Rosa/rojo intenso
  '#a855f7', // purple-500 - Púrpura vibrante
  '#f97316', // orange-500 - Naranja brillante
  '#06b6d4', // cyan-500 - Cian brillante
  '#ec4899', // pink-500 - Rosa fucsia
  '#84cc16', // lime-500 - Lima brillante
  '#8b5cf6', // violet-500 - Violeta intenso
  '#0ea5e9', // sky-500 - Azul cielo
];

export function getRandomUserColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

export function getUserColorByIndex(index: number): string {
  return USER_COLORS[index % USER_COLORS.length];
}
