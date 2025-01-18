export default function getMessage(key: string): string {
  return chrome.i18n.getMessage(key)
}
