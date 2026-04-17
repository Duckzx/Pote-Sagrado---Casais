// Helper utilities for Audio and Haptics

export const playCoinSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // A pleasant "ding" similar to a coin
    oscillator.type = 'sine';
    
    // Main chime frequency and slide
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.08); 

    // Smooth envelope (attack and release)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.45);
  } catch (e) {
    // Gracefully ignore if browser blocks audio
  }
};

export const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    
    // First chime
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(900, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0, audioCtx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.2);

    // Second chime (higher, delayed)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400, audioCtx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.1);
    gain2.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.1);
    osc2.stop(audioCtx.currentTime + 0.4);

  } catch (e) {
    // Ignore
  }
};

export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
};
