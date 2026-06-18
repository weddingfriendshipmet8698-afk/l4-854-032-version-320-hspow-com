(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        start();
    }

    function setupFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll('.js-filter-list'));
        if (!lists.length) {
            return;
        }
        var input = document.querySelector('.js-filter-input');
        var region = document.querySelector('.js-filter-region');
        var year = document.querySelector('.js-filter-year');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var query = normalize(input && input.value);
            var selectedRegion = normalize(region && region.value);
            var selectedYear = normalize(year && year.value);
            lists.forEach(function (list) {
                Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !selectedRegion || cardRegion.indexOf(selectedRegion) !== -1;
                    var matchesYear = !selectedYear || cardYear === selectedYear;
                    card.classList.toggle('is-hidden-by-filter', !(matchesQuery && matchesRegion && matchesYear));
                });
            });
        }

        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    function setupPlayers() {
        Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.play-overlay');
            var stream = shell.getAttribute('data-stream');
            var initialized = false;
            var hlsInstance = null;

            if (!video || !stream) {
                return;
            }

            function bindStream() {
                if (initialized) {
                    return;
                }
                initialized = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                bindStream();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
