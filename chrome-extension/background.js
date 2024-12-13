// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Toggle the side panel
  chrome.sidePanel.toggle();
});
