// @ts-ignore
import stayAtYourHouseUrl from "./assets/audio/I Really Want to Stay at Your House - Lofi.mp3";

class CosmicAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private playPromise: Promise<void> | null = null;

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
      this.isPlaying = true;
      this.playPromise = this.audio.play();
      this.playPromise
        .then(() => {
          this.playPromise = null;
          // If we stopped while it was resolving, pause it now
          if (!this.isPlaying && this.audio) {
            this.audio.pause();
          }
        })
        .catch((err) => {
          this.isPlaying = false;
          this.playPromise = null;
          console.error("Audio playback failed", err);
        });
    } catch (e) {
      this.isPlaying = false;
      console.error("Failed to start audio engine", e);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.audio) {
      if (this.playPromise) {
        // If still pending, pause once it resolves
        this.playPromise
          .then(() => {
            if (!this.isPlaying && this.audio) {
              this.audio.pause();
            }
          })
          .catch(() => {});
      } else {
        this.audio.pause();
      }
    }
  }

  public setVolume(val: number) {
    if (this.audio) {
      this.audio.volume = val;
    }
  }
}

export const cosmicAudio = new CosmicAudioEngine();
