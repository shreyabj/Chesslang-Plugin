// Background service worker for TrainerDB Enhanced Experience
console.log('🚀 TrainerDB Enhanced Experience - Background script loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'trainerAdded') {
    // Notify popup that a trainer was added
    console.log('Trainer added notification received');
    sendResponse({ success: true });
  }
  
  if (request.action === 'statsUpdated') {
    // Stats updated from content script
    console.log('Stats updated notification received');
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async responses
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('TrainerDB Enhanced Experience installed successfully');
  
  // Initialize storage
  chrome.storage.local.set({ 
    trainers: [],
    stats: { brokenLinks: 0, fixedButtons: 0 }
  });
});
