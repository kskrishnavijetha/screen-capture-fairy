chrome.runtime.onInstalled.addListener(() => {
  console.log('Screen Capture Fairy extension installed');
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('recording-')) {
    // Start the recording when the alarm triggers
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'startScheduledRecording' });
      }
    });
  }
});