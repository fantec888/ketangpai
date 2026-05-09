<template>
  <navigation class="homenav">
    <template v-slot:left>
      <div class="brand" @click="gotoHome">
        <img class="brand-logo" src="../../assets/img/logo.png" alt="课堂派" />
        <div class="brand-copy">
          <strong>课堂派</strong>
          <span>课程与作业管理</span>
        </div>
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
  name: 'HomeNav',
  components: {
    Navigation
  },
  data() {
    return {
      avatar: require('../../assets/avatar/default.jpg'),
      msgNum: 0,
      hiddenOrNot: true
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
      if (this.$route.path === '/home') {
        this.$emit('clear-style')
      }

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
        if (this.$route.path === '/home') {
          this.$emit('clear-style')
        }
        this.$router.push('/message')
      }
    },
    gotoProfile() {
      if (this.$route.path !== '/profile') {
        if (this.$route.path === '/home') {
          this.$emit('clear-style')
        }
        this.$router.push('/profile')
      }
    },
    gotoHome() {
      if (this.$route.path !== '/home') {
        this.$router.push('/home')
      }
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
  .homenav {
    background: transparent;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
  }

  .brand-logo {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }

  .brand-copy {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .brand-copy strong {
    font-size: 16px;
    color: #1f2937;
  }

  .brand-copy span {
    font-size: 12px;
    color: #64748b;
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
