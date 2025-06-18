document.addEventListener('DOMContentLoaded', function() {
  const enableFilter = document.getElementById('enableFilter');
  const blockAirIndia = document.getElementById('blockAirIndia');
  const blockBoeing737 = document.getElementById('blockBoeing737');
  const status = document.getElementById('status');
  const filterList = document.getElementById('filterList');
  const filteredCount = document.getElementById('filteredCount');
  const refreshBtn = document.getElementById('refreshBtn');
  
  // Load saved settings
  chrome.storage.sync.get([
    'filterEnabled', 
    'airIndiaBlocked', 
    'boeing737Blocked', 
    'totalFiltered'
  ], function(result) {
    enableFilter.checked = result.filterEnabled !== false;
    blockAirIndia.checked = result.airIndiaBlocked !== false;
    blockBoeing737.checked = result.boeing737Blocked !== false;
    filteredCount.textContent = result.totalFiltered || 0;
    updateStatus();
    updateFilterList();
  });
  
  // Handle main toggle
  enableFilter.addEventListener('change', function() {
    chrome.storage.sync.set({filterEnabled: enableFilter.checked});
    updateStatus();
    notifyContentScript();
  });
  
  // Handle Air India toggle
  blockAirIndia.addEventListener('change', function() {
    chrome.storage.sync.set({airIndiaBlocked: blockAirIndia.checked});
    updateFilterList();
    notifyContentScript();
  });
  
  // Handle Boeing 737 toggle
  blockBoeing737.addEventListener('change', function() {
    chrome.storage.sync.set({boeing737Blocked: blockBoeing737.checked});
    updateFilterList();
    notifyContentScript();
  });
  
  // Handle refresh button
  refreshBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.reload(tabs[0].id);
      window.close();
    });
  });
  
  function updateStatus() {
    const isActive = enableFilter.checked;
    status.textContent = isActive ? '✅ Active - Filtering Flights' : '❌ Disabled';
    status.className = isActive ? 'status active' : 'status disabled';
  }
  
  function updateFilterList() {
    const filters = [];
    if (blockAirIndia.checked) filters.push('Air India flights');
    if (blockBoeing737.checked) filters.push('Boeing 737 aircraft');
    
    filterList.innerHTML = filters.length > 0 
      ? filters.map(filter => `<li>${filter}</li>`).join('')
      : '<li>No filters active</li>';
  }
  
  function notifyContentScript() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateSettings',
        settings: {
          filterEnabled: enableFilter.checked,
          airIndiaBlocked: blockAirIndia.checked,
          boeing737Blocked: blockBoeing737.checked
        }
      }).catch(() => {
        // Ignore errors if content script not available
      });
    });
  }
  
  // Update filtered count periodically
  setInterval(() => {
    chrome.storage.sync.get(['totalFiltered'], (result) => {
      filteredCount.textContent = result.totalFiltered || 0;
    });
  }, 2000);
});
