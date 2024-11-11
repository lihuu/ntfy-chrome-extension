import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import { useState } from "react"

import type { ConfigProps } from "~types"
import getMessage from "~utils/LocaleUtils"





export default function Config({ config, setShowConfig }: ConfigProps) {
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
      <h2>{getMessage("push_config")}</h2>
      <TextField
        label={getMessage("service_address")}
        variant="standard"
        fullWidth
        required
        margin="normal"
        onChange={(e) => setServiceAddress(e.target.value)}
        value={serviceAddress}
        type="url"
      />
      <TextField
        label={getMessage("topic")}
        variant="standard"
        fullWidth
        required
        margin="normal"
        onChange={(e) => setTopic(e.target.value)}
        value={topic}
      />
      <TextField
        label={getMessage("user_name")}
        variant="standard"
        fullWidth
        margin="normal"
        onChange={(e) => setUsername(e.target.value)}
        value={username}
      />
      <TextField
        label={getMessage("password")}
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
        {getMessage("save")}
      </Button>
    </div>
  )
}
