import defaultSettings from '@/settings'

const title = defaultSettings.title || '学生选课系统'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
