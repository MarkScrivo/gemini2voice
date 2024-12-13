// Enable side panel when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Set default side panel options
  chrome.sidePanel.setOptions({
    enabled: true
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Show the side panel
  chrome.sidePanel.setOptions({
    enabled: true
  }).then(() => {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }).catch((error) => {
    console.error('Error showing side panel:', error);
  });
});
