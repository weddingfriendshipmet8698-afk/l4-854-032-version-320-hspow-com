(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var menu = document.querySelector('.mobile-menu');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var heroSearch = document.querySelector('[data-hero-search]');

  if (heroSearch) {
    heroSearch.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        var value = heroSearch.value.trim();
        var url = 'library.html';

        if (value) {
          url += '?q=' + encodeURIComponent(value);
        }

        window.location.href = url;
      }
    });
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-genre') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function applyFilters(root) {
    var search = root.querySelector('[data-filter-search]');
    var region = root.querySelector('[data-filter-region]');
    var type = root.querySelector('[data-filter-type]');
    var year = root.querySelector('[data-filter-year]');
    var sort = root.querySelector('[data-filter-sort]');
    var container = root.closest('.library-section') || root.parentElement || document;
    var list = container.querySelector('[data-filter-list]');
    var empty = container.querySelector('[data-filter-empty]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);

    if (search && params.get('q')) {
      search.value = params.get('q');
    }

    function update() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matches = true;

        if (query && textOf(card).indexOf(query) === -1) {
          matches = false;
        }

        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          matches = false;
        }

        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          matches = false;
        }

        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          matches = false;
        }

        card.classList.toggle('is-hidden', !matches);

        if (matches) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    function reorder() {
      var mode = sort ? sort.value : 'default';
      var sorted = cards.slice();

      if (mode === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year').match(/\d{4}/) || 0) - Number(a.getAttribute('data-year').match(/\d{4}/) || 0);
        });
      }

      if (mode === 'score') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
        });
      }

      if (mode === 'title') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
      }

      sorted.forEach(function (card) {
        list.appendChild(card);
      });

      update();
    }

    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', update);
        control.addEventListener('change', update);
      }
    });

    if (sort) {
      sort.addEventListener('change', reorder);
    }

    update();
  }

  document.querySelectorAll('[data-filter-root]').forEach(applyFilters);
})();
