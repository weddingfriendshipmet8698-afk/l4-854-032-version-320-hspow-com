(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function step(delta) {
            show(index + delta);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                step(1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                step(-1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                step(1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initSearch() {
        var input = document.querySelector('[data-movie-search]');
        var list = document.querySelector('[data-movie-list]');
        if (!input || !list) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (q) {
            input.value = q;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        function apply() {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-type'),
                    card.textContent
                ].join(' ').toLowerCase();
                card.classList.toggle('hidden-card', value && haystack.indexOf(value) === -1);
            });
        }

        input.addEventListener('input', apply);
        apply();
    }

    function initPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-video-url]'));
        boxes.forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.player-start');
            var source = box.getAttribute('data-video-url');
            var bound = false;

            if (!video || !source) {
                return;
            }

            function hideButton() {
                if (button) {
                    button.classList.add('is-hidden');
                }
            }

            function attach() {
                if (bound) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    bound = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hls = hls;
                    bound = true;
                    return;
                }
                video.src = source;
                bound = true;
            }

            function play() {
                attach();
                hideButton();
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    play();
                });
            }
            box.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                play();
            });
            video.addEventListener('play', hideButton);
            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayers();
    });
})();
