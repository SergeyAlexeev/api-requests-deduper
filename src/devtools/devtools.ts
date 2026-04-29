// Registers the "Api Requests Deduper" panel in Chrome DevTools.
// The panel HTML path is resolved relative to the extension root.
chrome.devtools.panels.create(
  "Api Requests Deduper",
  "",
  "src/panel/panel.html",
);
