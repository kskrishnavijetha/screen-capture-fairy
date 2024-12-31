let mediaRecorder;
let recordedChunks = [];
let timerInterval;
let startTime;

function updateTimer() {
  const now = new Date().getTime();
  const diff = now - startTime;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
  document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

function startTimer() {
  startTime = new Date().getTime();
  document.querySelector('.timer').classList.remove('hidden');
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  document.querySelector('.timer').classList.add('hidden');
}

async function startRecording(scheduled = false) {
  try {
    const audioEnabled = document.getElementById('audioToggle').checked;
    const quality = document.getElementById('quality').value;
    
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor',
        frameRate: quality === 'high' ? 60 : quality === 'medium' ? 30 : 15,
      },
      audio: audioEnabled
    });

    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screen-recording-${new Date().toISOString()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    startTimer();
    document.getElementById('startRecording').disabled = true;
    document.getElementById('stopRecording').disabled = false;
    document.getElementById('status').textContent = scheduled ? 'Scheduled Recording in Progress...' : 'Recording...';
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('status').textContent = 'Error starting recording';
  }
}

document.getElementById('startRecording').addEventListener('click', () => startRecording(false));

document.getElementById('stopRecording').addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    stopTimer();
    document.getElementById('startRecording').disabled = false;
    document.getElementById('stopRecording').disabled = true;
    document.getElementById('status').textContent = 'Recording saved';
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startScheduledRecording') {
    startRecording(true);
  }
});