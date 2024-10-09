import logo from "url:./assets/message-icon.png"

import { sendMessageToNtfy } from "~utils/MessageUtils"

export {}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToNtfyServer",
    title: "发送到ntfy",
    contexts: ["selection"]
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToNtfyServer" && info.selectionText) {
    const message = info.selectionText
    chrome.storage.sync.get("notifyConfig", (result) => {
      const config = result.notifyConfig
      if (!config) {
        console.error("No ntfy config found")
        return
      }
      sendMessageToNtfy(message, config)
    })
    // chrome.notifications.create({
    //   type: "basic",
    //   iconUrl: logo,
    //   title: "",
    //   message: `Selected text: ${message}`
    // })
    console.log(logo)
  }
})

// 订阅fcm消息
