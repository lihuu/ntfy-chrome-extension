import type { NotifyConfig, NtfyContent } from "~/types"

export function sendMessageToNtfy(
  {message,title}: NtfyContent,
  config: NotifyConfig,
  successCallback?: (data: string) => void,
  errorCallback?: (error: Error) => void
) {
  if (message === "") {
    console.error("Message is empty")
    return
  }
  const requestUrl = `${config.serviceAddress}/${config.topic}`
  const headers = {
    "Content-Type": "text/plain",
    Authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`
  }
  if(title&&title!==""){
    headers["Title"] = title
  }
  fetch(requestUrl, {
    method: "POST",
    headers: headers,
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
      successCallback?.(data)
    })
    .catch((error) => {
      console.error("Error sending message:", error)
      errorCallback?.(error)
    })
}
