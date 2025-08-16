import { useEffect, useState } from "react"

import Config from "~/component/config"
import MessageSender from "~/component/sender"
import type { NotifyConfig } from "~/types"





function IndexPopup() {
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState<NotifyConfig>({
    serviceAddress: "",
    topic: "",
    username: "",
    password: "",
    token: ""
  })

  const [configUpdateTimes, setConfigUpdateTimes] = useState(0)

  useEffect(() => {
    chrome.storage.sync.get("notifyConfig", (result) => {
      const config = result.notifyConfig
      if (config) {
        setConfig(config)
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
