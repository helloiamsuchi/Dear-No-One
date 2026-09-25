(function () {
  'use strict';

  var grid = document.getElementById('envelope-grid');
  var emptyState = document.getElementById('empty-state');

  var modal = document.getElementById('inspect-modal');
  var stage = document.getElementById('inspect-stage');
  var envelope3d = document.getElementById('envelope-3d');
  var letterSlot = document.getElementById('letter-slot');
  var flap = document.getElementById('envelope-flap');
  var letterPaper = document.getElementById('letter-paper');
  var modalTo = document.getElementById('modal-to');
  var modalBody = document.getElementById('modal-body');
  var modalFrom = document.getElementById('modal-from');
  var burnAction = document.getElementById('burn-action');
  var btnBurn = document.getElementById('btn-burn');
  var closeBtn = document.getElementById('close-inspect');
  var emberField = document.getElementById('ember-field');
  var toast = document.getElementById('toast');

  var currentLetter = null;
  var currentCard = null;
  var openTimers = [];
  var toastTimer = null;

  /* ------------------------------- rendering ------------------------------- */

  function renderEnvelopes() {
    var letters = DearNoOneStorage.getLetters();
    grid.innerHTML = '';

    if (letters.length === 0) {
      grid.hidden = true;
      emptyState.hidden = false;
      return;
    }

    grid.hidden = false;
    emptyState.hidden = true;

    letters.forEach(function (letter) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'envelope';
      btn.dataset.id = letter.id;
      btn.setAttribute('aria-label', 'Open a sealed letter');
      btn.innerHTML = '<span class="envelope-seal" aria-hidden="true"><svg><use href="#icon-seal"></use></svg></span>';
      btn.addEventListener('click', function () { openInspection(letter, btn); });
      grid.appendChild(btn);
    });
  }

  /* ---------------------------- opening sequence ---------------------------- */

  function clearOpenTimers() {
    openTimers.forEach(window.clearTimeout);
    openTimers = [];
  }

  function openInspection(letter, cardEl) {
    currentLetter = letter;
    currentCard = cardEl;
    clearOpenTimers();

    modalTo.textContent = 'To: ' + letter.to;
    modalBody.textContent = letter.body;
    modalFrom.textContent = letter.from || 'Anonymous';

    // reset visual state
    flap.classList.remove('is-open');
    letterPaper.classList.remove('is-peeking', 'is-revealed');
    letterSlot.style.overflow = 'hidden';
    envelope3d.classList.remove('is-burning');
    envelope3d.style.filter = '';
    envelope3d.style.opacity = '';
    burnAction.style.opacity = '0';
    burnAction.style.transform = 'translateY(16px)';
    btnBurn.disabled = false;
    btnBurn.classList.remove('is-burning-btn');
    emberField.classList.remove('is-active');
    emberField.innerHTML = '';

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () {
      modal.classList.add('is-open');
    });

    openTimers.push(window.setTimeout(function () {
      flap.classList.add('is-open');
    }, 260));

    openTimers.push(window.setTimeout(function () {
      letterPaper.classList.add('is-peeking');
      letterSlot.style.overflow = 'visible';
    }, 620));

    openTimers.push(window.setTimeout(function () {
      letterPaper.classList.add('is-revealed');
      burnAction.style.opacity = '1';
      burnAction.style.transform = 'translateY(0)';
    }, 1300));
  }

  function closeInspection() {
    clearOpenTimers();
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    letterPaper.classList.remove('is-peeking', 'is-revealed');
    window.setTimeout(function () {
      modal.hidden = true;
      currentLetter = null;
      currentCard = null;
    }, 450);
  }

  /* ----------------------------- burn sequence ------------------------------ */

  function spawnEmbers() {
    var rect = envelope3d.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    var flare = document.createElement('div');
    flare.className = 'ember-core-flare';
    emberField.appendChild(flare);

    var count = 28;
    for (var i = 0; i < count; i++) {
      (function () {
        var size = 3 + Math.random() * 7;
        var isEmber = Math.random() > 0.35;
        var startX = cx + (Math.random() - 0.5) * rect.width * 0.9;
        var startY = cy + (Math.random() - 0.5) * rect.height * 0.6;
        var driftX = (Math.random() - 0.5) * 220;
        var riseY = 180 + Math.random() * 260;

        var p = document.createElement('div');
        p.className = 'ember';
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = startX + 'px';
        p.style.top = startY + 'px';
        p.style.background = isEmber ? '#ff8a3d' : '#2a1712';
        p.style.boxShadow = isEmber ? '0 0 10px rgba(255,170,0,0.85)' : 'none';
        emberField.appendChild(p);

        window.setTimeout(function () {
          p.style.transform = 'translate(' + driftX + 'px,' + (-riseY) + 'px) rotate(' + (Math.random() * 200 - 100) + 'deg) scale(' + (0.2 + Math.random() * 0.4) + ')';
          p.style.opacity = '0';
        }, 30);

        window.setTimeout(function () {
          if (p.parentNode) p.parentNode.removeChild(p);
        }, 1750);
      })();
    }

    window.setTimeout(function () {
      if (flare.parentNode) flare.parentNode.removeChild(flare);
    }, 1700);
  }

  function burnLetter() {
    if (!currentLetter) return;
    var letterId = currentLetter.id;
    var cardEl = currentCard;

    btnBurn.disabled = true;
    burnAction.style.transition = 'opacity 0.4s ease';
    burnAction.style.opacity = '0';

    emberField.classList.add('is-active');
    spawnEmbers();

    envelope3d.classList.add('is-burning');

    window.setTimeout(function () {
      DearNoOneStorage.deleteLetter(letterId);

      if (cardEl) {
        cardEl.classList.add('is-removing');
        window.setTimeout(function () {
          if (cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
          if (grid.children.length === 0) {
            grid.hidden = true;
            emptyState.hidden = false;
          }
        }, 500);
      }

      closeInspection();
      showToast();
    }, 1650);
  }

  /* ---------------------------------- toast ---------------------------------- */

  function showToast() {
    if (toastTimer) window.clearTimeout(toastTimer);
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 3600);
  }

  /* ---------------------------------- wiring ---------------------------------- */

  closeBtn.addEventListener('click', closeInspection);
  btnBurn.addEventListener('click', burnLetter);

  modal.addEventListener('click', function (evt) {
    if (evt.target === modal) closeInspection();
  });

  document.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape' && modal.classList.contains('is-open')) {
      closeInspection();
    }
  });

  modal.hidden = true;
  renderEnvelopes();
})();