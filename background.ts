export {}
console.log(
  "Live now; make now always the most precious time. Now will never come again."
)

chrome.runtime.onInstalled.addListener(() => {
  console.log("ntfy-chrome installed")
})

chrome.action.onClicked.addListener((tab) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "ntfy-chrome Notification",
    message: "Hello! This is a notification from ntfy-chrome."
  })
})
