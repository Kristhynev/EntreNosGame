export type SoundCue =
  | "toggle"
  | "toggle-off"
  | "case-open"
  | "reconnect"
  | "player-arrives"
  | "player-leaves"
  | "investigation-start"
  | "clue"
  | "message"
  | "debate"
  | "voting"
  | "vote-result"
  | "guess"
  | "victory"
  | "defeat"
  | "error"
  | "ui-click"
  | "ui-select"
  | "ui-tab"
  | "ui-toggle"
  | "ui-confirm"
  | "ui-close"
  | "ui-copy"
  | "ui-randomize"
  | "ui-send"
  | "ui-vote"
  | "ui-settings"
  | "ui-reveal"
  | "ui-chat";

interface Tone {
  frequency: number;
  duration: number;
  volume: number;
  delay?: number;
  waveform?: OscillatorType;
  endFrequency?: number;
}

export class GameAudio {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private enabled = false;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;

  async enable(): Promise<void> {
    const context = this.context ?? this.createContext();
    const output = this.output;

    if (!output) {
      throw new Error("A saída de áudio não foi inicializada.");
    }

    if (this.suspendTimer) {
      clearTimeout(this.suspendTimer);
      this.suspendTimer = null;
    }

    this.enabled = true;
    output.gain.cancelScheduledValues(context.currentTime);
    output.gain.setTargetAtTime(0.4, context.currentTime, 0.12);

    try {
      if (context.state !== "running") {
        await context.resume();
      }
    } catch (error) {
      this.enabled = false;
      output.gain.setValueAtTime(0, context.currentTime);
      throw error;
    }
  }

  disable(): void {
    this.enabled = false;
    const context = this.context;
    const output = this.output;

    if (!context || !output) return;

    output.gain.cancelScheduledValues(context.currentTime);
    output.gain.setTargetAtTime(0, context.currentTime, 0.04);

    if (this.suspendTimer) clearTimeout(this.suspendTimer);
    this.suspendTimer = setTimeout(() => {
      this.suspendTimer = null;
      if (!this.enabled && context.state === "running") {
        void context.suspend().catch((error: unknown) => {
          console.error("Não foi possível suspender o áudio do jogo.", error);
        });
      }
    }, 250);
  }

  play(cue: SoundCue): void {
    if (!this.enabled || this.context?.state !== "running" || !this.output) {
      return;
    }

    const cues: Record<SoundCue, Tone[]> = {
      toggle: [
        { frequency: 659.25, duration: 0.11, volume: 0.08 },
        { frequency: 880, duration: 0.18, volume: 0.07, delay: 0.1 },
      ],
      "toggle-off": [
        {
          frequency: 659.25,
          endFrequency: 440,
          duration: 0.12,
          volume: 0.06,
          waveform: "triangle",
        },
      ],
      "case-open": [
        {
          frequency: 125,
          endFrequency: 82,
          duration: 0.16,
          volume: 0.12,
          waveform: "triangle",
        },
        { frequency: 440, duration: 0.13, volume: 0.06, delay: 0.08 },
        { frequency: 659.25, duration: 0.2, volume: 0.05, delay: 0.17 },
      ],
      reconnect: [
        { frequency: 523.25, duration: 0.12, volume: 0.06 },
        { frequency: 659.25, duration: 0.16, volume: 0.05, delay: 0.11 },
      ],
      "player-arrives": [
        { frequency: 587.33, duration: 0.1, volume: 0.06 },
        { frequency: 783.99, duration: 0.15, volume: 0.05, delay: 0.09 },
      ],
      "player-leaves": [
        {
          frequency: 392,
          endFrequency: 293.66,
          duration: 0.18,
          volume: 0.06,
          waveform: "triangle",
        },
      ],
      "investigation-start": [
        {
          frequency: 174.61,
          duration: 0.2,
          volume: 0.09,
          waveform: "triangle",
        },
        { frequency: 261.63, duration: 0.15, volume: 0.06, delay: 0.13 },
        { frequency: 392, duration: 0.2, volume: 0.05, delay: 0.24 },
      ],
      clue: [{ frequency: 739.99, duration: 0.07, volume: 0.035 }],
      message: [
        {
          frequency: 523.25,
          duration: 0.06,
          volume: 0.03,
          waveform: "triangle",
        },
      ],
      debate: [
        {
          frequency: 220,
          endFrequency: 196,
          duration: 0.24,
          volume: 0.08,
          waveform: "triangle",
        },
        { frequency: 146.83, duration: 0.25, volume: 0.05, delay: 0.16 },
      ],
      voting: [
        { frequency: 392, duration: 0.1, volume: 0.06 },
        { frequency: 493.88, duration: 0.1, volume: 0.06, delay: 0.13 },
        { frequency: 587.33, duration: 0.2, volume: 0.07, delay: 0.26 },
      ],
      "vote-result": [
        {
          frequency: 130,
          endFrequency: 78,
          duration: 0.2,
          volume: 0.12,
          waveform: "triangle",
        },
        {
          frequency: 330,
          duration: 0.06,
          volume: 0.07,
          delay: 0.04,
          waveform: "square",
        },
      ],
      guess: [
        { frequency: 440, duration: 0.12, volume: 0.06 },
        { frequency: 349.23, duration: 0.14, volume: 0.06, delay: 0.13 },
        { frequency: 293.66, duration: 0.2, volume: 0.07, delay: 0.28 },
      ],
      victory: [
        { frequency: 523.25, duration: 0.13, volume: 0.06 },
        { frequency: 659.25, duration: 0.13, volume: 0.06, delay: 0.12 },
        { frequency: 783.99, duration: 0.13, volume: 0.06, delay: 0.24 },
        { frequency: 1046.5, duration: 0.28, volume: 0.05, delay: 0.36 },
      ],
      defeat: [
        { frequency: 440, duration: 0.15, volume: 0.06 },
        { frequency: 349.23, duration: 0.15, volume: 0.06, delay: 0.15 },
        { frequency: 293.66, duration: 0.2, volume: 0.06, delay: 0.3 },
        { frequency: 220, duration: 0.27, volume: 0.05, delay: 0.45 },
      ],
      error: [
        {
          frequency: 180,
          endFrequency: 140,
          duration: 0.11,
          volume: 0.07,
          waveform: "square",
        },
      ],
      "ui-click": [
        {
          frequency: 420,
          endFrequency: 340,
          duration: 0.045,
          volume: 0.025,
          waveform: "triangle",
        },
      ],
      "ui-select": [
        { frequency: 493.88, duration: 0.055, volume: 0.035 },
        { frequency: 587.33, duration: 0.07, volume: 0.03, delay: 0.045 },
      ],
      "ui-tab": [
        { frequency: 659.25, duration: 0.055, volume: 0.035 },
      ],
      "ui-toggle": [
        { frequency: 440, duration: 0.07, volume: 0.035 },
        { frequency: 554.37, duration: 0.08, volume: 0.03, delay: 0.055 },
      ],
      "ui-confirm": [
        { frequency: 523.25, duration: 0.08, volume: 0.045 },
        { frequency: 783.99, duration: 0.12, volume: 0.04, delay: 0.07 },
      ],
      "ui-close": [
        {
          frequency: 523.25,
          endFrequency: 349.23,
          duration: 0.1,
          volume: 0.04,
          waveform: "triangle",
        },
      ],
      "ui-copy": [
        { frequency: 880, duration: 0.045, volume: 0.035 },
        { frequency: 1046.5, duration: 0.065, volume: 0.03, delay: 0.055 },
      ],
      "ui-randomize": [
        { frequency: 392, duration: 0.055, volume: 0.035 },
        { frequency: 523.25, duration: 0.055, volume: 0.035, delay: 0.05 },
        { frequency: 659.25, duration: 0.055, volume: 0.035, delay: 0.1 },
        { frequency: 783.99, duration: 0.09, volume: 0.03, delay: 0.15 },
      ],
      "ui-send": [
        { frequency: 587.33, duration: 0.05, volume: 0.035 },
        { frequency: 739.99, duration: 0.08, volume: 0.03, delay: 0.05 },
      ],
      "ui-vote": [
        { frequency: 392, duration: 0.07, volume: 0.04 },
        {
          frequency: 293.66,
          endFrequency: 220,
          duration: 0.1,
          volume: 0.035,
          delay: 0.06,
          waveform: "triangle",
        },
      ],
      "ui-settings": [
        { frequency: 349.23, duration: 0.06, volume: 0.035 },
        { frequency: 440, duration: 0.06, volume: 0.035, delay: 0.055 },
        { frequency: 523.25, duration: 0.09, volume: 0.03, delay: 0.11 },
      ],
      "ui-reveal": [
        {
          frequency: 392,
          endFrequency: 659.25,
          duration: 0.11,
          volume: 0.035,
          waveform: "triangle",
        },
      ],
      "ui-chat": [
        { frequency: 440, duration: 0.045, volume: 0.03 },
        { frequency: 523.25, duration: 0.055, volume: 0.025, delay: 0.04 },
      ],
    };

    this.playTones(cues[cue]);
  }

  private createContext(): AudioContext {
    const context = new AudioContext();
    const output = context.createGain();
    const ambience = context.createGain();
    const lowPass = context.createBiquadFilter();
    const pulse = context.createOscillator();
    const pulseGain = context.createGain();

    output.gain.value = 0;
    output.connect(context.destination);
    lowPass.type = "lowpass";
    lowPass.frequency.value = 480;
    lowPass.Q.value = 0.6;
    ambience.gain.value = 0.018;
    lowPass.connect(ambience);
    ambience.connect(output);

    for (const frequency of [110, 130.81, 164.81]) {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(lowPass);
      oscillator.start();
    }

    pulse.type = "sine";
    pulse.frequency.value = 0.08;
    pulseGain.gain.value = 0.004;
    pulse.connect(pulseGain);
    pulseGain.connect(ambience.gain);
    pulse.start();

    this.context = context;
    this.output = output;
    return context;
  }

  private playTones(tones: Tone[]): void {
    const context = this.context;
    const output = this.output;

    if (!context || !output) return;

    const now = context.currentTime;
    for (const tone of tones) {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const start = now + (tone.delay ?? 0);
      const end = start + tone.duration;
      const attack = Math.min(0.02, tone.duration / 3);

      oscillator.type = tone.waveform ?? "sine";
      oscillator.frequency.setValueAtTime(tone.frequency, start);
      if (tone.endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(
          tone.endFrequency,
          end
        );
      }

      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(tone.volume, start + attack);
      envelope.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(envelope);
      envelope.connect(output);
      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
      };
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    }
  }
}
