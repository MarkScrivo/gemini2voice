// Function to open side panel
async function openSidePanel() {
  try {
    // First enable the side panel
    await chrome.sidePanel.setOptions({
      enabled: true
    });
    
    // Then get the current window
    const currentWindow = await chrome.windows.getCurrent();
    
    // Show the side panel in the current window
    await chrome.sidePanel.open({ windowId: currentWindow.id });
  } catch (error) {
    console.error('Error opening side panel:', error);
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  openSidePanel();
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    openSidePanel();
  }
});
