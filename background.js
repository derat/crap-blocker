// Copyright 2019 Daniel Erat. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Rule IDs for chrome.declarativeNetRequest.
const domainsRuleId = 1;
const regexpsRuleId = 2;

// The full list of resource types from
// https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-ResourceType.
// Annoyingly, this is needed to match resources loaded in main_frame (i.e. URLs
// typed into the omnibox): "Only one of resourceTypes and excludedResourceTypes
// should be specified. If neither of them is specified, all resource types
// except "main_frame" are blocked."
const resourceTypes = [
  'main_frame',
  'sub_frame',
  'stylesheet',
  'script',
  'image',
  'font',
  'object',
  'xmlhttprequest',
  'ping',
  'csp_report',
  'media',
  'websocket',
  'webtransport',
  'webbundle',
  'other',
];

function updateRules() {
  chrome.storage.sync.get(['domains', 'regexps'], async (items) => {
    // The existing rules need to be removed to prevent duplicate ID errors.
    // Remove them unconditionally in case prefs were cleared.
    const addRules = [];
    const removeRuleIds = [domainsRuleId, regexpsRuleId];

    if (items.domains) {
      addRules.push({
        action: { type: 'block' },
        condition: { requestDomains: items.domains.split('\n'), resourceTypes },
        id: domainsRuleId,
      });
    }

    if (items.regexps) {
      const re = items.regexps.split('\n').join('|');
      const req = { regex: re };
      await chrome.declarativeNetRequest.isRegexSupported(req).then((res) => {
        if (!res.isSupported) {
          console.log(`Unsupported regexp "${re}": ${res.reason}`);
          return;
        }
        addRules.push({
          action: { type: 'block' },
          condition: { regexFilter: re, resourceTypes },
          id: regexpsRuleId,
        });
      });
    }

    console.log(`Updating rules: ${JSON.stringify(addRules)}`);
    chrome.declarativeNetRequest
      .updateDynamicRules({ addRules, removeRuleIds })
      .then(() => console.log('Updated rules'));
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.domains || changes.regexps)) {
    updateRules();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  updateRules();
});
