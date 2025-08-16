export interface ServiceConfig {
  id: string // 唯一标识符
  name: string // 配置名称，显示用
  serviceAddress: string
  topic: string
  username: string
  password: string
  token: string
  isDefault: boolean // 是否为默认配置
}

export interface Topic {
  name: string
  isDefault: boolean
}

export interface NotifyConfig {
  serviceAddress: string // 为了向前兼容保留
  topic: string // 为了向前兼容保留
  topics?: Topic[] // 旧的多topic支持，用于数据迁移
  configs?: ServiceConfig[] // 新的多配置支持
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
