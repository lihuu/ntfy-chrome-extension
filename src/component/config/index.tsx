import AddIcon from "@mui/icons-material/Add"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import DeleteIcon from "@mui/icons-material/Delete"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import StarIcon from "@mui/icons-material/Star"
import StarBorderIcon from "@mui/icons-material/StarBorder"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useEffect, useState } from "react"

import type { ConfigProps, Topic } from "~types"
import getMessage from "~utils/LocaleUtils"





export default function Config({ config, setShowConfig }: ConfigProps) {
  const [serviceAddress, setServiceAddress] = useState(config.serviceAddress)
  const [username, setUsername] = useState(config.username)
  const [password, setPassword] = useState(config.password)
  const [token, setToken] = useState(config.token)
  const [topics, setTopics] = useState<Topic[]>([])
  const [showAddTopic, setShowAddTopic] = useState(false)
  const [newTopicName, setNewTopicName] = useState("")
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<string>("")

  // 初始化topics，支持向前兼容
  useEffect(() => {
    if (config.topics && config.topics.length > 0) {
      // 使用新的topics配置
      setTopics(config.topics)
    } else if (config.topic) {
      // 向前兼容：将旧的单个topic转换为topics数组
      setTopics([{ name: config.topic, isDefault: true }])
    } else {
      setTopics([])
    }
  }, [config])

  const handleAddTopicClick = () => {
    setShowAddTopic(true)
  }

  const handleAddTopicCancel = () => {
    setShowAddTopic(false)
    setNewTopicName("")
  }

  const handleAddTopicConfirm = () => {
    if (
      newTopicName.trim() &&
      !topics.some((t) => t.name === newTopicName.trim())
    ) {
      const isFirstTopic = topics.length === 0
      setTopics([
        ...topics,
        { name: newTopicName.trim(), isDefault: isFirstTopic }
      ])
      setNewTopicName("")
      setShowAddTopic(false)
    }
  }

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    topicName: string
  ) => {
    setMenuAnchor(event.currentTarget)
    setSelectedTopic(topicName)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedTopic(null)
  }

  const handleSetDefault = () => {
    if (selectedTopic) {
      setTopics(
        topics.map((t) => ({ ...t, isDefault: t.name === selectedTopic }))
      )
    }
    handleMenuClose()
  }

  const handleDeleteClick = () => {
    if (selectedTopic) {
      setTopicToDelete(selectedTopic)
      setDeleteDialogOpen(true)
    }
    handleMenuClose()
  }

  const handleDeleteConfirm = () => {
    if (topicToDelete) {
      const updatedTopics = topics.filter((t) => t.name !== topicToDelete)
      // 如果删除的是默认topic且还有其他topic，将第一个设为默认
      if (updatedTopics.length > 0) {
        const hasDefault = updatedTopics.some((t) => t.isDefault)
        if (!hasDefault) {
          updatedTopics[0].isDefault = true
        }
      }
      setTopics(updatedTopics)
    }
    setDeleteDialogOpen(false)
    setTopicToDelete("")
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTopicToDelete("")
  }

  const handleSave = () => {
    // 确保至少有一个默认topic
    let finalTopics = [...topics]
    if (finalTopics.length > 0) {
      const hasDefault = finalTopics.some((t) => t.isDefault)
      if (!hasDefault) {
        finalTopics[0].isDefault = true
      }
    }

    const newConfig = {
      serviceAddress,
      topic:
        finalTopics.length > 0
          ? finalTopics.find((t) => t.isDefault)?.name || finalTopics[0].name
          : "", // 向前兼容
      topics: finalTopics,
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
          }}></Button>
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

      {/* Topics管理区域 */}
      <Box mt={3} mb={2}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}>
          <Typography variant="h6">{getMessage("topics")}</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddTopicClick}
            disabled={showAddTopic}>
            {getMessage("add_topic")}
          </Button>
        </Box>

        {/* 添加新topic的输入框 */}
        {showAddTopic && (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            mb={2}
            p={2}
            style={{
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              border: "1px solid #e0e0e0"
            }}>
            <TextField
              label={getMessage("topic_name")}
              variant="outlined"
              size="small"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && newTopicName.trim()) {
                  handleAddTopicConfirm()
                }
                if (e.key === "Escape") {
                  handleAddTopicCancel()
                }
              }}
              autoFocus
              style={{ flex: 1 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleAddTopicConfirm}
              disabled={
                !newTopicName.trim() ||
                topics.some((t) => t.name === newTopicName.trim())
              }>
              {getMessage("confirm")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddTopicCancel}>
              {getMessage("cancel")}
            </Button>
          </Box>
        )}

        {/* Topics列表 */}
        <Box display="flex" flexDirection="column" gap={1}>
          {topics.map((topic) => (
            <Box
              key={topic.name}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={1.5}
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                backgroundColor: topic.isDefault ? "#e3f2fd" : "#ffffff"
              }}>
              <Box display="flex" alignItems="center" flex={1}>
                {topic.isDefault ? (
                  <StarIcon color="primary" style={{ marginRight: 8 }} />
                ) : (
                  <StarBorderIcon style={{ marginRight: 8, color: "#ccc" }} />
                )}
                <Typography
                  variant="body1"
                  style={{ fontWeight: topic.isDefault ? 500 : 400 }}>
                  {topic.name}
                </Typography>
                {topic.isDefault && (
                  <Chip
                    label={getMessage("default")}
                    size="small"
                    color="primary"
                    variant="outlined"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </Box>

              <IconButton
                size="small"
                onClick={(e) => handleMenuClick(e, topic.name)}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        {topics.length === 0 && !showAddTopic && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={3}
            style={{
              border: "2px dashed #e0e0e0",
              borderRadius: "8px",
              color: "#999"
            }}>
            <Typography variant="body2">
              {getMessage("no_topics_configured")}
            </Typography>
          </Box>
        )}
      </Box>

      {/* 菜单 */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
        {selectedTopic &&
          !topics.find((t) => t.name === selectedTopic)?.isDefault && (
            <MenuItem onClick={handleSetDefault}>
              <ListItemIcon>
                <StarIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{getMessage("set_as_default")}</ListItemText>
            </MenuItem>
          )}
        <MenuItem onClick={handleDeleteClick} style={{ color: "#d32f2f" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" style={{ color: "#d32f2f" }} />
          </ListItemIcon>
          <ListItemText>{getMessage("delete")}</ListItemText>
        </MenuItem>
      </Menu>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>{getMessage("confirm_delete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getMessage("delete_topic_warning").replace(
              "$topicName$",
              topicToDelete
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{getMessage("cancel")}</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained">
            {getMessage("delete")}
          </Button>
        </DialogActions>
      </Dialog>

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
