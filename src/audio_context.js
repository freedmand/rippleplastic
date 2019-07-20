let isUnlocked = false;
export function unlock() {
  const aScene = document.getElementsByTagName('a-scene')[0];

  if (isUnlocked) return;

  const myContext = aScene.audioListener.context;
  if (myContext.state == 'suspended') myContext.resume();

  // create empty buffer and play it
  const buffer = myContext.createBuffer(1, 1, 22050);
  const source = myContext.createBufferSource();
  source.buffer = buffer;
  source.connect(myContext.destination);
  source.start();

  // by checking the play state after some time, we know if we're really unlocked
  setTimeout(function() {
    if (
      source.playbackState === source.PLAYING_STATE ||
      source.playbackState === source.FINISHED_STATE
    ) {
      isUnlocked = true;
    }
  }, 0);
}
