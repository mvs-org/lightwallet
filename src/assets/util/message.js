import _vue from '@/main.js'

// 消息组件

export default {
  info (msg) {
    _vue.$Message.info({
      background: true,
      content: msg
    })
  },
  success (msg) {
    _vue.$Message.success({
      background: true,
      content: msg
    })
  },
  alert (msg) {
    _vue.$Message.warning({
      background: true,
      content: msg
    })
  },
  error (msg) {
    _vue.$Message.error({
      background: true,
      content: msg
    })
  },
}