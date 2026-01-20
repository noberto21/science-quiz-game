import { describe, expect, it, beforeEach, vi } from "vitest";
import { playCorrectSound, playIncorrectSound, playCelebrationSound, playSound } from "./audio";

describe("Audio Utilities", () => {
  beforeEach(() => {
    // Mock Web Audio API
    const mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { setValueAtTime: vi.fn(), value: 0 },
    };

    const mockGainNode = {
      connect: vi.fn(),
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    };

    const mockAudioContext = {
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
      currentTime: 0,
    };

    (window as any).AudioContext = vi.fn(() => mockAudioContext);
  });

  it("should play correct sound without errors", () => {
    expect(() => {
      playCorrectSound();
    }).not.toThrow();
  });

  it("should play incorrect sound without errors", () => {
    expect(() => {
      playIncorrectSound();
    }).not.toThrow();
  });

  it("should play celebration sound without errors", () => {
    expect(() => {
      playCelebrationSound();
    }).not.toThrow();
  });

  it("should play sound based on type", () => {
    expect(() => {
      playSound("correct");
      playSound("incorrect");
      playSound("celebration");
    }).not.toThrow();
  });

  it("should handle missing AudioContext gracefully", () => {
    // Remove AudioContext
    (window as any).AudioContext = undefined;
    (window as any).webkitAudioContext = undefined;

    expect(() => {
      playCorrectSound();
    }).not.toThrow();
  });
});
