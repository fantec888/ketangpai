<template>
  <el-dialog
    :visible.sync="visibleProxy"
    width="860px"
    custom-class="chat-dialog"
    :show-close="false"
    append-to-body
    @opened="onOpened"
    @closed="onClosed">
    <div class="chat-window">
      <aside class="chat-mode">
        <button type="button" :class="{ active: activeMode === 'message' }" @click="switchMode('message')">
          <i class="el-icon-chat-dot-round"></i>
          <span>私信</span>
        </button>
        <button type="button" :class="{ active: activeMode === 'friend' }" @click="switchMode('friend')">
          <i class="el-icon-user"></i>
          <span>好友</span>
        </button>
      </aside>

      <aside class="chat-sidebar">
        <div class="search-box">
          <i class="el-icon-search"></i>
          <input v-model="keyword" placeholder="查找联系人" />
        </div>

        <div v-if="loadingContacts" class="sidebar-state">
          <i class="el-icon-loading"></i>
          加载中
        </div>

        <div v-else class="contact-scroll">
          <template v-if="activeMode === 'message'">
            <button
              v-for="contact in filteredRecentContacts"
              :key="contact.userId"
              type="button"
              class="contact-row"
              :class="{ active: selectedContact && selectedContact.userId === contact.userId }"
              @click="selectContact(contact)">
              <span class="avatar" :style="{ backgroundImage: `url(${avatarUrl(contact.avatar)})` }"></span>
              <span>
                <strong>{{ contact.name }}</strong>
                <small>{{ contact.lastMsg || contact.identifyNo || '暂无最近消息' }}</small>
              </span>
              <em v-if="contact.unread">{{ contact.unread }}</em>
            </button>
            <div v-if="filteredRecentContacts.length === 0" class="sidebar-state">暂无私信</div>
          </template>

          <template v-else>
            <div v-for="group in filteredFriendGroups" :key="group.key" class="friend-group">
              <button type="button" class="group-title" @click="toggleGroup(group.key)">
                <i :class="expandedGroups[group.key] ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i>
                <span>{{ group.title }}</span>
              </button>
              <div v-show="expandedGroups[group.key]">
                <button
                  v-for="contact in group.members"
                  :key="group.key + '-' + contact.userId"
                  type="button"
                  class="contact-row"
                  :class="{ active: selectedContact && selectedContact.userId === contact.userId }"
                  @click="selectContact(contact)">
                  <span class="avatar" :style="{ backgroundImage: `url(${avatarUrl(contact.avatar)})` }"></span>
                  <span>
                    <strong>{{ contact.name }}</strong>
                    <small>{{ contact.roleText || contact.identifyNo || '课堂成员' }}</small>
                  </span>
                </button>
              </div>
            </div>
            <div v-if="filteredFriendGroups.length === 0" class="sidebar-state">暂无联系人</div>
          </template>
        </div>
      </aside>

      <section class="conversation">
        <header class="conversation-head">
          <div>
            <strong>{{ selectedContact ? selectedContact.name : '请选择联系人' }}</strong>
            <span v-if="selectedContact">{{ selectedContact.courseName || selectedContact.identifyNo || '' }}</span>
          </div>
          <button type="button" @click="visibleProxy = false"><i class="el-icon-close"></i></button>
        </header>

        <div ref="messageBody" class="message-body">
          <div v-if="loadingMessages" class="message-state">
            <i class="el-icon-loading"></i>
            正在加载聊天记录
          </div>
          <div v-else-if="selectedContact && messages.length">
            <div
              v-for="message in messages"
              :key="message.msgId || message.localId"
              class="message-row"
              :class="{ mine: isMine(message) }">
              <span class="bubble-avatar" :style="{ backgroundImage: `url(${avatarUrl(messageAvatar(message))})` }"></span>
              <div class="bubble-wrap">
                <span class="message-time">{{ messageTime(message) }}</span>
                <div class="bubble">
                  <template v-if="messagePayload(message).file">
                    <a class="file-message" :href="messagePayload(message).file.url" target="_blank">
                      <i class="el-icon-paperclip"></i>
                      {{ messagePayload(message).file.name }}
                    </a>
                    <p v-if="messagePayload(message).text">{{ messagePayload(message).text }}</p>
                  </template>
                  <template v-else>
                    {{ messagePayload(message).text }}
                  </template>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="selectedContact" class="message-state">暂无聊天记录</div>
          <div v-else class="message-state">从左侧选择联系人开始聊天</div>
        </div>

        <footer class="composer">
          <div class="composer-tools">
            <el-upload
              action="/api/annex/upload"
              :show-file-list="false"
              :on-success="fileUploadSuccess"
              :on-error="fileUploadError">
              <button type="button" class="icon-btn"><i class="el-icon-paperclip"></i></button>
            </el-upload>
            <button type="button" class="history-btn" @click="scrollToBottom">
              <i class="el-icon-time"></i>
              查看旧版聊天记录
            </button>
          </div>
          <div class="composer-main">
            <textarea
              v-model="draft"
              :disabled="!selectedContact"
              placeholder="请输入内容"
              @keydown.enter.exact.prevent="sendMessage"></textarea>
            <el-button type="primary" :disabled="!canSend" :loading="sending" @click="sendMessage">发送</el-button>
          </div>
        </footer>
      </section>
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios'
import { request } from 'network/request'

export default {
  name: 'ChatPanel',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'message'
    }
  },
  data() {
    return {
      activeMode: 'message',
      keyword: '',
      loadingContacts: false,
      loadingMessages: false,
      sending: false,
      contacts: [],
      friendGroups: [],
      messages: [],
      selectedContact: null,
      expandedGroups: {},
      draft: '',
      pendingFile: null,
      pollTimer: null
    }
  },
  computed: {
    visibleProxy: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },
    currentUid() {
      return this.$store.state.uid
    },
    canSend() {
      return !!this.selectedContact && (this.draft.trim() || this.pendingFile) && !this.sending
    },
    filteredRecentContacts() {
      return this.filterContacts(this.contacts)
    },
    filteredFriendGroups() {
      const keyword = this.keyword.trim().toLowerCase()
      return this.friendGroups
        .map(group => {
          const members = keyword
            ? group.members.filter(item => this.matchContact(item, keyword) || group.title.toLowerCase().includes(keyword))
            : group.members
          return Object.assign({}, group, { members })
        })
        .filter(group => group.members.length)
    }
  },
  watch: {
    mode: {
      immediate: true,
      handler(value) {
        this.activeMode = value === 'friend' ? 'friend' : 'message'
      }
    },
    visible(value) {
      if (value) {
        this.activeMode = this.mode === 'friend' ? 'friend' : 'message'
        this.loadContacts()
      }
    }
  },
  methods: {
    onOpened() {
      this.loadContacts()
      this.startPolling()
    },
    onClosed() {
      this.stopPolling()
      this.keyword = ''
      this.pendingFile = null
    },
    switchMode(mode) {
      this.activeMode = mode
      this.keyword = ''
      if (mode === 'friend' && this.friendGroups.length === 0) {
        this.loadContacts()
      }
    },
    loadContacts() {
      if (!this.currentUid || this.loadingContacts) return
      this.loadingContacts = true

      const studentCourseReq = request({
        url: '/api/course/getCourse',
        method: 'get',
        params: { uid: this.currentUid }
      })
      const teacherCourseReq = request({
        url: '/api/course/getCourses',
        method: 'get',
        params: { uid: this.currentUid }
      })
      const messageReq = request({
        url: '/api/message/getMessages',
        method: 'get',
        params: { to: this.currentUid }
      })

      axios.all([studentCourseReq, teacherCourseReq, messageReq])
        .then(axios.spread((studentRes, teacherRes, messageRes) => {
          const courses = [...(studentRes.data || []), ...(teacherRes.data || [])]
            .filter(course => course.archiveStatus !== 1)
          const courseRequests = courses.map(course => {
            return request({
              url: '/api/userList',
              method: 'get',
              params: { cno: course.cno }
            }).then(res => this.makeFriendGroup(course, res.data || []))
          })

          return axios.all(courseRequests).then(groups => {
            this.friendGroups = groups.filter(group => group.members.length)
            this.initExpandedGroups()
            this.contacts = this.makeRecentContacts(messageRes.data || [])
            if (this.activeMode === 'message' && this.contacts.length && !this.selectedContact) {
              this.selectContact(this.contacts[0])
            }
          })
        }))
        .catch(err => {
          console.log(err)
        })
        .finally(() => {
          this.loadingContacts = false
        })
    },
    makeFriendGroup(course, users) {
      const members = users
        .filter(user => user.userId && user.userId !== this.currentUid)
        .map(user => Object.assign({}, user, {
          courseName: course.name,
          courseKey: course.cno,
          roleText: this.roleText(user)
        }))
      return {
        key: course.cno,
        title: course.name || '未命名课程',
        members
      }
    },
    makeRecentContacts(messages) {
      const map = {}
      messages.forEach(message => {
        const peer = message.from && message.from.userId === this.currentUid ? message.to : message.from
        if (!peer || !peer.userId || peer.userId === this.currentUid) return
        const payload = this.messagePayload(message)
        const old = map[peer.userId]
        map[peer.userId] = Object.assign({}, peer, {
          lastMsg: payload.file ? `[文件] ${payload.file.name}` : payload.text,
          unread: (old && old.unread ? old.unread : 0) + (message.to && message.to.userId === this.currentUid && message.status === 0 ? 1 : 0)
        })
      })
      const contacts = Object.values(map)
      if (contacts.length) return contacts
      return this.friendGroups.reduce((result, group) => result.concat(group.members), []).slice(0, 8)
    },
    initExpandedGroups() {
      this.friendGroups.forEach((group, index) => {
        if (this.expandedGroups[group.key] === undefined) {
          this.$set(this.expandedGroups, group.key, index < 2)
        }
      })
    },
    toggleGroup(key) {
      this.$set(this.expandedGroups, key, !this.expandedGroups[key])
    },
    filterContacts(list) {
      const keyword = this.keyword.trim().toLowerCase()
      if (!keyword) return list
      return list.filter(item => this.matchContact(item, keyword))
    },
    matchContact(contact, keyword) {
      return `${contact.name || ''} ${contact.identifyNo || ''} ${contact.courseName || ''}`.toLowerCase().includes(keyword)
    },
    selectContact(contact) {
      this.selectedContact = contact
      this.activeMode = this.activeMode || 'message'
      this.loadConversation(true)
    },
    loadConversation(markRead = false) {
      if (!this.selectedContact || !this.currentUid) return
      this.loadingMessages = true
      request({
        url: '/api/message/conversation',
        method: 'get',
        params: {
          uid: this.currentUid,
          peer: this.selectedContact.userId
        }
      }).then(res => {
        this.messages = res.data || []
        this.$nextTick(this.scrollToBottom)
        if (markRead) {
          this.markConversationRead()
        }
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        this.loadingMessages = false
      })
    },
    markConversationRead() {
      if (!this.selectedContact) return
      request({
        url: '/api/message/readConversation',
        method: 'post',
        params: {
          uid: this.currentUid,
          peer: this.selectedContact.userId
        }
      }).catch(err => {
        console.log(err)
      })
    },
    sendMessage() {
      if (!this.canSend) return
      const payload = {
        type: this.pendingFile ? 'file' : 'text',
        text: this.draft.trim(),
        file: this.pendingFile,
        time: new Date().toISOString()
      }
      this.sending = true
      request({
        url: '/api/message/send',
        method: 'post',
        data: {
          from: { userId: this.currentUid },
          to: { userId: this.selectedContact.userId },
          msg: JSON.stringify(payload)
        }
      }).then(res => {
        if (res.data) {
          this.draft = ''
          this.pendingFile = null
          this.loadConversation()
          this.refreshRecentMessages()
        } else {
          this.$message.error('发送失败')
        }
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        this.sending = false
      })
    },
    refreshRecentMessages() {
      request({
        url: '/api/message/getMessages',
        method: 'get',
        params: { to: this.currentUid }
      }).then(res => {
        this.contacts = this.makeRecentContacts(res.data || [])
      }).catch(err => {
        console.log(err)
      })
    },
    fileUploadSuccess(res, file) {
      const fileName = typeof res === 'string' ? res : file.name
      this.pendingFile = {
        name: file.name,
        storedName: fileName,
        url: '/static/annex/' + fileName
      }
      this.$message.success('附件已选择，点击发送即可发出')
    },
    fileUploadError() {
      this.$message.error('附件上传失败')
    },
    startPolling() {
      this.stopPolling()
      this.pollTimer = window.setInterval(() => {
        if (this.visible && this.selectedContact) {
          this.loadConversation()
        }
      }, 3500)
    },
    stopPolling() {
      if (this.pollTimer) {
        window.clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    scrollToBottom() {
      const body = this.$refs.messageBody
      if (body) {
        body.scrollTop = body.scrollHeight
      }
    },
    isMine(message) {
      return message.from && message.from.userId === this.currentUid
    },
    messageAvatar(message) {
      return this.isMine(message)
        ? this.$store.state.avatar
        : message.from && message.from.avatar
    },
    avatarUrl(avatar) {
      try {
        return require('../../assets/avatar/' + (avatar || 'default.jpg'))
      } catch (e) {
        return require('../../assets/avatar/default.jpg')
      }
    },
    roleText(user) {
      const pid = user.permission && user.permission.pid
      return String(pid) === '2' ? '教师' : '学生'
    },
    messagePayload(message) {
      if (!message || !message.msg) {
        return { text: '' }
      }
      try {
        const data = JSON.parse(message.msg)
        return Object.assign({ text: '' }, data)
      } catch (e) {
        return { text: message.msg }
      }
    },
    messageTime(message) {
      const payload = this.messagePayload(message)
      if (!payload.time) return ''
      const value = new Date(payload.time)
      if (Number.isNaN(value.getTime())) return ''
      const pad = num => String(num).padStart(2, '0')
      return `${pad(value.getMonth() + 1)}/${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`
    }
  }
}
</script>

<style scoped>
  .chat-window {
    height: 560px;
    display: grid;
    grid-template-columns: 56px 196px 1fr;
    overflow: hidden;
    background: #fff;
  }

  .chat-mode {
    background: #3f82ff;
    padding-top: 18px;
  }

  .chat-mode button {
    width: 100%;
    min-height: 64px;
    border: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.82);
    cursor: pointer;
  }

  .chat-mode button.active {
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
  }

  .chat-mode i {
    display: block;
    font-size: 24px;
    margin-bottom: 4px;
  }

  .chat-mode span {
    font-size: 12px;
    font-weight: 700;
  }

  .chat-sidebar {
    border-right: 1px solid #edf0f5;
    background: #f8faff;
    overflow: hidden;
  }

  .search-box {
    height: 48px;
    margin: 12px 12px 8px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #edf0f5;
    border-radius: 18px;
    background: #fff;
    color: #a0a7b5;
  }

  .search-box input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 13px;
  }

  .contact-scroll {
    height: calc(100% - 68px);
    overflow: auto;
  }

  .contact-row,
  .group-title {
    width: 100%;
    border: 0;
    background: transparent;
    cursor: pointer;
    text-align: left;
  }

  .contact-row {
    min-height: 54px;
    padding: 8px 12px;
    display: grid;
    grid-template-columns: 32px 1fr auto;
    align-items: center;
    gap: 10px;
  }

  .contact-row:hover,
  .contact-row.active {
    background: #eef4ff;
  }

  .avatar,
  .bubble-avatar {
    display: inline-block;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    background-color: #dbe6f7;
  }

  .avatar {
    width: 32px;
    height: 32px;
  }

  .contact-row strong,
  .contact-row small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .contact-row strong {
    color: #303133;
    font-size: 13px;
    font-weight: 600;
  }

  .contact-row small {
    margin-top: 4px;
    color: #909399;
    font-size: 12px;
  }

  .contact-row em {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: #f43f5e;
    color: #fff;
    font-size: 11px;
    line-height: 18px;
    font-style: normal;
    text-align: center;
  }

  .group-title {
    height: 34px;
    padding: 0 14px;
    color: #303133;
    font-size: 13px;
    font-weight: 700;
  }

  .group-title i {
    margin-right: 5px;
    color: #606266;
  }

  .sidebar-state,
  .message-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #909399;
    font-size: 13px;
  }

  .sidebar-state {
    height: 140px;
  }

  .conversation {
    min-width: 0;
    display: grid;
    grid-template-rows: 58px 1fr 124px;
    background: #fff;
  }

  .conversation-head {
    padding: 0 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #edf0f5;
  }

  .conversation-head strong {
    display: block;
    color: #303133;
    font-size: 15px;
  }

  .conversation-head span {
    margin-top: 4px;
    display: block;
    color: #909399;
    font-size: 12px;
  }

  .conversation-head button {
    border: 0;
    background: transparent;
    color: #606266;
    font-size: 22px;
    cursor: pointer;
  }

  .message-body {
    padding: 18px;
    overflow: auto;
    background: #fff;
  }

  .message-state {
    height: 100%;
  }

  .message-row {
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .message-row.mine {
    flex-direction: row-reverse;
  }

  .bubble-avatar {
    width: 34px;
    height: 34px;
    flex: 0 0 auto;
  }

  .bubble-wrap {
    max-width: 68%;
  }

  .message-row.mine .bubble-wrap {
    text-align: right;
  }

  .message-time {
    display: block;
    margin-bottom: 5px;
    color: #c0c4cc;
    font-size: 11px;
  }

  .bubble {
    display: inline-block;
    padding: 10px 12px;
    border-radius: 8px;
    background: #f2f6ff;
    color: #303133;
    line-height: 1.65;
    text-align: left;
    word-break: break-word;
  }

  .message-row.mine .bubble {
    background: #3f82ff;
    color: #fff;
  }

  .file-message {
    color: inherit;
    font-weight: 700;
  }

  .file-message i {
    margin-right: 6px;
  }

  .bubble p {
    margin-top: 6px;
  }

  .composer {
    border-top: 1px solid #edf0f5;
    background: #fff;
  }

  .composer-tools {
    height: 34px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .icon-btn,
  .history-btn {
    border: 0;
    background: transparent;
    color: #606266;
    cursor: pointer;
  }

  .icon-btn {
    font-size: 18px;
  }

  .history-btn {
    font-size: 12px;
  }

  .history-btn i {
    margin-right: 5px;
  }

  .composer-main {
    height: 90px;
    padding: 0 14px 14px;
    display: grid;
    grid-template-columns: 1fr 64px;
    gap: 12px;
    align-items: end;
  }

  .composer-main textarea {
    width: 100%;
    height: 72px;
    resize: none;
    border: 0;
    outline: 0;
    color: #303133;
    line-height: 1.6;
  }

  .composer-main textarea:disabled {
    background: #fff;
  }
</style>

<style>
  .chat-dialog {
    border-radius: 8px;
    overflow: hidden;
  }

  .chat-dialog .el-dialog__header {
    display: none;
  }

  .chat-dialog .el-dialog__body {
    padding: 0;
  }
</style>
