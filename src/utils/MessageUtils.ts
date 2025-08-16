import type { NotifyConfig, NtfyContent } from "~/types"

export function sendMessageToNtfy(
  { message, title, file }: NtfyContent,
  config: NotifyConfig,
  successCallback?: (data: string) => void,
  errorCallback?: (error: Error) => void
) {
  if (message === "" && !file) {
    console.error("Message and file are both empty")
    return
  }

  const requestUrl = `${config.serviceAddress}/${config.topic}`
  const headers: Record<string, string> = {}

  // 优先使用token，如果没有token再使用用户名和密码
  if (config.token && config.token.trim() !== "") {
    headers["Authorization"] = `Bearer ${config.token}`
  } else if (config.username && config.password) {
    headers["Authorization"] =
      `Basic ${btoa(`${config.username}:${config.password}`)}`
  }

  if (title && title !== "") {
    headers["Title"] = title
  }

  // 如果有文件，使用PUT方法上传文件
  if (file) {
    headers["Filename"] = file.name
    headers["Content-Type"] = file.type || "application/octet-stream"

    debugger
    fetch(requestUrl, {
      method: "PUT",
      headers: headers,
      body: file
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.text()
      })
      .then((data) => {
        console.log("File sent successfully:", data)
        successCallback?.(data)
      })
      .catch((error) => {
        console.error("Error sending file:", error)
        errorCallback?.(error)
      })
  } else {
    // 原来的文本消息发送方式
    headers["Content-Type"] = "text/plain"
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
}
