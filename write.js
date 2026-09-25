(function () {
  'use strict';

  var inputTo = document.getElementById('letter-to');
  var inputFrom = document.getElementById('letter-from');
  var textarea = document.getElementById('letter-body');
  var wordCountEl = document.getElementById('word-count');
  var charCountEl = document.getElementById('char-count');
  var btnClear = document.getElementById('btn-clear');
  var btnSeal = document.getElementById('btn-seal');
  var sealModal = document.getElementById('seal-modal');

  function updateCounts() {
    var text = textarea.value;
    var chars = text.length;
    var words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    charCountEl.textContent = chars + ' character' + (chars === 1 ? '' : 's');
    wordCountEl.textContent = words + ' word' + (words === 1 ? '' : 's');
  }

  function hasDraft() {
    return Boolean(inputTo.value.trim() || inputFrom.value.trim() || textarea.value.trim());
  }

  function resetForm() {
    inputTo.value = '';
    inputFrom.value = '';
    textarea.value = '';
    inputTo.classList.remove('field--invalid');
    textarea.classList.remove('field--invalid');
    updateCounts();
  }

  function flashInvalid(el) {
    el.classList.add('field--invalid');
    el.addEventListener('input', function clear() {
      el.classList.remove('field--invalid');
      el.removeEventListener('input', clear);
    });
  }

  function openSealModal() {
    sealModal.classList.add('is-open');
    sealModal.setAttribute('aria-hidden', 'false');
  }

  function closeSealModal() {
    sealModal.classList.remove('is-open');
    sealModal.setAttribute('aria-hidden', 'true');
  }

  textarea.addEventListener('input', updateCounts);

  btnClear.addEventListener('click', function () {
    if (!hasDraft()) return;
    var confirmed = window.confirm('Discard this draft into the wastebasket?');
    if (confirmed) {
      resetForm();
      inputTo.focus();
    }
  });

  btnSeal.addEventListener('click', function () {
    var toValue = inputTo.value.trim();
    var bodyValue = textarea.value.trim();

    if (!toValue) {
      flashInvalid(inputTo);
      inputTo.focus();
      return;
    }
    if (!bodyValue) {
      flashInvalid(textarea);
      textarea.focus();
      return;
    }

    DearNoOneStorage.addLetter({
      to: toValue,
      from: inputFrom.value.trim(),
      body: bodyValue
    });

    openSealModal();

    window.setTimeout(function () {
      closeSealModal();
      resetForm();
      inputTo.focus();
    }, 2200);
  });

  sealModal.addEventListener('click', function (evt) {
    if (evt.target === sealModal) closeSealModal();
  });

  document.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape' && sealModal.classList.contains('is-open')) {
      closeSealModal();
    }
  });

  updateCounts();
})();