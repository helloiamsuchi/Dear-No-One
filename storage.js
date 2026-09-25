/* ==========================================================================
   Dear No One — storage.js
   Small shared data layer over localStorage so letters written on the
   Write page persist and appear on the Read page (and vice versa).
   ========================================================================== */

var DearNoOneStorage = (function () {
  var STORAGE_KEY = 'dearNoOne.letters.v1';

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'letter-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  function getLetters() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Dear No One: could not read saved letters.', err);
      return [];
    }
  }

  function saveLetters(letters) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
      return true;
    } catch (err) {
      console.error('Dear No One: could not save letters.', err);
      return false;
    }
  }

  function addLetter(entry) {
    var letters = getLetters();
    var letter = {
      id: makeId(),
      to: (entry.to || '').trim(),
      from: (entry.from || '').trim(),
      body: (entry.body || '').trim(),
      createdAt: Date.now()
    };
    letters.unshift(letter);
    saveLetters(letters);
    return letter;
  }

  function deleteLetter(id) {
    var letters = getLetters().filter(function (l) { return l.id !== id; });
    saveLetters(letters);
    return letters;
  }

  return {
    getLetters: getLetters,
    addLetter: addLetter,
    deleteLetter: deleteLetter
  };
})();