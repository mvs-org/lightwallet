// Sleep函数
// 用于某些特定场景
// 注册在全局，通过this.$sleep调用

export default async function sleep (time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}