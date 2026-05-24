declare global {
  interface Window {
    onNuiframesEvent: (event: NuiMessage) => void
  }
}

interface NuiMessage {
  type: string
  data?: any
}

window.onNuiframesEvent = (event: NuiMessage) => {
  window.dispatchEvent(new CustomEvent('nuiMessage', { detail: event }))
}

export {}
