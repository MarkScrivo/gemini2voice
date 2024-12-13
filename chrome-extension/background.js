// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Show the side panel
  chrome.sidePanel.setOptions({
    enabled: true,
    path: 'sidebar.html'
  }).then(() => {
    // The panel will be shown automatically when enabled
    console.log('Side panel enabled');
  }).catch((error) => {
    console.error('Error showing side panel:', error);
  });
});
