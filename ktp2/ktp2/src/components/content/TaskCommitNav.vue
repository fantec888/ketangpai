<template>
  <navigation class="task-commit-nav">
    <template v-slot:left>
      <div class="crumbs" @click="back">
        <i class="el-icon-back" />
        <span>{{ cname }}</span>
      </div>
    </template>
    <template v-slot:center>
      <div class="nav-center">
        <div :class="{ active: isTaskPage }" @click="gotoTask">{{ taskLabel }}</div>
        <div :class="{ active: !isTaskPage }" @click="gotoDiscuss">作业讨论</div>
      </div>
    </template>
    <template v-slot:right>
      <div class="rstyle">
        <el-popover placement="bottom-end" trigger="click" width="240">
          <div class="paper-menu">
            <div @click="openExternal('https://ktp.paper880.com/')">
              <i class="el-icon-document-checked" />论文查重
            </div>
            <div @click="openExternal('https://www.aippt.cn/?utm_type=ppt&utm_source=bdb&utm_page=aippt&utm_plan=bd&utm_unit=bdq&utm_keyword=34428384')">
              <i class="el-icon-data-analysis" />AI 一键生成 PPT
            </div>
          </div>
          <button class="paper-entry" slot="reference" type="button">
            <i class="el-icon-document-checked" />
            <span>论文查重</span>
          </button>
        </el-popover>
        <el-badge :value="msgNum" :hidden="hiddenOrNot" class="item">
          <i class="el-icon-bell action-icon" @click="gotoMessage" />
        </el-badge>
        <el-popover placement="bottom-end" trigger="click" width="180">
          <div class="nav-btn">
            <div @click="gotoProfile"><i class="setting" />个人设置</div>
            <div @click="logout"><i class="exit" />退出账号</div>
          </div>
          <div class="avatar" slot="reference">
            <img :src="avatar" alt="头像" />
          </div>
        </el-popover>
      </div>
    </template>
  </navigation>
</template>

<script>
import Navigation from 'components/common/Navigation'
import { IS_LOGIN, CHANGE_UID } from "../../store/mutation-type"
import { loadNotificationCount } from '@/utils/todo'

export default {
  name: 'TaskCommitNav',
  components: {
    Navigation
  },
  props: {
    cname: String,
    tno: {
      type: String,
      default: ''
    },
    cno: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      avatar: require('../../assets/avatar/default.jpg'),
      msgNum: 0,
      hiddenOrNot: true
    }
  },
  computed: {
    isTaskPage() {
      return this.$route.path === `/studenttaskcommit/${this.cno}/${this.tno}` ||
        this.$route.path === `/taskmark/${this.cno}/${this.tno}`
    },
    taskLabel() {
      return this.$store.state.permission == '2' ? '学生作业' : '提交作业'
    }
  },
  mounted() {
    this.avatar = this.resolveAvatar(this.$store.state.avatar)
    loadNotificationCount(this.$store.state.uid).then(count => {
      this.msgNum = count
      this.hiddenOrNot = this.msgNum === 0
    }).catch(err => {
      console.log(err)
    })
  },
  methods: {
    resolveAvatar(name) {
      try {
        return require('../../assets/avatar/' + (name || 'default.jpg'))
      } catch (e) {
        return require('../../assets/avatar/default.jpg')
      }
    },
    logout() {
      this.$store.commit(CHANGE_UID, '')
      this.$store.commit(IS_LOGIN, '')
      this.$cookies.remove('user')
      this.$router.push('/')
    },
    msgMinis() {
      this.msgNum = Math.max(0, this.msgNum - 1)
      this.hiddenOrNot = this.msgNum === 0
    },
    gotoMessage() {
      if (this.$route.path !== '/message') {
        this.$router.push('/message')
      }
    },
    gotoProfile() {
      if (this.$route.path !== '/profile') {
        this.$router.push('/profile')
      }
    },
    back() {
      this.$emit('back')
    },
    gotoTask() {
      if (this.$store.state.permission == '2') {
        this.$router.push(`/taskmark/${this.$route.params.cno}/${this.$route.params.tno}`)
      } else {
        this.$router.push(`/studenttaskcommit/${this.$route.params.cno}/${this.$route.params.tno}`)
      }
    },
    gotoDiscuss() {
      this.$router.push(`/discuss/${this.$route.params.cno}/${this.$route.params.tno}`)
    },
    openExternal(url) {
      const win = window.open(url, '_blank')
      if (win) {
        win.opener = null
      }
    }
  }
}
</script>

<style scoped>
  .task-commit-nav {
    background: transparent;
  }

  .crumbs {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    color: #2c58ab;
    font-weight: 600;
  }

  .el-icon-back {
    font-size: 22px;
    font-weight: bold;
  }

  .crumbs span {
    display: inline-flex;
    align-items: center;
    height: 32px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 500;
    padding: 0 12px;
    background: #2c58ab;
    color: #fff;
  }

  .nav-center {
    display: flex;
    justify-content: center;
    height: 72px;
    line-height: 72px;
    font-size: 15px;
  }

  .nav-center > div {
    color: #475569;
    cursor: pointer;
    position: relative;
    padding: 0 14px;
    margin: 0 10px;
    user-select: none;
    height: 67px;
    border-bottom: 4px solid transparent;
  }

  .nav-center > div.active {
    color: #2c58ab;
    border-bottom-color: #2c58ab;
  }

  .rstyle {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .action-icon {
    font-size: 22px;
    color: #475569;
    cursor: pointer;
  }

  .paper-entry {
    height: 34px;
    padding: 0 12px;
    border: 1px solid #dbe3f0;
    border-radius: 6px;
    background: #fff;
    color: #2c58ab;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }

  .paper-entry:hover {
    border-color: #2c58ab;
    background: #f8fbff;
  }

  .paper-menu > div {
    height: 42px;
    line-height: 42px;
    cursor: pointer;
    padding: 0 12px;
    color: #1f2937;
    font-size: 14px;
  }

  .paper-menu > div:hover {
    background: #f2f6ff;
    color: #2c58ab;
  }

  .paper-menu i {
    margin-right: 8px;
    color: #2c58ab;
  }

  .nav-btn > div {
    cursor: pointer;
    width: 100%;
    padding-left: 10px;
    text-align: left;
    user-select: none;
    font-size: 14px;
    height: 40px;
    line-height: 40px;
  }

  .nav-btn > div:hover {
    background: #f2f2f2;
  }

  .setting,
  .exit {
    display: inline-block;
    vertical-align: middle;
    width: 30px;
    height: 40px;
  }

  .setting {
    background: url('../../assets/img/Setting.png') no-repeat 0/14px;
  }

  .exit {
    background: url('../../assets/img/exit.png') no-repeat 0/14px;
  }

  .item {
    margin-right: 6px;
  }
</style>
