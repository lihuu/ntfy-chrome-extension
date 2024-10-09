import { Settings } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import { useEffect, useState } from "react"

import type { NotifyConfig } from "~types"
import { sendMessageToNtfy } from "~utils/MessageUtils"

interface ConfigProps {
  config: NotifyConfig
  setShowConfig: (showConfig: boolean) => void
}

function IndexPopup() {
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState<NotifyConfig>({
    serviceAddress: "",
    topic: "",
    username: "",
    password: ""
  })

  useEffect(() => {
    chrome.storage.sync.get("notifyConfig", (result) => {
      const config = result.notifyConfig
      if (config) {
        setConfig(config)
      }
    })
  }, [])

  return (
    <div
      style={{
        padding: 16,
        width: "400px",
        maxWidth: "100%"
      }}>
      {!showConfig && (
        <MessageSender
          config={config}
          setShowConfig={(v) => setShowConfig(v)}
        />
      )}
      {showConfig && (
        <Config config={config} setShowConfig={(v) => setShowConfig(v)} />
      )}
    </div>
  )
}

interface MessageSenderProps {
  config: NotifyConfig
  setShowConfig: (showConfig: boolean) => void
}

function MessageSender({ config, setShowConfig }: MessageSenderProps) {
  const [message, setMessage] = useState("")

  const handleSendMessage = () => {
    console.log("Sending message:", message)
    if (config.serviceAddress === "" || config.topic === "") {
      setShowConfig(true)
      return
    }

    sendMessageToNtfy(message, config)
  }

  return (
    <div>
      <TextField
        label="消息"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        onChange={(e) => setMessage(e.target.value)}
        value={message}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          style={{ marginTop: 16 }}>
          发送消息
        </Button>
        <IconButton
          color="primary"
          onClick={() => setShowConfig(true)}
          style={{ marginTop: 16 }}>
          <Settings />
        </IconButton>
      </div>
    </div>
  )
}

function Config({ config, setShowConfig }: ConfigProps) {
  const [serviceAddress, setServiceAddress] = useState(config.serviceAddress)
  const [topic, setTopic] = useState(config.topic)
  const [username, setUsername] = useState(config.username)
  const [password, setPassword] = useState(config.password)

  const handleSave = () => {
    const newConfig = {
      serviceAddress,
      topic,
      username,
      password
    }
    chrome.storage.sync.set({ notifyConfig: newConfig }, () => {
      console.log("Configuration saved to chrome.storage")
      setShowConfig(false)
    })
  }
  return (
    <div>
      <h2>推送设置</h2>
      <TextField
        label="服务地址"
        variant="standard"
        fullWidth
        required
        margin="normal"
        onChange={(e) => setServiceAddress(e.target.value)}
        value={serviceAddress}
        type="url"
      />
      <TextField
        label="订阅主题"
        variant="standard"
        fullWidth
        required
        margin="normal"
        onChange={(e) => setTopic(e.target.value)}
        value={topic}
      />
      <TextField
        label="用户名"
        variant="standard"
        fullWidth
        margin="normal"
        onChange={(e) => setUsername(e.target.value)}
        value={username}
      />
      <TextField
        label="密码"
        type="password"
        variant="standard"
        fullWidth
        margin="normal"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleSave()}
        style={{ marginTop: 16 }}>
        保存
      </Button>
    </div>
  )
}

export default IndexPopup
