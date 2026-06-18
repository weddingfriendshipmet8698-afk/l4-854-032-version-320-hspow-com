(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let active = 0;

    const show = function (index) {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    setInterval(function () {
      show(active + 1);
    }, 5000);
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const buttons = Array.from(scope.querySelectorAll('[data-filter-value]'));
    const cards = Array.from(scope.querySelectorAll('[data-filter-card]'));
    const empty = scope.querySelector('.filter-empty');
    let activeValue = '';

    const run = function () {
      const query = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        const matchedQuery = !query || text.indexOf(query) !== -1;
        const matchedValue = !activeValue || text.indexOf(activeValue) !== -1;
        const matched = matchedQuery && matchedValue;
        card.style.display = matched ? '' : 'none';
        if (matched) visible += 1;
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    if (input) {
      input.addEventListener('input', run);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeValue = (button.getAttribute('data-filter-value') || '').toLowerCase();
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        run();
      });
    });
  });

  window.setupMoviePlayer = function (source) {
    const video = document.querySelector('[data-player-video]');
    const overlay = document.querySelector('[data-player-overlay]');
    let hlsInstance = null;
    let ready = false;

    if (!video || !source) return;

    const init = function () {
      if (ready) return;
      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    };

    const play = function () {
      init();
      video.controls = true;
      if (overlay) {
        overlay.hidden = true;
      }
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!ready) {
        play();
        return;
      }
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
