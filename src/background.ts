import getMessage from "~utils/LocaleUtils"
import { sendMessageToNtfy } from "~utils/MessageUtils"





export {}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToNtfyServer",
    title: getMessage("send_to_ntfy"),
    contexts: ["selection"]
  })
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "sendToNtfyServer" && info.selectionText) {
    const message = info.selectionText
    chrome.storage.sync.get("notifyConfig", (result) => {
      const config = result.notifyConfig
      if (!config) {
        return
      }
      sendMessageToNtfy({message}, config)
    })
  }
})
