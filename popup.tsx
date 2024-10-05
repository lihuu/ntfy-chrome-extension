import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import { useState } from "react"

interface NotifyConfig {
  serviceAddress: string
  topic: string
  username: string
  password: string
}

interface ConfigProps {
  config: NotifyConfig
}

function IndexPopup() {
  const config = {
    serviceAddress: "",
    topic: "",
    username: "",
    password: ""
  }
  const handleSave = () => {
    console.log(config)
    // TODO save config to chrome.storage
  }

  return (
    <div
      style={{
        padding: 16,
        width: "400px",
        maxWidth: "100%"
      }}>
      <Config config={config} />
    </div>
  )
}

function Config({ config }: ConfigProps) {
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
    console.log(newConfig)
  }
  return (
    <div>
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
