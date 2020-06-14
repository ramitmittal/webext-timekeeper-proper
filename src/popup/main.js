
import browser from 'webextension-polyfill'
import timerStates from '../common/timerStates'

const btnStart = document.querySelector('#btn-start')
const btnStop = document.querySelector('#btn-stop')
const btnLap = document.querySelector('#btn-lap')
const btnResume = document.querySelector('#btn-resume')
const btnReset = document.querySelector('#btn-reset')

const lapListDiv = document.querySelector('#lap-list')
const initialButtonsDiv = document.querySelector('#initial-buttons')
const runningButtonsDiv = document.querySelector('#running-buttons')
const stoppedButtonsDiv = document.querySelector('#stopped-buttons')

const totalTimeDisplay = document.querySelector('#total-time')
const lapTimeDisplay = document.querySelector('#lap-time')

function formatTime (time, separator = ' : ') {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  const paddedTimeElements = [hours, minutes, seconds]
    .map(x => String(x).padStart(2, 0))
  return paddedTimeElements.join(separator)
}
function updateTimerDisplay (totalTime, currentLapTime) {
  totalTimeDisplay.innerText = formatTime(totalTime)
  lapTimeDisplay.innerText = formatTime(currentLapTime)
}

function updateButtonDisplay (state) {
  initialButtonsDiv.style.display = 'none'
  runningButtonsDiv.style.display = 'none'
  stoppedButtonsDiv.style.display = 'none'
  switch (state) {
    case timerStates.RUNNING: {
      runningButtonsDiv.style.display = 'flex'
      break
    }
    case timerStates.STOPPED: {
      stoppedButtonsDiv.style.display = 'flex'
      break
    }
    case timerStates.INITIAL: {
      initialButtonsDiv.style.display = 'flex'
      break
    }
  }
}

function addLap (lapDetails) {
  const { lapNumber, lapTime, totalTime } = lapDetails

  const lapDiv = document.createElement('div')
  lapDiv.classList.add('lap-div')

  const lapNumberSpan = document.createElement('span')
  lapNumberSpan.innerText = lapNumber
  lapDiv.appendChild(lapNumberSpan)

  const lapTimeSpan = document.createElement('span')
  lapTimeSpan.innerText = formatTime(lapTime, ':')
  lapDiv.appendChild(lapTimeSpan)

  const totalTimeSpan = document.createElement('span')
  totalTimeSpan.innerText = formatTime(totalTime, ':')
  lapDiv.appendChild(totalTimeSpan)

  lapListDiv.appendChild(lapDiv)
}

function startTimer () {
  browser.runtime.sendMessage({ op: 'start' })
}

function stopTimer () {
  browser.runtime.sendMessage({ op: 'stop' })
}

function lap () {
  browser.runtime.sendMessage({ op: 'lap' })
    .then(addLap)
}

function resumeTimer () {
  browser.runtime.sendMessage({ op: 'resume' })
}

function resetTimer () {
  browser.runtime.sendMessage({ op: 'reset' })
    .then(() => {
      lapListDiv.innerHTML = ''
      updateTimerDisplay(0, 0)
      updateButtonDisplay('initial')
    })
}

btnStart.addEventListener('click', startTimer)
btnStop.addEventListener('click', stopTimer)
btnLap.addEventListener('click', lap)
btnResume.addEventListener('click', resumeTimer)
btnReset.addEventListener('click', resetTimer)

function listener (message) {
  switch (message.op) {
    case 'counter': {
      const { totalTime, lapTime } = message.time
      updateTimerDisplay(totalTime, lapTime)
      break
    }
    case 'state': {
      const { timerState } = message
      updateButtonDisplay(timerState)
      break
    }
  }
}

browser.runtime.sendMessage({ op: 'init' })
  .then((response) => {
    const { totalTime, lapTime, laps, timerState } = response
    updateButtonDisplay(timerState)
    updateTimerDisplay(totalTime, lapTime)
    laps.forEach(addLap)
  })

browser.runtime.onMessage.addListener(listener)
