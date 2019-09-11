// Copyright 2019 Daniel Erat. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function filter(details) {
  return {cancel: true};
}

function updateFilter() {
  if (chrome.webRequest.onBeforeRequest.hasListener(filter))
    chrome.webRequest.onBeforeRequest.removeListener(filter);

  chrome.storage.sync.get('patterns', function(items) {
    if (items.patterns) {
      var patterns = items.patterns.split("\n");
      console.log('updating filter to block ' + patterns.join(' '));
      chrome.webRequest.onBeforeRequest.addListener(
          filter, {urls: patterns}, ['blocking']);
    }
  });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace == 'sync' && changes.patterns)
    updateFilter();
});

updateFilter();
