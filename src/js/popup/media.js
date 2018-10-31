export function enableMic() {
  return navigator.mediaDevices.getUserMedia({
    audio: true
  })
}