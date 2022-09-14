// when the extension is first installed, set default values
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set(
    {
      shortcuts: [],
      shortcutOrder: '',
    },
    function () {}
  );
});

// set up initial chrome storage values
var shortcuts = [];
var shortcutOrder = '';

chrome.storage.sync.get(['shortcuts', 'shortcutOrder'], function (result) {
  shortcuts = result.shortcuts;
  shortcutOrder = result.shortcutOrder;
});

// any time a storage item is updated, update global variables
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === 'sync') {
    if (changes.shortcuts) {
      shortcuts = changes.shortcuts.newValue;
    }
    if (changes.shortcutOrder) {
      shortcutOrder = changes.shortcutOrder.newValue;
    }
  }
});
