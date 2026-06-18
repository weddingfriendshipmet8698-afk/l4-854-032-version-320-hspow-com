(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function() {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function() {
                mobileNav.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function showSlide(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function restart() {
                window.clearInterval(timer);
                timer = window.setInterval(function() {
                    showSlide(index + 1);
                }, 5600);
            }

            dots.forEach(function(dot) {
                dot.addEventListener("click", function() {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function() {
                    showSlide(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function() {
                    showSlide(index + 1);
                    restart();
                });
            }

            restart();
        }

        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        inputs.forEach(function(input) {
            input.addEventListener("input", function() {
                var value = input.value.trim().toLowerCase();
                var scope = input.closest("main") || document;
                var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
                cards.forEach(function(card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-category") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();
                    card.classList.toggle("is-filter-hidden", value && text.indexOf(value) === -1);
                });
            });
        });
    });
})();
