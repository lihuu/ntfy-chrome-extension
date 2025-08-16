import AddIcon from "@mui/icons-material/Add"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
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

import type { ConfigProps, ServiceConfig } from "~types"
import getMessage from "~utils/LocaleUtils"

export default function Config({ config, setShowConfig }: ConfigProps) {
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([])
  const [showAddConfig, setShowAddConfig] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ServiceConfig | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [configToDelete, setConfigToDelete] = useState<string>("")

  // 编辑表单状态
  const [formData, setFormData] = useState({
    name: "",
    serviceAddress: "",
    topic: "",
    username: "",
    password: "",
    token: ""
  })

  // 生成唯一ID
  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // 初始化配置数据，支持向前兼容
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

    setServiceConfigs(configs)
  }, [config])

  const resetForm = () => {
    setFormData({
      name: "",
      serviceAddress: "",
      topic: "",
      username: "",
      password: "",
      token: ""
    })
  }

  const handleAddConfigClick = () => {
    resetForm()
    setEditingConfig(null)
    setShowAddConfig(true)
  }

  const handleEditConfig = (configItem: ServiceConfig) => {
    setFormData({
      name: configItem.name,
      serviceAddress: configItem.serviceAddress,
      topic: configItem.topic,
      username: configItem.username,
      password: configItem.password,
      token: configItem.token
    })
    setEditingConfig(configItem)
    setShowAddConfig(true)
    handleMenuClose()
  }

  const handleCopyConfig = (configItem: ServiceConfig) => {
    setFormData({
      name: `${configItem.name} (Copy)`,
      serviceAddress: configItem.serviceAddress,
      topic: configItem.topic,
      username: configItem.username,
      password: configItem.password,
      token: configItem.token
    })
    setEditingConfig(null)
    setShowAddConfig(true)
    handleMenuClose()
  }

  const handleFormCancel = () => {
    setShowAddConfig(false)
    setEditingConfig(null)
    resetForm()
  }

  const handleFormConfirm = () => {
    if (
      !formData.name.trim() ||
      !formData.serviceAddress.trim() ||
      !formData.topic.trim()
    ) {
      return
    }

    if (editingConfig) {
      // 编辑现有配置
      setServiceConfigs((prevConfigs) =>
        prevConfigs.map((c) =>
          c.id === editingConfig.id
            ? { ...c, ...formData, name: formData.name.trim() }
            : c
        )
      )
    } else {
      // 添加新配置
      const isFirstConfig = serviceConfigs.length === 0
      const newConfig: ServiceConfig = {
        id: generateId(),
        name: formData.name.trim(),
        serviceAddress: formData.serviceAddress.trim(),
        topic: formData.topic.trim(),
        username: formData.username.trim(),
        password: formData.password.trim(),
        token: formData.token.trim(),
        isDefault: isFirstConfig
      }
      setServiceConfigs((prev) => [...prev, newConfig])
    }

    handleFormCancel()
  }

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    configId: string
  ) => {
    setMenuAnchor(event.currentTarget)
    setSelectedConfigId(configId)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedConfigId(null)
  }

  const handleSetDefault = () => {
    if (selectedConfigId) {
      setServiceConfigs((configs) =>
        configs.map((c) => ({ ...c, isDefault: c.id === selectedConfigId }))
      )
    }
    handleMenuClose()
  }

  const handleDeleteClick = () => {
    if (selectedConfigId) {
      const configToDelete = serviceConfigs.find(
        (c) => c.id === selectedConfigId
      )
      if (configToDelete) {
        setConfigToDelete(configToDelete.name)
        setDeleteDialogOpen(true)
      }
    }
    handleMenuClose()
  }

  const handleDeleteConfirm = () => {
    if (selectedConfigId) {
      const updatedConfigs = serviceConfigs.filter(
        (c) => c.id !== selectedConfigId
      )
      // 如果删除的是默认配置且还有其他配置，将第一个设为默认
      if (updatedConfigs.length > 0) {
        const hasDefault = updatedConfigs.some((c) => c.isDefault)
        if (!hasDefault) {
          updatedConfigs[0].isDefault = true
        }
      }
      setServiceConfigs(updatedConfigs)
    }
    setDeleteDialogOpen(false)
    setConfigToDelete("")
    setSelectedConfigId(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setConfigToDelete("")
    setSelectedConfigId(null)
  }

  const handleSave = () => {
    // 确保至少有一个默认配置
    let finalConfigs = [...serviceConfigs]
    if (finalConfigs.length > 0) {
      const hasDefault = finalConfigs.some((c) => c.isDefault)
      if (!hasDefault) {
        finalConfigs[0].isDefault = true
      }
    }

    // 获取默认配置用于向前兼容
    const defaultConfig =
      finalConfigs.find((c) => c.isDefault) || finalConfigs[0]

    const newConfig = {
      serviceAddress: defaultConfig?.serviceAddress || "",
      topic: defaultConfig?.topic || "",
      username: defaultConfig?.username || "",
      password: defaultConfig?.password || "",
      token: defaultConfig?.token || "",
      configs: finalConfigs
    }

    chrome.storage.sync.set({ notifyConfig: newConfig }, () => {
      console.log("Configuration saved to chrome.storage")
      setShowConfig(false)
    })
  }

  const selectedConfig = selectedConfigId
    ? serviceConfigs.find((c) => c.id === selectedConfigId)
    : null

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

      {/* 服务配置管理区域 */}
      <Box mt={3} mb={2}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}>
          <Typography variant="h6">{getMessage("service_configs")}</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddConfigClick}
            disabled={showAddConfig}>
            {getMessage("add_config")}
          </Button>
        </Box>

        {/* 添加/编辑配置的表单 */}
        {showAddConfig && (
          <Box
            mb={2}
            p={2}
            style={{
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              border: "1px solid #e0e0e0"
            }}>
            <Typography variant="subtitle1" mb={2}>
              {editingConfig
                ? getMessage("edit_config")
                : getMessage("add_config")}
            </Typography>

            <TextField
              label={getMessage("config_name")}
              variant="outlined"
              size="small"
              fullWidth
              margin="dense"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <TextField
              label={getMessage("service_address")}
              variant="outlined"
              size="small"
              fullWidth
              margin="dense"
              value={formData.serviceAddress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  serviceAddress: e.target.value
                }))
              }
              type="url"
            />

            <TextField
              label={getMessage("topic")}
              variant="outlined"
              size="small"
              fullWidth
              margin="dense"
              value={formData.topic}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, topic: e.target.value }))
              }
            />

            <TextField
              label={getMessage("user_name")}
              variant="outlined"
              size="small"
              fullWidth
              margin="dense"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
            />

            <TextField
              label={getMessage("password")}
              variant="outlined"
              size="small"
              fullWidth
              margin="dense"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
            />

            <TextField
              label={getMessage("token")}
              variant="outlined"
              size="small"
              fullWidth
              margin="dense"
              type="password"
              value={formData.token}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, token: e.target.value }))
              }
              helperText={getMessage("token_helper")}
            />

            <Box display="flex" gap={1} mt={2}>
              <Button
                variant="contained"
                size="small"
                onClick={handleFormConfirm}
                disabled={
                  !formData.name.trim() ||
                  !formData.serviceAddress.trim() ||
                  !formData.topic.trim()
                }>
                {editingConfig
                  ? getMessage("save_changes")
                  : getMessage("confirm")}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleFormCancel}>
                {getMessage("cancel")}
              </Button>
            </Box>
          </Box>
        )}

        {/* 配置列表 */}
        <Box display="flex" flexDirection="column" gap={1}>
          {serviceConfigs.map((configItem) => (
            <Box
              key={configItem.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={1.5}
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                backgroundColor: configItem.isDefault ? "#e3f2fd" : "#ffffff"
              }}>
              <Box display="flex" alignItems="center" flex={1}>
                {configItem.isDefault ? (
                  <StarIcon color="primary" style={{ marginRight: 8 }} />
                ) : (
                  <StarBorderIcon style={{ marginRight: 8, color: "#ccc" }} />
                )}
                <Box>
                  <Typography
                    variant="body1"
                    style={{ fontWeight: configItem.isDefault ? 500 : 400 }}>
                    {configItem.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {configItem.serviceAddress} → {configItem.topic}
                  </Typography>
                </Box>
                {configItem.isDefault && (
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
                onClick={(e) => handleMenuClick(e, configItem.id)}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        {serviceConfigs.length === 0 && !showAddConfig && (
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
              {getMessage("no_configs_configured")}
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
        {selectedConfig && !selectedConfig.isDefault && (
          <MenuItem onClick={handleSetDefault}>
            <ListItemIcon>
              <StarIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{getMessage("set_as_default")}</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => selectedConfig && handleEditConfig(selectedConfig)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{getMessage("edit")}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => selectedConfig && handleCopyConfig(selectedConfig)}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{getMessage("copy")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} style={{ color: "#d32f2f" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" style={{ color: "#d32f2f" }} />
          </ListItemIcon>
          <ListItemText>{getMessage("delete")}</ListItemText>
        </MenuItem>
      </Menu>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description">
        <DialogTitle id="delete-dialog-title">
          {getMessage("confirm_delete")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {getMessage("delete_config_warning").replace("{1}", configToDelete)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{getMessage("cancel")}</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus>
            {getMessage("delete")}
          </Button>
        </DialogActions>
      </Dialog>

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
