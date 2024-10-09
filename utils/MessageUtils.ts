import type { NotifyConfig } from "~types"

export function sendMessageToNtfy(message: string, config: NotifyConfig) {
  if (message === "") {
    console.error("Message is empty")
    return
  }
  const requestUrl = `${config.serviceAddress}/${config.topic}`
  fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`
    },
    body: message
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.text()
    })
    .then((data) => {
      console.log("Message sent successfully:", data)
    })
    .catch((error) => {
      console.error("Error sending message:", error)
    })
}
