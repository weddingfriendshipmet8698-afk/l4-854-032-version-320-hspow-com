(function () {
  function initNav() {
    var button = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-go]'));
      var next = hero.querySelector('[data-hero-next]');
      var prev = hero.querySelector('[data-hero-prev]');
      var active = 0;
      var timer;

      if (!slides.length) {
        return;
      }

      function show(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (next) {
        next.addEventListener('click', function () {
          show(active + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(active - 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-go') || 0));
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-type-filter]'));
      var empty = scope.querySelector('[data-empty-state]');
      var activeType = '';

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var term = normalize(input ? input.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var data = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' '));
          var type = card.getAttribute('data-type') || '';
          var matchedText = !term || data.indexOf(term) !== -1;
          var matchedType = !activeType || type.indexOf(activeType) !== -1;
          var show = matchedText && matchedType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeType = chip.getAttribute('data-type-filter') || '';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          apply();
        });
      });

      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');
      var state = player.querySelector('[data-play-state]');
      var stream = player.getAttribute('data-stream');
      var started = false;

      if (!video || !button || !stream) {
        return;
      }

      function setState(text) {
        if (state) {
          state.textContent = text || '';
        }
      }

      function play() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setState('点击播放');
          });
        }
      }

      function begin() {
        button.classList.add('is-hidden');
        setState('加载中');

        if (started) {
          play();
          return;
        }

        started = true;

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            maxBufferLength: 30,
            backBufferLength: 30
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setState('');
            play();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setState('播放加载失败，请稍后再试');
            }
          });
          video.__hls = hls;
        } else {
          video.src = stream;
          video.addEventListener('loadedmetadata', function () {
            setState('');
            play();
          }, { once: true });
          play();
        }
      }

      button.addEventListener('click', begin);
      player.addEventListener('click', function (event) {
        if (!started && event.target === player) {
          begin();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
