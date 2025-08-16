import { useEffect, useState } from "react"

import Config from "~/component/config"
import MessageSender from "~/component/sender"
import type { NotifyConfig } from "~/types"





function IndexPopup() {
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState<NotifyConfig>({
    serviceAddress: "",
    topic: "",
    topics: [], // 初始化为空数组
    username: "",
    password: "",
    token: ""
  })

  const [configUpdateTimes, setConfigUpdateTimes] = useState(0)

  useEffect(() => {
    chrome.storage.sync.get("notifyConfig", (result) => {
      const savedConfig = result.notifyConfig
      if (savedConfig) {
        // 向前兼容性处理
        if (!savedConfig.topics && savedConfig.topic) {
          // 如果是旧格式，转换为新格式
          const migratedConfig = {
            ...savedConfig,
            topics: [{ name: savedConfig.topic, isDefault: true }]
          }
          setConfig(migratedConfig)
          // 保存迁移后的配置
          chrome.storage.sync.set({ notifyConfig: migratedConfig })
        } else {
          setConfig(savedConfig)
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
      }}>
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
