/**
 * Audio utility for playing sound effects
 * Uses Web Audio API to generate sounds programmatically
 */

type SoundType = "correct" | "incorrect" | "celebration";

interface AudioContextData {
  context: BaseAudioContext;
  oscillator: OscillatorNode;
  gainNode: GainNode;
}

let audioContextInstance: AudioContextData | null = null;

/**
 * Initialize Web Audio API context
 */
function getAudioContext(): AudioContextData {
  if (audioContextInstance) {
    return audioContextInstance;
  }

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)() as BaseAudioContext;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  audioContextInstance = { context: audioCtx, oscillator, gainNode };
  return audioContextInstance;
}

/**
 * Play a correct answer sound (ascending tones)
 */
export function playCorrectSound(): void {
  try {
    const { context } = getAudioContext();

    // Create a new oscillator for this sound
    const oscillator = context.createOscillator();
    const newGainNode = context.createGain();

    oscillator.connect(newGainNode);
    newGainNode.connect(context.destination);

    // Ascending tones: 523Hz -> 659Hz -> 784Hz (C5 -> E5 -> G5)
    const frequencies = [523, 659, 784];
    const noteDuration = 0.15;
    const now = context.currentTime;

    frequencies.forEach((freq, index) => {
      const startTime = now + index * noteDuration;
      const endTime = startTime + noteDuration;

      oscillator.frequency.setValueAtTime(freq, startTime);
      newGainNode.gain.setValueAtTime(0.3, startTime);
      newGainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
    });

    oscillator.start(now);
    oscillator.stop(now + noteDuration * 3);
  } catch (error) {
    console.warn("Could not play correct sound:", error);
  }
}

/**
 * Play an incorrect answer sound (descending tones)
 */
export function playIncorrectSound(): void {
  try {
    const { context } = getAudioContext();

    // Create a new oscillator for this sound
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Descending tones: 392Hz -> 349Hz -> 294Hz (G4 -> F4 -> D4)
    const frequencies = [392, 349, 294];
    const noteDuration = 0.15;
    const now = context.currentTime;

    frequencies.forEach((freq, index) => {
      const startTime = now + index * noteDuration;
      const endTime = startTime + noteDuration;

      oscillator.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
    });

    oscillator.start(now);
    oscillator.stop(now + noteDuration * 3);
  } catch (error) {
    console.warn("Could not play incorrect sound:", error);
  }
}

/**
 * Play a celebration sound (chord)
 */
export function playCelebrationSound(): void {
  try {
    const { context } = getAudioContext();

    // Create three oscillators for a chord
    const frequencies = [523, 659, 784]; // C5, E5, G5 (C major chord)
    const duration = 0.8;
    const now = (context as any).currentTime;

    frequencies.forEach((freq) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.frequency.value = freq;
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  } catch (error) {
    console.warn("Could not play celebration sound:", error);
  }
}

/**
 * Play a sound based on type
 */
export function playSound(type: SoundType): void {
  switch (type) {
    case "correct":
      playCorrectSound();
      break;
    case "incorrect":
      playIncorrectSound();
      break;
    case "celebration":
      playCelebrationSound();
      break;
  }
}
