const TIMER_MILLISECONDS = 100;
const MULTIPLIER = 1;
const SQUARE_SIDE = Math.floor(20 * Math.sqrt(MULTIPLIER));
const VID_W = Math.floor(720 * MULTIPLIER); //html attributes should be same
const VID_H = Math.floor(560 * MULTIPLIER);
const AUDIO_NEEDED = false; //change muted attribute in index.html too

export {
  TIMER_MILLISECONDS,
  MULTIPLIER,
  SQUARE_SIDE,
  VID_H,
  VID_W,
  AUDIO_NEEDED,
};
