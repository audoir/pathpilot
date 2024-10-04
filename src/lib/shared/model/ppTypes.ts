
export type PpEventType = "urlVisited" | "mouseMove" | "textInput" | "mouseClick" | "domChanged";

export interface PpEvent {
  type: PpEventType
  timestamp: number
  data?: UrlVistedEvent | TextInputEvent
  startTime?: number
  endTime?: number
}

export interface UrlVistedEvent {
  href: string
}

export interface TextInputEvent {
  element: string
  value: string
}

export interface MouseClickEvent {
  element: string
  value: string
}
