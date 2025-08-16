import { useEffect, useState } from "react"

import Config from "~/component/config"
import MessageSender from "~/component/sender"
import type { NotifyConfig, ServiceConfig } from "~/types"





function IndexPopup() {
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState<NotifyConfig>({
    serviceAddress: "",
    topic: "",
    configs: [], // 初始化为空数组
    username: "",
    password: "",
    token: ""
  })

  const [configUpdateTimes, setConfigUpdateTimes] = useState(0)

  // 修复 Plasmo 框架的 aria-hidden 问题
  useEffect(() => {
    const plasmoRoot = document.getElementById("__plasmo")
    if (plasmoRoot) {
      // 移除可能导致问题的 aria-hidden 属性
      plasmoRoot.removeAttribute("aria-hidden")
      // 设置正确的 role 和 aria-label
      plasmoRoot.setAttribute("role", "application")
      plasmoRoot.setAttribute("aria-label", "ntfy Chrome Extension")
    }
  }, [])

  // 生成唯一ID
  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9)

  useEffect(() => {
    chrome.storage.sync.get("notifyConfig", (result) => {
      const savedConfig = result.notifyConfig
      if (savedConfig) {
        let migratedConfig = { ...savedConfig }
        let needsMigration = false

        // 数据迁移逻辑
        if (!savedConfig.configs) {
          let newConfigs: ServiceConfig[] = []

          if (savedConfig.topics && savedConfig.topics.length > 0) {
            // 从多topic结构迁移
            newConfigs = savedConfig.topics.map((topic: any) => ({
              id: generateId(),
              name: `${savedConfig.serviceAddress || "ntfy"} - ${topic.name}`,
              serviceAddress: savedConfig.serviceAddress || "",
              topic: topic.name,
              username: savedConfig.username || "",
              password: savedConfig.password || "",
              token: savedConfig.token || "",
              isDefault: topic.isDefault
            }))
            needsMigration = true
          } else if (savedConfig.topic) {
            // 从单topic结构迁移
            newConfigs = [
              {
                id: generateId(),
                name: `${savedConfig.serviceAddress || "ntfy"} - ${savedConfig.topic}`,
                serviceAddress: savedConfig.serviceAddress || "",
                topic: savedConfig.topic,
                username: savedConfig.username || "",
                password: savedConfig.password || "",
                token: savedConfig.token || "",
                isDefault: true
              }
            ]
            needsMigration = true
          }

          if (newConfigs.length > 0) {
            // 获取默认配置用于向前兼容
            const defaultConfig =
              newConfigs.find((c) => c.isDefault) || newConfigs[0]

            migratedConfig = {
              serviceAddress: defaultConfig.serviceAddress,
              topic: defaultConfig.topic,
              username: defaultConfig.username,
              password: defaultConfig.password,
              token: defaultConfig.token,
              configs: newConfigs
            }
          }
        }

        setConfig(migratedConfig)

        // 如果进行了迁移，保存新的配置格式
        if (needsMigration) {
          chrome.storage.sync.set({ notifyConfig: migratedConfig })
        }
      }
    })
  }, [configUpdateTimes])

  return (
    <div
      style={{
        padding: 16,
        width: "400px",
        maxWidth: "100%"
      }}
      role="main"
      aria-label="ntfy Extension Main Interface">
      {!showConfig && (
        <MessageSender
          config={config}
          setShowConfig={(v) => setShowConfig(v)}
        />
      )}
      {showConfig && (
        <Config
          config={config}
          setShowConfig={(v) => {
            setShowConfig(v)
            setConfigUpdateTimes(configUpdateTimes + 1)
          }}
        />
      )}
    </div>
  )
}

export default IndexPopup
