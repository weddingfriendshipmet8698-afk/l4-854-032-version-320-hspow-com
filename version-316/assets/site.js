(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('.menu-toggle');
  if (menuButton) {
    menuButton.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  selectAll('[data-hero]').forEach(function (hero) {
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  });

  selectAll('.js-filter').forEach(function (input) {
    var list = document.querySelector('.filter-list');
    if (!list) {
      return;
    }
    var items = selectAll('.movie-card', list);
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        item.classList.toggle('is-hidden', value && item.textContent.toLowerCase().indexOf(value) === -1);
      });
    });
  });

  selectAll('.player').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var hls = null;
    var ready = false;

    function attach() {
      if (!video || !stream || ready) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        ready = true;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
      } else {
        video.src = stream;
        ready = true;
      }
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });

  var searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot && window.searchIndex) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.getElementById('site-search-input');
    var results = document.getElementById('search-results');

    if (input) {
      input.value = query;
    }

    function render(value) {
      if (!results) {
        return;
      }
      var needle = value.trim().toLowerCase();
      results.innerHTML = '';
      if (!needle) {
        return;
      }
      var matches = window.searchIndex.filter(function (item) {
        return item.text.toLowerCase().indexOf(needle) !== -1;
      }).slice(0, 80);
      matches.forEach(function (item) {
        var link = document.createElement('a');
        link.className = 'movie-card';
        link.href = item.href;
        link.innerHTML = '<span class="poster-wrap"><img src="' + item.cover + '" alt="' + item.title + '" loading="lazy"><span class="score">★ ' + item.score + '</span></span><span class="card-body"><span class="card-title">' + item.title + '</span><span class="card-meta"><em>' + item.label + '</em><em>' + item.year + '</em></span></span>';
        results.appendChild(link);
      });
    }

    render(query);
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }
})();
