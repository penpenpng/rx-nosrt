import comp from "/home/poman/desktop/nostr/rx-nostr/docs/.vuepress/.temp/pages/docs/v1/first-step.html.vue"
const data = JSON.parse("{\"path\":\"/docs/v1/first-step.html\",\"title\":\"First Step\",\"lang\":\"ja_JP\",\"frontmatter\":{},\"headers\":[],\"git\":{\"updatedTime\":null,\"contributors\":[]},\"filePathRelative\":\"docs/v1/first-step.md\"}")
export { comp, data }

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}