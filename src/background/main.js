
import browser from 'webextension-polyfill'
import timerStates from '../common/timerStates'

const appState = {
  timerState: timerStates.INITIAL,
  totalTime: 0,
  laps: []
}

let interval = null

function getCurrentLapTime () {
  const prevLapTime = appState.laps.length > 0
    ? appState.laps[appState.laps.length - 1].totalTime
    : 0
  return appState.totalTime - prevLapTime
}

const countSecond = () => {
  appState.totalTime += 1
  browser.runtime.sendMessage({
    op: 'counter',
    time: {
      totalTime: appState.totalTime,
      lapTime: getCurrentLapTime()
    }
  }).catch(console.warn)
}

const handleInit = () => {
  return Promise.resolve({
    ...appState,
    lapTime: getCurrentLapTime()
  })
}

const handleStart = () => {
  if (interval === null) interval = setInterval(countSecond, 1000)
  appState.timerState = timerStates.RUNNING
  browser.runtime.sendMessage({ op: 'state', timerState: appState.timerState })
}

const handleStop = () => {
  clearInterval(interval)
  interval = null
  appState.timerState = timerStates.STOPPED
  browser.runtime.sendMessage({ op: 'state', timerState: appState.timerState })
}

const handleResume = handleStart

const handleReset = () => {
  appState.totalTime = 0
  appState.laps = []
  appState.timerState = timerStates.INITIAL

  return Promise.resolve({})
}

const handleLap = () => {
  const lap = {
    lapNumber: appState.laps.length + 1,
    totalTime: appState.totalTime,
    lapTime: getCurrentLapTime()
  }
  appState.laps.push(lap)
  return Promise.resolve(lap)
}

function listener (message) {
  switch (message.op) {
    case 'init': {
      return handleInit()
    }
    case 'start': {
      return handleStart()
    }
    case 'stop': {
      return handleStop()
    }
    case 'resume': {
      return handleResume()
    }
    case 'reset': {
      return handleReset()
    }
    case 'lap': {
      return handleLap()
    }
  }
}

browser.runtime.onMessage.addListener(listener)
