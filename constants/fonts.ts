/**
 * Sora font family constants
 * Maps weight names to font family strings from @expo-google-fonts/sora
 */
export const Fonts = {
  light: 'Sora_300Light',
  regular: 'Sora_400Regular',
  medium: 'Sora_500Medium',
  semiBold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
} as const;

/**
 * Type for valid font weight names
 */
export type FontWeight = keyof typeof Fonts;
