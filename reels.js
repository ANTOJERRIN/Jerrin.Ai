(() => {
  const feed = 'https://raw.githubusercontent.com/ANTOJERRIN/Jerrin.Ai/main/reels.json';
  const profile = 'https://www.instagram.com/codewithjeru/';
  const hero = document.getElementById('hero-reels');
  const motionButton = document.getElementById('reel-motion');
  const player = document.getElementById('latest-reel');
  const placeholder = document.getElementById('reel-placeholder');
  const caption = document.getElementById('reel-caption');
  const controls = document.getElementById('reel-controls');
  const link = document.getElementById('reel-link');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = matchMedia('(max-width: 760px)');
  const saveData = navigator.connection?.saveData;
  let reels = [];
  let selected = 0;
  let playerVisible = false;
  let backgroundPaused = false;
  let autoStarted = false;
  let backgroundSources = [];

  function showReel() {
    const reel = reels[selected];
    if (!reel) return;
    player.pause();
    player.muted = true;
    player.hidden = !reel.media;
    placeholder.hidden = Boolean(reel.media);
    if (reel.media) {
      player.src = reel.media;
    } else {
      player.removeAttribute('src');
      player.load();
    }
    caption.textContent = reel.caption || 'CodeWithJeru reel';
    link.href = reel.permalink;
    link.hidden = false;
    placeholder.querySelector('a').href = reel.permalink;
    controls.hidden = reels.length < 2;
  }

  function selectReel(offset) {
    if (!reels.length) return;
    selected = (selected + offset + reels.length) % reels.length;
    showReel();
    if (!player.hidden) player.play().catch(() => {});
  }

  function startPlayer() {
    if (autoStarted || !playerVisible || player.hidden || reducedMotion.matches ||
        saveData || document.hidden) return;
    autoStarted = true;
    player.play().catch(() => {});
  }

  function updateBackground() {
    if (hero.hidden || backgroundPaused || document.hidden) {
      hero.querySelectorAll('video').forEach(video => video.pause());
      return;
    }
    hero.querySelectorAll('video').forEach(video => video.play().catch(() => {}));
  }

  function buildBackground() {
    const sources = reducedMotion.matches || saveData
      ? []
      : reels.map(reel => reel.media).filter(Boolean).slice(0, smallScreen.matches ? 2 : 3);

    if (sources.join('\n') !== backgroundSources.join('\n')) {
      backgroundSources = sources;
      hero.replaceChildren(...sources.map(src => {
        const video = document.createElement('video');
        video.src = src;
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.preload = 'none';
        return video;
      }));
    }
    hero.hidden = sources.length === 0;
    motionButton.hidden = hero.hidden;
    updateBackground();
  }

  function safeMedia(value) {
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' &&
          /(?:^|\.)(?:cdninstagram\.com|fbcdn\.net)$/.test(url.hostname)) return url.href;
    } catch {}
    return '';
  }

  async function refresh() {
    if (document.hidden) return;
    try {
      const response = await fetch(feed, { cache: 'no-cache' });
      if (!response.ok) return;
      const data = await response.json();
      const updated = data.reels
        .filter(reel => /^https:\/\/www\.instagram\.com\/reels?\/[\w-]+\/?$/.test(reel.permalink))
        .map(reel => ({ ...reel, media: safeMedia(reel.media) }));
      if (JSON.stringify(updated) === JSON.stringify(reels)) return;
      const previous = reels[selected];
      const retained = previous ? updated.findIndex(reel => reel.permalink === previous.permalink) : -1;
      const playing = !player.paused && !player.hidden;
      reels = updated;
      selected = retained >= 0 && playing ? retained : 0;
      if (!reels.length) {
        player.pause();
        player.removeAttribute('src');
        player.load();
        player.hidden = controls.hidden = link.hidden = true;
        placeholder.hidden = false;
        placeholder.querySelector('a').href = profile;
        caption.textContent = 'Find the newest videos on Instagram.';
      } else if (!previous || previous.permalink !== reels[selected].permalink ||
          previous.media !== reels[selected].media || previous.caption !== reels[selected].caption) {
        showReel();
        if (playing && playerVisible && !player.hidden) player.play().catch(() => {});
      }
      controls.hidden = reels.length < 2;
      buildBackground();
      startPlayer();
    } catch {
      // Keep the current playlist when a refresh fails.
    }
  }

  motionButton.addEventListener('click', () => {
    backgroundPaused = !backgroundPaused;
    motionButton.textContent = backgroundPaused ? 'Play background reels' : 'Pause background reels';
    updateBackground();
  });
  document.getElementById('reel-prev').addEventListener('click', () => selectReel(-1));
  document.getElementById('reel-next').addEventListener('click', () => selectReel(1));
  player.addEventListener('ended', () => {
    if (reels.length > 1 && playerVisible) selectReel(1);
  });
  player.addEventListener('error', () => {
    player.hidden = true;
    placeholder.hidden = false;
  });
  const observer = new IntersectionObserver(([entry]) => {
    playerVisible = entry.isIntersecting;
    if (!playerVisible) player.pause();
    startPlayer();
  }, { threshold: 0.25 });
  observer.observe(document.querySelector('.reel-widget'));
  reducedMotion.addEventListener('change', buildBackground);
  smallScreen.addEventListener('change', buildBackground);
  document.addEventListener('visibilitychange', () => {
    updateBackground();
    if (document.hidden) player.pause();
    else refresh();
  });
  refresh();
  setInterval(refresh, 5 * 60 * 1000);
})();
