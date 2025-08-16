import { Settings } from "@mui/icons-material"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import CheckIcon from "@mui/icons-material/Check"
import { LoadingButton } from "@mui/lab"
import {
  Alert,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from "@mui/material"
import TextField from "@mui/material/TextField"
import { useEffect, useRef, useState } from "react"

import {
  MessageType,
  SendingState,
  type MessageSenderProps,
  type Topic
} from "~/types"
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [messageType, setMessageType] = useState<MessageType>(MessageType.TEXT)
  const [selectedTopic, setSelectedTopic] = useState("")
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([])

  // 用于文件选择的引用
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 初始化可用的topics和默认选中的topic
  useEffect(() => {
    let topics: Topic[] = []

    if (config.topics && config.topics.length > 0) {
      // 使用新的topics配置
      topics = config.topics
    } else if (config.topic) {
      // 向前兼容：将旧的单个topic转换为topics数组
      topics = [{ name: config.topic, isDefault: true }]
    }

    setAvailableTopics(topics)

    // 设置默认选中的topic
    const defaultTopic = topics.find((t) => t.isDefault)
    if (defaultTopic) {
      setSelectedTopic(defaultTopic.name)
    } else if (topics.length > 0) {
      setSelectedTopic(topics[0].name)
    }
  }, [config])

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
      setMessageType(MessageType.FILE)
    }
  }

  // 触发文件选择对话框
  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  // 清除选中的文件
  const clearSelectedFile = () => {
    setSelectedFile(null)
    setMessageType(MessageType.TEXT)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSendMessage = () => {
    if (sendingState === SendingState.SENDING) {
      return
    }
    setSendingState(SendingState.SENDING)

    // 检查必要的配置
    if (config.serviceAddress === "" || availableTopics.length === 0) {
      setSendingState(SendingState.IDLE)
      // 如果没有配置，显示配置界面
      setShowConfig(true)
      return
    }

    // 使用选中的topic或默认topic
    const topicToUse =
      selectedTopic ||
      availableTopics.find((t) => t.isDefault)?.name ||
      availableTopics[0]?.name

    // 创建临时配置，使用选中的topic
    const configWithSelectedTopic = {
      ...config,
      topic: topicToUse
    }

    sendMessageToNtfy(
      {
        message,
        title,
        file:
          messageType === MessageType.FILE
            ? selectedFile || undefined
            : undefined
      },
      configWithSelectedTopic,
      () => {
        setSendingState(SendingState.SUCCESS)
        // 发送成功后清除文件选择
        if (messageType === MessageType.FILE) {
          clearSelectedFile()
        }
      },
      () => {
        setSendingState(SendingState.FAILED)
      }
    )
  }

  return (
    <div>
      <TextField
        label={getMessage("title")}
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => {
          setSendingState(SendingState.IDLE)
        }}
      />

      {/* Topic选择器 */}
      {availableTopics.length > 1 && (
        <FormControl fullWidth margin="normal">
          <InputLabel>{getMessage("select_topic")}</InputLabel>
          <Select
            value={selectedTopic}
            label={getMessage("select_topic")}
            onChange={(e) => setSelectedTopic(e.target.value)}>
            {availableTopics.map((topic) => (
              <MenuItem key={topic.name} value={topic.name}>
                {topic.name}{" "}
                {topic.isDefault ? `(${getMessage("default")})` : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {messageType === MessageType.TEXT ? (
        // 文本消息输入框
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
      ) : (
        // 文件上传显示区域
        <div
          style={{
            border: "1px dashed #aaa",
            padding: "16px",
            marginTop: "16px",
            marginBottom: "8px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <AttachFileIcon color="primary" style={{ marginRight: "8px" }} />
            <Typography>
              {selectedFile
                ? selectedFile.name
                : getMessage("no_file_selected")}
              {selectedFile && ` (${(selectedFile.size / 1024).toFixed(2)} KB)`}
            </Typography>
          </div>
          <Button size="small" color="secondary" onClick={clearSelectedFile}>
            {getMessage("cancel")}
          </Button>
        </div>
      )}
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

      <div>
        {/* 上传文件按钮放在发送按钮上方 */}
        <Button
          startIcon={<AttachFileIcon />}
          onClick={triggerFileSelect}
          style={{ margin: "16px 0 8px 0" }}
          variant="outlined"
          fullWidth>
          {getMessage("attachment")}
        </Button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8
          }}>
          <LoadingButton
            variant="contained"
            color="primary"
            loading={sendingState === SendingState.SENDING}
            onClick={handleSendMessage}
            style={{ marginTop: 8 }}
            disabled={
              (messageType === MessageType.TEXT && !message) ||
              (messageType === MessageType.FILE && !selectedFile)
            }>
            {getMessage("send_message")}
          </LoadingButton>

          <IconButton
            color="primary"
            onClick={() => setShowConfig(true)}
            style={{ marginTop: 8 }}>
            <Settings />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
