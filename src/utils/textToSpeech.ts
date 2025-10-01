import * as Speech from 'expo-speech';

export interface TTSOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

/**
 * Speak text using Text-to-Speech
 */
export const speak = async (
  text: string,
  options: TTSOptions = {}
): Promise<void> => {
  try {
    // Stop any ongoing speech
    await Speech.stop();

    // Speak with options
    await Speech.speak(text, {
      language: options.language || 'en-US',
      pitch: options.pitch || 1.0,
      rate: options.rate || 1.0,
      volume: options.volume || 1.0,
    });
  } catch (error) {
    console.error('TTS Error:', error);
  }
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('TTS Stop Error:', error);
  }
};

/**
 * Check if speech is currently active
 */
export const isSpeaking = async (): Promise<boolean> => {
  try {
    return await Speech.isSpeakingAsync();
  } catch (error) {
    console.error('TTS Check Error:', error);
    return false;
  }
};

/**
 * Get available voices for a language
 */
export const getAvailableVoices = async (): Promise<Speech.Voice[]> => {
  try {
    return await Speech.getAvailableVoicesAsync();
  } catch (error) {
    console.error('TTS Voices Error:', error);
    return [];
  }
};

/**
 * Pause ongoing speech
 */
export const pauseSpeaking = async (): Promise<void> => {
  try {
    await Speech.pause();
  } catch (error) {
    console.error('TTS Pause Error:', error);
  }
};

/**
 * Resume paused speech
 */
export const resumeSpeaking = async (): Promise<void> => {
  try {
    await Speech.resume();
  } catch (error) {
    console.error('TTS Resume Error:', error);
  }
};

/**
 * Speak with callback when done
 */
export const speakWithCallback = (
  text: string,
  options: TTSOptions = {},
  onDone?: () => void
): void => {
  Speech.speak(text, {
    language: options.language || 'en-US',
    pitch: options.pitch || 1.0,
    rate: options.rate || 1.0,
    volume: options.volume || 1.0,
    onDone: onDone,
  });
};

/**
 * Common language codes for quick reference
 */
export const COMMON_LANGUAGES = {
  'English (US)': 'en-US',
  'English (UK)': 'en-GB',
  'Spanish': 'es-ES',
  'French': 'fr-FR',
  'German': 'de-DE',
  'Italian': 'it-IT',
  'Portuguese': 'pt-PT',
  'Portuguese (Brazil)': 'pt-BR',
  'Russian': 'ru-RU',
  'Japanese': 'ja-JP',
  'Korean': 'ko-KR',
  'Chinese (Mandarin)': 'zh-CN',
  'Arabic': 'ar-SA',
  'Hindi': 'hi-IN',
  'Dutch': 'nl-NL',
  'Polish': 'pl-PL',
  'Turkish': 'tr-TR',
  'Swedish': 'sv-SE',
  'Norwegian': 'no-NO',
  'Danish': 'da-DK',
};
