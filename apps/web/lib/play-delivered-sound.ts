const SOUND_SRC = '/audio/delivered-message-sound.mp3';

let audio: HTMLAudioElement | null = null;

export function playDeliveredSound(): void {
  if (!audio) {
    audio = new Audio(SOUND_SRC);
  }

  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
}
