// Copyright 2019 Daniel Erat. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function $(id) {
  return document.getElementById(id);
}

// (Very loosely) matches Chrome match patterns as described at
// https://developer.chrome.com/docs/extensions/mv3/match_patterns/.
const matchPatternRegexp = new RegExp(
  "^" +
    /([a-z]+|\*):\/\//.source + // scheme
    /[-.0-9a-z*]+/.source + // host
    /\/.*/.source // path
);

// Matches hostnames, e.g. 'example.com' or 'sub-domain.example.co.uk'.
const hostRegexp = /^[-.0-9a-z]+$/;

function saveOptions() {
  const lines = $("patterns-textarea").value.split("\n");
  const patterns = [];
  for (var i = 0; i < lines.length; i++) {
    var pattern = lines[i].trim();
    if (!pattern) continue;

    if (hostRegexp.test(pattern)) pattern = `*://*.${pattern}/*`;

    if (matchPatternRegexp.test(pattern)) patterns.push(pattern);
    else console.warn(`Skipping invalid pattern "${pattern}"`);
  }
  const value = patterns.sort().join("\n");
  chrome.storage.sync.set({ patterns: value }, (items) => {
    $("patterns-textarea").value = value;
    $("save-button").disabled = true;
  });
}

function restoreOptions() {
  chrome.storage.sync.get("patterns", (items) => {
    $("patterns-textarea").value = items.patterns || "";
    $("save-button").disabled = true;
  });
}

function textareaChanged() {
  $("save-button").disabled = false;
}

document.addEventListener("DOMContentLoaded", restoreOptions);
$("save-button").addEventListener("click", saveOptions);
$("patterns-textarea").addEventListener("change", textareaChanged);
$("patterns-textarea").addEventListener("keyup", textareaChanged);
$("patterns-textarea").addEventListener("paste", textareaChanged);
