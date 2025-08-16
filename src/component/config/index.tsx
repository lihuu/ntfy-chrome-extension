import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import Box from "@mui/material/Box"
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
  const [token, setToken] = useState(config.token)

  const handleSave = () => {
    const newConfig = {
      serviceAddress,
      topic,
      username,
      password,
      token
    }
    chrome.storage.sync.set({ notifyConfig: newConfig }, () => {
      console.log("Configuration saved to chrome.storage")
      setShowConfig(false)
    })
  }
  return (
    <div>
      <Box display="flex" alignItems="flex-start" mb={0} gap={0} pl={0}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setShowConfig(false)}
          style={{
            marginLeft: -8,
            paddingLeft: 0,
            paddingRight: 0,
            justifyContent: "left",
            minWidth: "32px"
          }}>
          {/* {getMessage("back")} */}
        </Button>
        <h2 style={{ margin: 0, paddingTop: "6px" }}>
          {getMessage("push_config")}
        </h2>
      </Box>
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

      <TextField
        label={getMessage("token")}
        type="password"
        variant="standard"
        fullWidth
        margin="normal"
        onChange={(e) => setToken(e.target.value)}
        value={token}
        helperText={getMessage("token_helper")}
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
