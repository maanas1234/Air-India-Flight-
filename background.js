chrome.runtime.onInstalled.addListener(() => {
  console.log('Flight Filter Extension: Installed successfully');
  
  // Set default settings
  chrome.storage.sync.set({
    filterEnabled: true,
    airIndiaBlocked: true,
    boeing737Blocked: true,
    totalFiltered: 0
  });
});

// Listen for tab updates to ensure content script runs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && 
      (tab.url.includes('flight') || tab.url.includes('travel') || 
       tab.url.includes('booking') || tab.url.includes('kayak') ||
       tab.url.includes('expedia') || tab.url.includes('google.com/travel'))) {
    
    // Re-inject content script for flight booking sites
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
      // Ignore errors for pages where we can't inject
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const filtered = document.querySelectorAll('[data-flight-filtered="true"]');
      alert(`Flight Filter Active: ${filtered.length} flights currently hidden`);
    }
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateFilterCount') {
    chrome.storage.sync.get(['totalFiltered'], (result) => {
      const newTotal = (result.totalFiltered || 0) + 1;
      chrome.storage.sync.set({ totalFiltered: newTotal });
    });
  }
});
