// Copyright 2019 Daniel Erat. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Rule IDs for chrome.declarativeNetRequest.
const domainsRuleId = 1;
const regexpsStartRuleId = 2;

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

async function updateRules() {
  const items = await chrome.storage.sync.get(['domains', 'regexps']);
  const addRules = [];

  if (items.domains) {
    addRules.push({
      action: { type: 'block' },
      condition: { requestDomains: items.domains.split('\n'), resourceTypes },
      id: domainsRuleId,
    });
  }

  if (items.regexps) {
    await Promise.all(
      items.regexps.split('\n').map(async (regex, idx) =>
        chrome.declarativeNetRequest.isRegexSupported({ regex }).then((res) => {
          if (!res.isSupported) {
            console.log(`Unsupported regexp "${re}": ${res.reason}`);
            return;
          }
          addRules.push({
            action: { type: 'block' },
            condition: { regexFilter: regex, resourceTypes },
            id: regexpsStartRuleId + idx,
          });
        })
      )
    );
  }

  // The existing rules need to be removed to prevent duplicate ID errors.
  // Remove them unconditionally in case prefs were cleared.
  const removeRuleIds = (
    await chrome.declarativeNetRequest.getDynamicRules()
  ).map((rule) => rule.id);

  console.log('Updating rules:');
  addRules.forEach((rule) => {
    console.log(
      `${rule.id}: ` +
        (rule.condition.requestDomains
          ? rule.condition.requestDomains.join(', ')
          : rule.condition.regexFilter)
    );
  });
  chrome.declarativeNetRequest
    .updateDynamicRules({ addRules, removeRuleIds })
    .then(() => console.log('Updated rules'));
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.domains || changes.regexps)) {
    updateRules();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  updateRules();
});
