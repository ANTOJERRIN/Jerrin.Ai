(() => {
  const reels = [
    ['argon', 'Argon analysis'],
    ['claude', 'Claude Fable 5.2'],
    ['gemini', 'Gemini 4 Carbon'],
    ['spiral', 'Spiral'],
    ['muse', 'Meta Muse'],
    ['evolution', 'AI Evolution']
  ];
  const directory = './media/reels/';
  const backdrop = document.getElementById('hero-reels');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const player = document.getElementById('showreel-video');
  const dialog = document.getElementById('showreel');
  const gallery = document.getElementById('reel-gallery');
  const playlist = document.getElementById('showreel-list');
  let selected = 0;

  function syncBackdrop() {
    for (const video of backdrop.children) {
      if (document.hidden || dialog.open) video.pause();
      else video.play().catch(() => {});
    }
  }

  function buildBackdrop() {
    const count = mobile.matches ? 2 : 3;
    backdrop.replaceChildren();
    backdrop.hidden = reducedMotion.matches || Boolean(navigator.connection?.saveData);
    if (backdrop.hidden) return;
    for (let lane = 0; lane < count; lane++) {
      const video = document.createElement('video');
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'none';
      let index = lane;
      const setSource = () => {
        video.src = directory + reels[index][0] + '-loop.mp4';
      };
      video.addEventListener('ended', () => {
        index = (index + count) % reels.length;
        setSource();
        syncBackdrop();
      });
      setSource();
      backdrop.append(video);
    }
    syncBackdrop();
  }

  function playReel(index) {
    selected = index;
    const [file, title] = reels[index];
    player.src = directory + file + '.mp4';
    player.poster = directory + file + '.webp';
    player.setAttribute('aria-label', title);
    for (const [i, button] of Array.from(playlist.children).entries()) {
      button.setAttribute('aria-pressed', String(i === index));
    }
    if (!dialog.open) dialog.showModal();
    syncBackdrop();
    player.play().catch(() => {});
  }

  for (const [index, [file, title]] of reels.entries()) {
    const card = document.createElement('button');
    card.className = 'reel-card glass-card';
    card.type = 'button';
    const poster = document.createElement('img');
    poster.src = directory + file + '.webp';
    poster.alt = '';
    poster.loading = 'lazy';
    const label = document.createElement('span');
    label.textContent = title;
    card.append(poster, label);
    let preview;
    const stopPreview = () => {
      if (!preview) return;
      preview.pause();
      preview.remove();
      preview = undefined;
    };
    card.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches || navigator.connection?.saveData) return;
      preview = document.createElement('video');
      preview.src = directory + file + '-loop.mp4';
      preview.muted = true;
      preview.playsInline = true;
      preview.loop = true;
      preview.setAttribute('aria-hidden', 'true');
      card.append(preview);
      preview.play().catch(stopPreview);
    });
    card.addEventListener('pointerleave', stopPreview);
    card.addEventListener('click', () => {
      stopPreview();
      playReel(index);
    });
    gallery.append(card);

    const track = document.createElement('button');
    track.className = 'btn btn-secondary';
    track.type = 'button';
    track.textContent = title;
    track.addEventListener('click', () => playReel(index));
    playlist.append(track);
  }

  document.getElementById('play-showreel').addEventListener('click', () => playReel(0));
  player.addEventListener('ended', () => {
    if (selected + 1 < reels.length) playReel(selected + 1);
  });
  dialog.addEventListener('close', () => {
    player.pause();
    syncBackdrop();
  });
  player.addEventListener('contextmenu', event => event.preventDefault());
  document.addEventListener('visibilitychange', syncBackdrop);
  reducedMotion.addEventListener('change', buildBackdrop);
  mobile.addEventListener('change', buildBackdrop);
  buildBackdrop();

  const filters = document.getElementById('work-filters');
  const cards = Array.from(document.querySelectorAll('#projects .project-card'));
  const detail = document.getElementById('project-detail');
  const detailBody = document.getElementById('project-detail-body');
  const category = card => card.querySelector('.project-tag').textContent;
  for (const label of ['All Work', ...new Set(cards.map(category))]) {
    const button = document.createElement('button');
    button.className = 'btn btn-secondary';
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(label === 'All Work'));
    button.addEventListener('click', () => {
      for (const filter of filters.children) filter.setAttribute('aria-pressed', String(filter === button));
      cards.forEach(card => { card.hidden = label !== 'All Work' && category(card) !== label; });
    });
    filters.append(button);
  }
  filters.hidden = false;
  for (const card of cards) {
    const button = document.createElement('button');
    button.className = 'btn btn-secondary project-details-button';
    button.type = 'button';
    button.textContent = 'View project';
    button.setAttribute('aria-label', 'View project: ' + card.querySelector('h3').textContent);
    button.addEventListener('click', () => {
      const expanded = card.cloneNode(true);
      expanded.querySelector('.project-details-button').remove();
      expanded.querySelector('h3').id = 'project-detail-title';
      detailBody.replaceChildren(expanded);
      detail.showModal();
    });
    card.append(button);
  }
})();
