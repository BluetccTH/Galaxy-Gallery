// @ts-ignore
import stayAtYourHouseUrl from "./assets/audio/I Really Want to Stay at Your House.mp3";

class CosmicAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;

  constructor() {
    // Instantiate lazily in start() to comply with browser restrictions and SSR safety
  }

  public start() {
    if (this.isPlaying) return;

    try {
      if (!this.audio) {
        this.audio = new Audio(stayAtYourHouseUrl);
        this.audio.loop = true;
      }
      this.audio.play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch((err) => {
          console.error("Audio playback failed", err);
        });
    } catch (e) {
      console.error("Failed to start audio engine", e);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
    }
  }

  public setVolume(val: number) {
    if (this.audio) {
      this.audio.volume = val;
    }
  }
}

export const cosmicAudio = new CosmicAudioEngine();
