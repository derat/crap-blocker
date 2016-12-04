function $(id) { return document.getElementById(id); }

function saveOptions() {
  var lines = $('patterns-textarea').value.split("\n");
  var patterns = [];
  for (var i = 0; i < lines.length; i++) {
    var pattern = lines[i].trim();
    if (pattern)
      patterns.push(pattern);
  }
  var value = patterns.sort().join("\n");

  chrome.storage.sync.set({ patterns: value }, function(items) {
    $('patterns-textarea').value = value;
    $('save-button').disabled = true;
  });
}

function restoreOptions() {
  chrome.storage.sync.get('patterns', function(items) {
    $('patterns-textarea').value = items.patterns ? items.patterns : '';
    $('save-button').disabled = true;
  });
}

function textareaChanged() {
  $('save-button').disabled = false;
}

document.addEventListener('DOMContentLoaded', restoreOptions);
$('save-button').addEventListener('click', saveOptions);
$('patterns-textarea').addEventListener('change', textareaChanged);
$('patterns-textarea').addEventListener('keyup', textareaChanged);
$('patterns-textarea').addEventListener('paste', textareaChanged);
