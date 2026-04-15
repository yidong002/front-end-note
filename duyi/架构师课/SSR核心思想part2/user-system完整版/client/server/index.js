import { createServer } from './createServer.js'

const { app } = await createServer()
const port = 3001
app.listen(port, () => {
  console.log(`服务器已启动，监听${port}端口...`)
})
