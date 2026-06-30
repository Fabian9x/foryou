/**
 * Envelope reveal + video playback
 * Static site for GitHub Pages — no build step required.
 */

(function () {
  "use strict";

  // Fallback delay if transitionend does not fire — sync with CSS animation total (~1.7s)
  var ENVELOPE_ANIMATION_MS = 1750;
  var VIDEO_FADE_DELAY_MS = 150;
  var OPEN_DELAY_MS = 120;
  var HINT_VISIBLE_MS = 8000;
  var hintHideTimer = null;

  var page = document.getElementById("main");
  var envelope = document.getElementById("envelope");
  var letter = document.getElementById("letter");
  var openBtn = document.getElementById("open-btn");
  var actions = document.getElementById("actions");
  var videoSection = document.getElementById("video-section");
  var video = document.getElementById("main-video");
  var videoFallback = document.getElementById("video-fallback");
  var videoHint = document.getElementById("video-hint");

  var hasOpened = false;
  var hasRevealed = false;
  var revealTimer = null;

  if (!openBtn || !envelope || !videoSection || !video) {
    return;
  }

  function hideButton() {
    openBtn.disabled = true;
    openBtn.setAttribute("aria-hidden", "true");
    actions.classList.add("is-hidden");
  }

  function clearAnimatingState() {
    envelope.classList.remove("is-animating");
    if (letter) {
      letter.style.willChange = "";
    }
  }

  function openEnvelope() {
    envelope.classList.add("is-animating", "is-opening", "is-open");
    envelope.setAttribute("aria-hidden", "false");
  }

  function hideVideoHint() {
    if (!videoHint) {
      return;
    }
    videoHint.classList.remove("is-visible");
    videoHint.classList.add("is-hidden");
    videoHint.setAttribute("aria-hidden", "true");
  }

  function showVideoHint() {
    if (!videoHint) {
      return;
    }
    videoHint.classList.remove("is-hidden");
    videoHint.setAttribute("aria-hidden", "false");
    void videoHint.offsetWidth;
    videoHint.classList.add("is-visible");

    if (hintHideTimer) {
      window.clearTimeout(hintHideTimer);
    }
    hintHideTimer = window.setTimeout(hideVideoHint, HINT_VISIBLE_MS);
  }

  function revealVideo() {
    if (hasRevealed) {
      return;
    }
    hasRevealed = true;

    if (revealTimer) {
      window.clearTimeout(revealTimer);
      revealTimer = null;
    }

    clearAnimatingState();
    envelope.classList.remove("is-opening");
    envelope.classList.add("is-revealed");
    page.classList.add("is-complete");

    videoSection.hidden = false;
    void videoSection.offsetWidth;
    videoSection.classList.add("is-visible");
    showVideoHint();

    window.setTimeout(tryPlayVideo, VIDEO_FADE_DELAY_MS);
  }

  function scheduleReveal() {
    revealTimer = window.setTimeout(revealVideo, ENVELOPE_ANIMATION_MS);
  }

  function onLetterAnimationEnd(event) {
    if (event.animationName === "letter-rise") {
      revealVideo();
    }
  }

  function tryPlayVideo() {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(function () {
        video.setAttribute("controls", "");
      });
    }
  }

  function handleVideoError() {
    video.hidden = true;
    videoFallback.hidden = false;
  }

  function onOpenClick() {
    if (hasOpened) {
      return;
    }
    hasOpened = true;

    hideButton();

    window.setTimeout(function () {
      openEnvelope();
      scheduleReveal();
    }, OPEN_DELAY_MS);
  }

  openBtn.addEventListener("click", onOpenClick);

  if (letter) {
    letter.addEventListener("animationend", onLetterAnimationEnd);
  }

  video.addEventListener("error", handleVideoError);

  video.addEventListener("loadeddata", function () {
    videoFallback.hidden = true;
  });
})();
