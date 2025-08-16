export interface Topic {
  name: string
  isDefault: boolean
}

export interface NotifyConfig {
  serviceAddress: string
  topic: string // 为了向前兼容保留
  topics?: Topic[] // 新的多topic支持
  username: string
  password: string
  token: string
}

export interface ConfigProps {
  config: NotifyConfig
  setShowConfig: (showConfig: boolean) => void
}

export interface MessageSenderProps {
  config: NotifyConfig
  setShowConfig: (showConfig: boolean) => void
}

export enum SendingState {
  IDLE,
  SENDING,
  SUCCESS,
  FAILED
}

export interface NtfyContent {
  message: string
  title?: string
  file?: File
}

export enum MessageType {
  TEXT,
  FILE
}
