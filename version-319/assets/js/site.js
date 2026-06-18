(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    var cats = document.querySelector("[data-mobile-cats]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (cats) {
        cats.classList.toggle("is-open", open);
      }
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-section]").forEach(function (section) {
      var input = section.querySelector("[data-filter-input]");
      var chips = Array.prototype.slice.call(section.querySelectorAll("[data-filter-chip]"));
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
      var active = "";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
          var category = card.getAttribute("data-category") || "";
          var matchedQuery = !query || text.indexOf(query) !== -1;
          var matchedChip = !active || text.indexOf(active.toLowerCase()) !== -1 || category === active;
          card.hidden = !(matchedQuery && matchedChip);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          active = chip.getAttribute("data-filter-chip") || "";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector("[data-play]");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;

      function start() {
        if (!video || !stream) {
          return;
        }
        player.classList.add("is-playing");
        if (trigger) {
          trigger.hidden = true;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.src) {
            video.src = stream;
          }
        } else if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          }
        } else if (!video.src) {
          video.src = stream;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener("click", start);
      }
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        if (trigger) {
          trigger.hidden = true;
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initFilters();
    initPlayers();
  });
})();
