import { Settings } from "@mui/icons-material"
import CheckIcon from "@mui/icons-material/Check"
import { LoadingButton } from "@mui/lab"
import {
  Alert,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch
} from "@mui/material"
import TextField from "@mui/material/TextField"
import { useState } from "react"

import { SendingState, type MessageSenderProps } from "~/types"
import getMessage from "~/utils/LocaleUtils"
import { sendMessageToNtfy } from "~/utils/MessageUtils"

export default function MessageSender({
  config,
  setShowConfig
}: MessageSenderProps) {
  const [message, setMessage] = useState("")
  const [sendingState, setSendingState] = useState<SendingState>(
    SendingState.IDLE
  )

  const [title, setTitle] = useState("")

  const handleSendMessage = () => {
    if (sendingState === SendingState.SENDING) {
      return
    }
    setSendingState(SendingState.SENDING)
    if (config.serviceAddress === "" || config.topic === "") {
      setSendingState(SendingState.IDLE)
      return
    }

    sendMessageToNtfy(
      message,
      config,
      () => {
        setSendingState(SendingState.SUCCESS)
      },
      () => {
        setSendingState(SendingState.FAILED)
      }
    )
  }

  return (
    <div>
      <TextField
        label="标题"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => {
          setSendingState(SendingState.IDLE)
        }}
      />
      <TextField
        label={getMessage("message")}
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        onChange={(e) => setMessage(e.target.value)}
        value={message}
        onFocus={() => {
          setSendingState(SendingState.IDLE)
        }}
      />
      {sendingState === SendingState.SUCCESS && (
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
          {getMessage("send_success")}
        </Alert>
      )}

      {sendingState === SendingState.FAILED && (
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
          {getMessage("send_failed")}
        </Alert>
      )}

      <FormGroup>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="高级模式"
        />
      </FormGroup>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
        <LoadingButton
          variant="contained"
          color="primary"
          loading={sendingState === SendingState.SENDING}
          onClick={handleSendMessage}
          style={{ marginTop: 16 }}>
          {getMessage("send_message")}
        </LoadingButton>
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
