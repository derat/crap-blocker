// Copyright 2019 Daniel Erat. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const $ = (id) => document.getElementById(id);

async function savePrefs() {
  const domains = $('domains-textarea')
    .value.split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .sort()
    .join('\n');

  const regexps = await $('regexps-textarea')
    .value.split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .sort()
    .join('\n');

  // Validate the joined regexp. This matches the logic in background.js.
  const req = { regex: regexps.split('\n').join('|') };
  const res = await chrome.declarativeNetRequest.isRegexSupported(req);
  if (!res.isSupported) {
    $('error-span').innerText = `Joined regexp unsupported: ${res.reason}`;
    return;
  }

  chrome.storage.sync.set({ domains, regexps }, () => {
    $('domains-textarea').value = domains;
    $('regexps-textarea').value = regexps;
    $('save-button').disabled = true;
    $('error-span').innerText = '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const saveButton = $('save-button');
  saveButton.addEventListener('click', savePrefs);

  const textareaChanged = () => (saveButton.disabled = false);
  const addListeners = (el) => {
    el.addEventListener('change', textareaChanged);
    el.addEventListener('keyup', textareaChanged);
    el.addEventListener('paste', textareaChanged);
  };

  const domainsTextarea = $('domains-textarea');
  const regexpsTextarea = $('regexps-textarea');
  addListeners(domainsTextarea);
  addListeners(regexpsTextarea);

  chrome.storage.sync.get(['domains', 'regexps'], (items) => {
    domainsTextarea.value = items.domains || '';
    regexpsTextarea.value = items.regexps || '';
  });
});
