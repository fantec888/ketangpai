import axios from 'axios'
import { Message } from 'element-ui'

const service = axios.create({
  timeout: 10000
})

service.interceptors.response.use(
  response => response,
  error => {
    const status = error.response && error.response.status
    const message = status
      ? `请求失败（${status}），请稍后重试`
      : '网络连接异常，请检查后重试'

    Message.error(message)
    return Promise.reject(error)
  }
)

export function request(config) {
  return service(config)
}
