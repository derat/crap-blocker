// Copyright 2019 Daniel Erat. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function filter(details) {
  return { cancel: true };
}

function updateFilter() {
  if (chrome.webRequest.onBeforeRequest.hasListener(filter)) {
    chrome.webRequest.onBeforeRequest.removeListener(filter);
  }

  chrome.storage.sync.get("patterns", (items) => {
    if (!items.patterns) return;
    const patterns = items.patterns.split("\n");
    console.log(`Updating filter to block ${patterns.join(" ")}`);
    chrome.webRequest.onBeforeRequest.addListener(filter, { urls: patterns }, [
      "blocking",
    ]);
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace == "sync" && changes.patterns) updateFilter();
});

updateFilter();
