/**
 * Haptic Vibration Feedback Utilities
 * Enhances usability and physical response during emergencies
 */

export const triggerHaptic = (pattern: number | number[] = 50) => {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore unsupported browser environments
  }
};

export const hapticPatterns = {
  tap: 30,
  success: [40, 60, 80],
  warning: [100, 50, 100],
  sosTrigger: [200, 100, 200, 100, 400],
  sosCountdown: [150, 100, 150],
  emergencyAlarm: [300, 150, 300, 150, 600],
  incomingCall: [500, 300, 500, 300, 800],
};
