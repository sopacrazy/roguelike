// Procedural Web Audio Sound Synthesizer for Retro Dungeon Crawler
import shadowOfTheCaveUrl from './Shadow of the Cave.mp3';

const MUSIC_VOLUME = 0.5; // 50% - keeps the track from drowning out SFX
const MUSIC_FADE_SECONDS = 2.5; // fade window at the start/end of each loop

class SoundFXManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicEl: HTMLAudioElement | null = null;
  private musicUnlockBound: boolean = false;
  private musicFadeRafId: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.musicEl) {
      this.musicEl.muted = muted;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Background music: starts once when the dungeon loads and loops for the
  // whole run. Browsers block audio.play() until the user has interacted
  // with the page at least once, so if the first attempt is rejected we
  // just retry on the next click/keypress instead of failing silently forever.
  public startMusic() {
    if (this.musicEl) {
      if (this.musicEl.paused) {
        this.musicEl.play().catch(() => {});
      }
      return;
    }

    const audio = new Audio(shadowOfTheCaveUrl);
    audio.loop = true;
    audio.volume = MUSIC_VOLUME;
    audio.muted = this.isMuted;
    this.musicEl = audio;

    // The track cuts abruptly where the loop wraps back to the start.
    // Fading the volume down right before that point and back up right
    // after smooths the seam out instead of an audible hard stop.
    audio.addEventListener('play', () => this.startMusicFadeLoop());

    const tryPlay = () => audio.play().catch(() => {});
    tryPlay();

    if (!this.musicUnlockBound) {
      this.musicUnlockBound = true;
      const unlock = () => tryPlay();
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    }
  }

  private startMusicFadeLoop() {
    if (this.musicFadeRafId !== null) return; // already running

    const step = () => {
      const audio = this.musicEl;
      if (!audio || audio.paused) {
        this.musicFadeRafId = null;
        return;
      }

      const { currentTime, duration } = audio;
      if (duration && isFinite(duration) && duration > MUSIC_FADE_SECONDS * 2) {
        let target = MUSIC_VOLUME;
        if (currentTime < MUSIC_FADE_SECONDS) {
          target = MUSIC_VOLUME * (currentTime / MUSIC_FADE_SECONDS);
        } else if (duration - currentTime < MUSIC_FADE_SECONDS) {
          target = MUSIC_VOLUME * ((duration - currentTime) / MUSIC_FADE_SECONDS);
        }
        audio.volume = Math.max(0, Math.min(MUSIC_VOLUME, target));
      }

      this.musicFadeRafId = requestAnimationFrame(step);
    };

    this.musicFadeRafId = requestAnimationFrame(step);
  }

  // Sword slash whoosh
  public playSlash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Hit impact on enemy (crunchy metal/flesh)
  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  // Player Dash whoosh
  public playDash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // Player takes damage
  public playPlayerHurt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  // Arrow shot
  public playArrowShoot() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Ultimate cast: rising tension riser into a deep release boom, for the
  // arrow rain activation
  public playUltimateCast() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Rising riser (builds tension as the sky darkens)
    const riser = this.ctx.createOscillator();
    const riserGain = this.ctx.createGain();
    riser.type = 'sawtooth';
    riser.frequency.setValueAtTime(120, now);
    riser.frequency.exponentialRampToValueAtTime(900, now + 0.5);
    riserGain.gain.setValueAtTime(0.0001, now);
    riserGain.gain.exponentialRampToValueAtTime(0.16, now + 0.45);
    riserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    riser.connect(riserGain);
    riserGain.connect(this.ctx.destination);
    riser.start(now);
    riser.stop(now + 0.55);

    // Deep release boom (the volley launches)
    const boom = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(180, now + 0.45);
    boom.frequency.exponentialRampToValueAtTime(40, now + 0.85);
    boomGain.gain.setValueAtTime(0.0001, now + 0.45);
    boomGain.gain.exponentialRampToValueAtTime(0.35, now + 0.5);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    boom.connect(boomGain);
    boomGain.connect(this.ctx.destination);
    boom.start(now + 0.45);
    boom.stop(now + 0.9);
  }

  // Enemy death / pop
  public playEnemyDeath() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // Boss attack slam / roar
  public playBossSlam() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  // Boss radial fire
  public playBossCast() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Door lock (heavy clank)
  public playDoorLock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Door unlock (chime + open)
  public playDoorUnlock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    [440, 554, 659].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + i * 0.08);
      osc.stop(this.ctx!.currentTime + i * 0.08 + 0.25);
    });
  }

  // Chest Open Fanfare
  public playChestOpen() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.09);

      gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + i * 0.09);
      osc.stop(this.ctx!.currentTime + i * 0.09 + 0.35);
    });
  }

  // Victory Fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 554, 659, 880, 784, 880];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.12);

      gain.gain.setValueAtTime(0.22, this.ctx!.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + i * 0.12);
      osc.stop(this.ctx!.currentTime + i * 0.12 + 0.4);
    });
  }

  // Game Over jingle
  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [330, 311, 293, 277];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.2);

      gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.2 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + i * 0.2);
      osc.stop(this.ctx!.currentTime + i * 0.2 + 0.5);
    });
  }
}

export const SoundFX = new SoundFXManager();
