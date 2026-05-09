<template>
  <div class="page">
    <home-nav ref="homeNav" />
    <div class="shell">
      <div class="head">
        <h1>消息通知</h1>
        <p>这里会显示课程提醒、作业通知和系统消息。</p>
      </div>

      <div class="message-list">
        <el-card
          v-for="item in messages"
          :key="item.id || item.msgId"
          class="message-card"
          :class="{ todo: item.source === 'todo' }"
          :body-style="{ padding: '16px' }">
          <div class="msg-main">
            <i :class="item.icon || 'el-icon-bell'"></i>
            <div>
              <div class="msg-title">{{ item.title || '系统消息' }}</div>
              <div class="msg-text">{{ item.msg }}</div>
              <div class="msg-meta">{{ item.meta || ('来自：' + ((item.from && item.from.name) || '系统')) }}</div>
            </div>
          </div>
          <div class="msg-status" :class="{ read: item.status === 1 }">
            <el-button v-if="item.source === 'todo'" type="primary" plain size="mini" @click="goMessage(item)">
              {{ item.actionText || '去处理' }}
            </el-button>
            <span v-else-if="item.status === 1">已读</span>
            <span v-else @click="setCss(item)">未读，点击标记</span>
          </div>
        </el-card>
        <div v-if="messages.length === 0" class="empty-state">暂时没有消息</div>
      </div>
    </div>
  </div>
</template>

<script>
import HomeNav from 'components/content/HomeNav'
import { request } from '../../network/request'
import { loadTodos, todoToMessage } from '@/utils/todo'
import axios from 'axios'

export default {
  name: 'Message',
  components: {
    HomeNav
  },
  data() {
    return {
      messages: []
    }
  },
  mounted() {
    this.loadMessages()
  },
  methods: {
    loadMessages() {
      const messageReq = request({
      url: '/api/message/getMessages',
      method: 'get',
      params: {
        to: this.$store.state.uid
      }
      }).then(res => (res.data || []).map(item => ({
        ...item,
        source: 'message',
        title: item.status === 0 ? '未读消息' : '已读消息',
        icon: item.status === 0 ? 'el-icon-message-solid' : 'el-icon-message',
        meta: '来自：' + ((item.from && item.from.name) || '系统')
      })))
      const todoReq = loadTodos(this.$store.state.uid).then(todos => todos.map(todoToMessage))

      axios.all([todoReq, messageReq])
        .then(([todos, list]) => {
          const unread = list.filter(e => e.status === 0)
          const read = list.filter(e => e.status === 1)
          this.messages = [...todos, ...unread, ...read]
        }).catch(err => {
          console.log(err)
        })
    },
    setCss(item) {
      this.$refs.homeNav.msgMinis()
      item.status = 1
      this.read(item.msgId)
      this.messages = [...this.messages.filter(e => e.status === 0), ...this.messages.filter(e => e.status === 1)]
    },
    goMessage(item) {
      if (item.path && this.$route.path !== item.path) {
        this.$router.push(item.path)
      }
    },
    read(msgId) {
      request({
        url: '/api/message/read',
        method: 'post',
        data: [msgId]
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style scoped>
  .page {
    min-height: 100%;
  }

  .shell {
    width: min(1120px, 92%);
    margin: 0 auto;
    padding-top: 104px;
    padding-bottom: 48px;
  }

  .head h1 {
    font-size: 30px;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .head p {
    color: #64748b;
    margin-bottom: 18px;
  }

  .message-list {
    display: grid;
    gap: 12px;
  }

  .message-card {
    border-radius: 12px;
    border: 1px solid #e2e6ed;
  }

  .message-card.todo {
    border-color: #bdd7ff;
    background: #f8fbff;
  }

  .msg-main {
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 12px;
    align-items: start;
  }

  .msg-main i {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #e8f1ff;
    color: #2c58ab;
    font-size: 18px;
  }

  .msg-title {
    margin-bottom: 4px;
    color: #1f2937;
    font-weight: 700;
  }

  .msg-text {
    font-size: 15px;
    line-height: 1.7;
    color: #1f2937;
  }

  .msg-meta {
    margin-top: 6px;
    font-size: 12px;
    color: #64748b;
  }

  .msg-status {
    margin-top: 10px;
    text-align: right;
    font-size: 12px;
    color: #ef4444;
    cursor: pointer;
  }

  .msg-status.read {
    color: #10b981;
    cursor: default;
  }

  .empty-state {
    padding: 48px 0;
    text-align: center;
    color: #64748b;
    border: 1px dashed #cbd5e1;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.75);
  }
</style>
