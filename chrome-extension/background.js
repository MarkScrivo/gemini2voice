// Enable side panel when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Set default side panel options
  chrome.sidePanel.setOptions({
    enabled: true,
    path: 'sidebar.html'
  });
});
