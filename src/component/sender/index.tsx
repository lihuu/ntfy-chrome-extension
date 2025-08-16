import { Settings } from "@mui/icons-material"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import CheckIcon from "@mui/icons-material/Check"
import { LoadingButton } from "@mui/lab"
import { Alert, Button, FormControl, IconButton, InputLabel, MenuItem, Select, Typography } from "@mui/material"
import TextField from "@mui/material/TextField"
import { useEffect, useRef, useState } from "react"

import { type MessageSenderProps, MessageType, SendingState, type ServiceConfig } from "~/types"
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
  const [selectedConfigId, setSelectedConfigId] = useState("")
  const [availableConfigs, setAvailableConfigs] = useState<ServiceConfig[]>([])

  // 用于文件选择的引用
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 生成唯一ID
  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // 初始化可用的配置和默认选中的配置
  useEffect(() => {
    let configs: ServiceConfig[] = []

    if (config.configs && config.configs.length > 0) {
      // 使用新的多配置结构
      configs = config.configs
    } else if (config.topics && config.topics.length > 0) {
      // 从旧的多topic结构迁移
      configs = config.topics.map((topic) => ({
        id: generateId(),
        name: `${config.serviceAddress || "ntfy"} - ${topic.name}`,
        serviceAddress: config.serviceAddress || "",
        topic: topic.name,
        username: config.username || "",
        password: config.password || "",
        token: config.token || "",
        isDefault: topic.isDefault
      }))
    } else if (config.topic) {
      // 从最旧的单topic结构迁移
      configs = [
        {
          id: generateId(),
          name: `${config.serviceAddress || "ntfy"} - ${config.topic}`,
          serviceAddress: config.serviceAddress || "",
          topic: config.topic,
          username: config.username || "",
          password: config.password || "",
          token: config.token || "",
          isDefault: true
        }
      ]
    }

    setAvailableConfigs(configs)

    // 设置默认选中的配置
    const defaultConfig = configs.find((c) => c.isDefault)
    if (defaultConfig) {
      setSelectedConfigId(defaultConfig.id)
    } else if (configs.length > 0) {
      setSelectedConfigId(configs[0].id)
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
    if (availableConfigs.length === 0) {
      setSendingState(SendingState.IDLE)
      // 如果没有配置，显示配置界面
      setShowConfig(true)
      return
    }

    // 获取选中的配置
    const selectedConfig =
      availableConfigs.find((c) => c.id === selectedConfigId) ||
      availableConfigs.find((c) => c.isDefault) ||
      availableConfigs[0]

    if (
      !selectedConfig ||
      !selectedConfig.serviceAddress ||
      !selectedConfig.topic
    ) {
      setSendingState(SendingState.IDLE)
      setShowConfig(true)
      return
    }

    // 创建临时配置对象，用于兼容现有的sendMessageToNtfy函数
    const configForSending = {
      serviceAddress: selectedConfig.serviceAddress,
      topic: selectedConfig.topic,
      username: selectedConfig.username,
      password: selectedConfig.password,
      token: selectedConfig.token
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
      configForSending,
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

      {/* 配置选择器 */}
      {availableConfigs.length > 1 && (
        <FormControl fullWidth margin="normal">
          <InputLabel>{getMessage("select_config")}</InputLabel>
          <Select
            value={selectedConfigId}
            label={getMessage("select_config")}
            onChange={(e) => setSelectedConfigId(e.target.value)}>
            {availableConfigs.map((configItem) => (
              <MenuItem key={configItem.id} value={configItem.id}>
                {configItem.name}{" "}
                {configItem.isDefault ? `(${getMessage("default")})` : ""}
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
