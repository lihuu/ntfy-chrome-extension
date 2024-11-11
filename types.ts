export interface NotifyConfig {
  serviceAddress: string
  topic: string
  username: string
  password: string
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
