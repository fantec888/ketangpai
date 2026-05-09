<template>
  <aside class="side-toolbar" aria-label="快捷工具栏">
    <button
      v-for="item in tools"
      :key="item.key"
      type="button"
      class="tool-item"
      :class="{ active: activeKey === item.key }"
      @click="selectTool(item)">
      <i :class="item.icon"></i>
      <span>{{ item.label }}</span>
      <em v-if="item.key === 'todo' && todoCount">{{ todoCount > 99 ? '99+' : todoCount }}</em>
    </button>

    <transition name="todo-panel">
      <section v-if="activeKey === 'todo'" class="todo-popover">
        <header>
          <h3>待办事项</h3>
          <button type="button" @click="allTodoVisible = true">查看全部<i class="el-icon-arrow-right"></i></button>
        </header>

        <div v-if="todoLoading" class="todo-state">
          <i class="el-icon-loading"></i>
          <span>正在加载</span>
        </div>

        <div v-else-if="todoList.length" class="todo-list compact-list">
          <button
            v-for="todo in previewTodos"
            :key="todo.id"
            type="button"
            class="todo-card"
            @click="goTodo(todo)">
            <span class="todo-icon" :class="todo.type">
              <i :class="todo.icon"></i>
            </span>
            <span class="todo-content">
              <strong>{{ todo.label }}</strong>
              <small>{{ todo.timeText }}</small>
              <b>来自：{{ todo.courseName }} / {{ todo.className }}</b>
            </span>
          </button>
        </div>

        <div v-else class="todo-state empty">
          <i class="el-icon-circle-check"></i>
          <span>暂无待办事项</span>
        </div>
      </section>
    </transition>

    <transition name="tool-panel">
      <div v-if="activeKey === 'service'" class="service-popover">
        <h3>联系客服 工作日 9:30~18:30 会在两小时之内回复</h3>
        <div class="service-grid">
          <div class="qr-card">
            <img class="qr-image" src="/static/img/contact-qr.jpg" alt="客服二维码" />
            <strong>微信扫码联系客服</strong>
          </div>
          <div class="service-text">
            <p><b>微信：</b>010-57748642</p>
            <p><b>电话：</b>17718377545</p>
            <p><b>QQ群：</b>377580118</p>
          </div>
        </div>
      </div>
    </transition>

    <transition name="tool-panel">
      <div v-if="activeKey === 'wechat'" class="wechat-popover">
        <h3>课堂派微信公众号</h3>
        <img class="qr-image" src="/static/img/contact-qr.jpg" alt="公众号二维码" />
      </div>
    </transition>

    <transition name="tool-panel">
      <div v-if="activeTool && !['todo', 'message', 'friend', 'service', 'wechat', 'feedback'].includes(activeKey)" class="tool-preview">
        <div class="preview-head">
          <i :class="activeTool.icon"></i>
          <strong>{{ activeTool.title }}</strong>
        </div>
        <p>{{ activeTool.desc }}</p>
        <button type="button" @click="closePreview">知道了</button>
      </div>
    </transition>

    <el-dialog title="全部待办" :visible.sync="allTodoVisible" width="620px" append-to-body>
      <div v-if="todoLoading" class="dialog-state">
        <i class="el-icon-loading"></i>
        正在加载待办事项
      </div>
      <div v-else-if="todoList.length" class="todo-list dialog-list">
        <button
          v-for="todo in todoList"
          :key="todo.id"
          type="button"
          class="todo-card"
          @click="goTodo(todo)">
          <span class="todo-icon" :class="todo.type">
            <i :class="todo.icon"></i>
          </span>
          <span class="todo-content">
            <strong>{{ todo.label }}</strong>
            <small>{{ todo.timeText }}</small>
            <b>来自：{{ todo.courseName }} / {{ todo.className }}</b>
          </span>
          <i class="el-icon-arrow-right todo-arrow"></i>
        </button>
      </div>
      <div v-else class="dialog-state">
        <i class="el-icon-circle-check"></i>
        暂无待办事项
      </div>
    </el-dialog>

    <chat-panel :visible.sync="chatVisible" :mode="chatMode" />

    <el-dialog
      title="反馈问题"
      :visible.sync="feedbackVisible"
      width="650px"
      custom-class="feedback-dialog"
      append-to-body>
      <div class="feedback-form">
        <label>
          <span>反馈类型</span>
          <el-select v-model="feedback.type" placeholder="请选择">
            <el-option label="功能异常" value="功能异常" />
            <el-option label="体验建议" value="体验建议" />
            <el-option label="内容问题" value="内容问题" />
            <el-option label="其他问题" value="其他问题" />
          </el-select>
        </label>
        <label>
          <span>需求标题</span>
          <el-input v-model="feedback.title" placeholder="请输入标题" maxlength="50" show-word-limit />
        </label>
        <div class="editor-shell">
          <div class="editor-toolbar">
            <button type="button">T</button>
            <select>
              <option>16px</option>
            </select>
            <button type="button"><b>B</b></button>
            <button type="button"><i>I</i></button>
            <button type="button"><u>U</u></button>
            <button type="button"><i class="el-icon-link"></i></button>
            <button type="button"><i class="el-icon-menu"></i></button>
            <button type="button"><i class="el-icon-picture-outline"></i></button>
          </div>
          <textarea v-model="feedback.content" placeholder="请详细描述你遇到的问题或建议"></textarea>
        </div>
        <p class="feedback-tip">客服电话：010-57748642（周一 ~ 周五 10:00-19:00）</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="feedbackVisible = false">取消</el-button>
        <el-button type="primary" :loading="feedbackSubmitting" @click="submitFeedback">确定</el-button>
      </span>
    </el-dialog>
  </aside>
</template>

<script>
import { request } from 'network/request'
import ChatPanel from 'components/content/ChatPanel'
import { loadTodos } from '@/utils/todo'

export default {
  name: 'SideToolBar',
  components: {
    ChatPanel
  },
  data() {
    return {
      activeKey: '',
      chatVisible: false,
      chatMode: 'message',
      feedbackVisible: false,
      feedbackSubmitting: false,
      feedback: {
        type: '',
        title: '',
        content: ''
      },
      todoLoading: false,
      todoLoaded: false,
      allTodoVisible: false,
      todoList: [],
      tools: [
        {
          key: 'todo',
          label: '待办',
          title: '待办事项',
          desc: '集中查看作业、批改、课程通知等待处理事项。',
          icon: 'el-icon-document'
        },
        {
          key: 'message',
          label: '私信',
          title: '私信消息',
          desc: '快速进入师生沟通入口，后续可接入会话列表。',
          icon: 'el-icon-chat-dot-round'
        },
        {
          key: 'friend',
          label: '好友',
          title: '好友管理',
          desc: '管理课堂联系人、同学和教师好友关系。',
          icon: 'el-icon-user'
        },
        {
          key: 'service',
          label: '客服',
          title: '在线客服',
          desc: '提供使用咨询、问题反馈和平台帮助支持。',
          icon: 'el-icon-service'
        },
        {
          key: 'wechat',
          label: '公众号',
          title: '公众号',
          desc: '展示移动端入口、通知订阅和官方服务二维码。',
          icon: 'el-icon-menu'
        },
        {
          key: 'feedback',
          label: '反馈',
          title: '意见反馈',
          desc: '提交产品建议或问题，帮助持续完善课堂体验。',
          icon: 'el-icon-edit-outline'
        }
      ]
    }
  },
  computed: {
    activeTool() {
      return this.tools.find(item => item.key === this.activeKey)
    },
    previewTodos() {
      return this.todoList.slice(0, 2)
    },
    todoCount() {
      return this.todoList.length
    },
    isTeacher() {
      return String(this.$store.state.permission || '') === '2'
    }
  },
  mounted() {
    this.loadTodos()
  },
  methods: {
    selectTool(item) {
      if (item.key === 'message' || item.key === 'friend') {
        this.activeKey = ''
        this.chatMode = item.key
        this.chatVisible = true
        return
      }
      if (item.key === 'feedback') {
        this.activeKey = ''
        this.feedbackVisible = true
        return
      }
      this.activeKey = this.activeKey === item.key ? '' : item.key
      if (item.key === 'todo') {
        this.loadTodos(true)
      }
    },
    closePreview() {
      this.activeKey = ''
    },
    loadTodos(force = false) {
      if (this.todoLoading || (this.todoLoaded && !force)) return
      const uid = this.$store.state.uid
      if (!uid) return

      this.todoLoading = true
      loadTodos(uid)
        .then(todos => {
          this.todoList = todos
          this.todoLoaded = true
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => {
          this.todoLoading = false
        })
    },
    goTodo(todo) {
      this.activeKey = ''
      this.allTodoVisible = false
      if (this.$route.path !== todo.path) {
        this.$router.push(todo.path)
      }
    },
    submitFeedback() {
      if (!this.feedback.type || !this.feedback.title || !this.feedback.content.trim()) {
        this.$message.warning('请完整填写反馈类型、标题和内容')
        return
      }
      this.feedbackSubmitting = true
      request({
        url: '/api/feedback/submit',
        method: 'post',
        data: {
          userId: this.$store.state.uid,
          name: this.$store.state.name,
          type: this.feedback.type,
          title: this.feedback.title,
          content: this.feedback.content
        }
      }).then(res => {
        if (res.data) {
          this.$message.success('反馈已提交')
          this.feedbackVisible = false
          this.feedback = {
            type: '',
            title: '',
            content: ''
          }
        } else {
          this.$message.error('提交失败，请稍后重试')
        }
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        this.feedbackSubmitting = false
      })
    }
  }
}
</script>

<style scoped>
  .side-toolbar {
    position: fixed;
    right: 18px;
    top: 50%;
    z-index: 30;
    transform: translateY(-50%);
    width: 58px;
    padding: 10px 0;
    border: 1px solid #eef0f4;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 8px 28px rgba(15, 23, 42, 0.1);
  }

  .tool-item {
    position: relative;
    width: 100%;
    min-height: 58px;
    padding: 7px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border: 0;
    background: transparent;
    color: #ff6a21;
    cursor: pointer;
    transition: background 0.18s ease, transform 0.18s ease;
  }

  .tool-item + .tool-item {
    border-top: 1px solid #f5f6f8;
  }

  .tool-item i {
    font-size: 22px;
    line-height: 1;
  }

  .tool-item span {
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    white-space: nowrap;
  }

  .tool-item em {
    position: absolute;
    top: 5px;
    right: 5px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: #f43f5e;
    color: #fff;
    font-size: 10px;
    line-height: 16px;
    font-style: normal;
  }

  .tool-item:hover,
  .tool-item.active {
    background: #fff5ef;
    transform: translateX(-2px);
  }

  .todo-popover {
    position: fixed;
    right: 94px;
    top: 82px;
    width: 316px;
    min-height: 132px;
    padding: 14px 15px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
  }

  .todo-popover header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .todo-popover h3 {
    color: #303133;
    font-size: 18px;
    font-weight: 500;
  }

  .todo-popover header button {
    border: 0;
    background: transparent;
    color: #4b7ff8;
    font-size: 12px;
    cursor: pointer;
  }

  .todo-list {
    display: grid;
    gap: 10px;
  }

  .compact-list {
    max-height: 188px;
    overflow: auto;
  }

  .todo-card {
    width: 100%;
    min-height: 62px;
    padding: 0;
    display: grid;
    grid-template-columns: 30px 1fr;
    gap: 10px;
    border: 0;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .todo-card:hover .todo-content strong {
    color: #2f74ff;
  }

  .todo-icon {
    width: 27px;
    height: 27px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;
    font-size: 15px;
    margin-top: 2px;
  }

  .todo-icon.submit {
    background: #35c8bd;
  }

  .todo-icon.grade {
    background: #ff8a1f;
  }

  .todo-content {
    min-width: 0;
    color: #606266;
  }

  .todo-content strong {
    color: #303133;
    font-size: 13px;
    line-height: 18px;
  }

  .todo-content small {
    margin-left: 7px;
    color: #909399;
    font-size: 12px;
  }

  .todo-content b {
    display: block;
    margin-top: 7px;
    color: #606266;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 400;
  }

  .todo-state,
  .dialog-state {
    min-height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #909399;
    font-size: 13px;
  }

  .todo-state.empty i,
  .dialog-state i {
    color: #35c8bd;
  }

  .tool-preview {
    position: absolute;
    right: 72px;
    top: 50%;
    width: 230px;
    padding: 16px;
    border: 1px solid #ffe2d2;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 12px 34px rgba(15, 23, 42, 0.14);
    transform: translateY(-50%);
  }

  .service-popover,
  .wechat-popover {
    position: fixed;
    right: 94px;
    top: 50%;
    border: 1px solid #edf0f5;
    background: #fff;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
    transform: translateY(-50%);
  }

  .service-popover {
    width: 300px;
    padding: 16px 18px;
    margin-top: 40px;
  }

  .service-popover h3,
  .wechat-popover h3 {
    margin-bottom: 12px;
    color: #303133;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.6;
  }

  .service-grid {
    display: grid;
    grid-template-columns: 112px 1fr;
    gap: 18px;
    align-items: center;
  }

  .qr-card {
    text-align: center;
  }

  .qr-card strong {
    display: block;
    margin-top: 8px;
    color: #606266;
    font-size: 12px;
    font-weight: 500;
  }

  .service-text p {
    margin: 8px 0;
    color: #606266;
    font-size: 12px;
    line-height: 1.4;
  }

  .service-text b {
    color: #303133;
  }

  .wechat-popover {
    width: 142px;
    padding: 12px;
    margin-top: 110px;
    text-align: center;
  }

  .wechat-popover h3 {
    margin-bottom: 8px;
  }

  .qr-image {
    width: 102px;
    height: 102px;
    display: inline-block;
    border: 1px solid #d8dde8;
    background: #fff;
    object-fit: contain;
  }

  .wechat-popover .qr-image {
    width: 118px;
    height: 118px;
  }

  .tool-preview::after {
    content: "";
    position: absolute;
    right: -7px;
    top: 50%;
    width: 12px;
    height: 12px;
    border-top: 1px solid #ffe2d2;
    border-right: 1px solid #ffe2d2;
    background: #fff;
    transform: translateY(-50%) rotate(45deg);
  }

  .preview-head {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1f2937;
  }

  .preview-head i {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #fff5ef;
    color: #ff6a21;
    font-size: 19px;
  }

  .preview-head strong {
    font-size: 15px;
  }

  .tool-preview p {
    margin: 12px 0 14px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.7;
  }

  .tool-preview button {
    height: 30px;
    padding: 0 14px;
    border: 0;
    border-radius: 6px;
    background: #ff6a21;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
  }

  .dialog-list {
    max-height: 430px;
    overflow: auto;
  }

  .dialog-list .todo-card {
    min-height: 76px;
    grid-template-columns: 38px 1fr 18px;
    align-items: center;
    padding: 12px 14px;
    border: 1px solid #eef0f4;
    border-radius: 8px;
    background: #fff;
  }

  .dialog-list .todo-icon {
    width: 34px;
    height: 34px;
    margin-top: 0;
  }

  .todo-arrow {
    color: #c0c4cc;
  }

  .todo-panel-enter-active,
  .todo-panel-leave-active,
  .tool-panel-enter-active,
  .tool-panel-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
  }

  .todo-panel-enter,
  .todo-panel-leave-to {
    opacity: 0;
    transform: translateX(8px);
  }

  .tool-panel-enter,
  .tool-panel-leave-to {
    opacity: 0;
    transform: translate(8px, -50%);
  }

  .feedback-form {
    display: grid;
    gap: 14px;
  }

  .feedback-form label {
    display: grid;
    grid-template-columns: 86px 1fr;
    align-items: center;
    gap: 10px;
  }

  .feedback-form label > span {
    color: #303133;
    font-size: 14px;
  }

  .editor-shell {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;
  }

  .editor-toolbar {
    height: 38px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #ebeef5;
    background: #fff;
  }

  .editor-toolbar button,
  .editor-toolbar select {
    height: 26px;
    border: 0;
    background: transparent;
    color: #303133;
    cursor: pointer;
    font-size: 13px;
  }

  .editor-toolbar select {
    min-width: 58px;
    color: #606266;
  }

  .editor-shell textarea {
    width: 100%;
    height: 120px;
    padding: 12px;
    resize: none;
    border: 0;
    outline: 0;
    color: #303133;
    line-height: 1.7;
  }

  .feedback-tip {
    color: #606266;
    font-size: 12px;
  }

  @media (max-width: 900px) {
    .side-toolbar {
      right: 10px;
      width: 52px;
    }

    .todo-popover,
    .service-popover,
    .wechat-popover,
    .tool-preview {
      display: none;
    }
  }
</style>
