// when the extension is first installed, set default values
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set(
    {
      siteList: [],
    },
    function () {}
  );
});

// set up initial chrome storage values
var siteList = [];

chrome.storage.sync.get(['siteList'], function (result) {
  siteList = result.siteList;
});

// any time a storage item is updated, update global variables
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === 'sync') {
    if (changes.siteList) {
      siteList = changes.siteList.newValue;
    }
  }
});
