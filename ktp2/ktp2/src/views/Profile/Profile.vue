<template>
  <div class="page">
    <home-nav />
    <div class="shell">
      <section class="top">
        <div class="avatar-wrap">
          <img :src="avatar" :alt="user.name" />
          <el-upload
            class="avatar-uploader"
            :data="{ uid: $store.state.uid }"
            action="/api/file/upload"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload">
            <div class="upload-tip">更换头像</div>
          </el-upload>
        </div>
        <h1>{{ user.name }}</h1>
        <p>{{ showPermission }} · {{ showSchool }}</p>
      </section>

      <section class="grid">
        <div class="panel">
          <div class="panel-head">
            <h3>基本资料</h3>
            <el-button type="text" @click="toggleEdit('basic')">
              {{ editBasic ? '取消编辑' : '编辑资料' }}
            </el-button>
          </div>
          <div class="rows">
            <div class="row">
              <span>姓名</span>
              <el-input v-if="editBasic" v-model="username" />
              <strong v-else>{{ user.name }}</strong>
            </div>
            <div class="row">
              <span>学校</span>
              <el-select v-if="editBasic" v-model="school" filterable placeholder="选择学校" style="width: 260px">
                <el-option v-for="item in schools" :key="item.sclID" :label="item.sclName" :value="item.sclName" />
              </el-select>
              <strong v-else>{{ showSchool }}</strong>
            </div>
          </div>
          <div class="actions" v-if="editBasic">
            <el-button type="primary" @click="save(1)">保存</el-button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <h3>身份角色</h3>
            <el-button type="text" @click="toggleEdit('permission')">
              {{ editPermission ? '取消编辑' : '变更身份' }}
            </el-button>
          </div>
          <div class="rows">
            <div class="row">
              <span>角色</span>
              <div v-if="editPermission">
                <el-radio v-model="permission" :label="1">学生</el-radio>
                <el-radio v-model="permission" :label="2">教师</el-radio>
              </div>
              <strong v-else>{{ showPermission }}</strong>
            </div>
          </div>
          <div class="actions" v-if="editPermission">
            <el-button type="primary" @click="save(2)">保存</el-button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <h3>账号设置</h3>
            <el-button type="text" @click="toggleEdit('user')">
              {{ editUser ? '取消修改' : '修改密码' }}
            </el-button>
          </div>
          <div class="rows">
            <div class="row">
              <span>账号</span>
              <strong>{{ user.account }}</strong>
            </div>
            <div class="row">
              <span>新密码</span>
              <el-input v-if="editUser" v-model="pwd" type="password" placeholder="输入新密码" />
              <strong v-else>******</strong>
            </div>
            <div class="row" v-if="editUser">
              <span>确认密码</span>
              <el-input v-model="pwdAgain" type="password" placeholder="再次输入新密码" />
            </div>
          </div>
          <div class="actions" v-if="editUser">
            <el-button type="primary" @click="save(3)">保存</el-button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import HomeNav from 'components/content/HomeNav'
import { request } from 'network/request'
import axios from 'axios'
import { USER_AVATAR } from "../../store/mutation-type"

export default {
  name: 'Profile',
  components: {
    HomeNav
  },
  data() {
    return {
      avatar: require('../../assets/avatar/default.jpg'),
      user: {},
      schools: [],
      school: '',
      username: '',
      permission: 1,
      pwd: '',
      pwdAgain: '',
      editBasic: false,
      editPermission: false,
      editUser: false
    }
  },
  computed: {
    showSchool() {
      return this.user.school ? this.user.school.sclName : ''
    },
    showPermission() {
      return this.user.permission ? this.user.permission.pname : ''
    }
  },
  mounted() {
    this.avatar = this.resolveAvatar(this.$store.state.avatar)
    const profileInfo = request({
      url: '/api/findEntityByUid',
      method: 'get',
      params: {
        uid: this.$store.state.uid
      }
    })
    const sclInfo = request({
      url: '/api/selectSchool',
      method: 'get'
    })

    axios.all([profileInfo, sclInfo])
      .then(axios.spread((res1, res2) => {
        this.user = res1.data || {}
        this.schools = res2.data || []
        this.username = this.user.name || ''
        this.school = this.showSchool
        this.permission = this.user.permission ? this.user.permission.pid : 1
      })).catch(err => {
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
    toggleEdit(type) {
      if (type === 'basic') {
        this.editBasic = !this.editBasic
        if (!this.editBasic) {
          this.username = this.user.name
          this.school = this.showSchool
        }
      } else if (type === 'permission') {
        this.editPermission = !this.editPermission
        if (!this.editPermission) {
          this.permission = this.user.permission ? this.user.permission.pid : 1
        }
      } else {
        this.editUser = !this.editUser
        this.pwd = ''
        this.pwdAgain = ''
      }
    },
    beforeAvatarUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('头像只能是 JPG 或 PNG 格式')
      }
      if (!isLt2M) {
        this.$message.error('头像大小不能超过 2MB')
      }
      return isImage && isLt2M
    },
    uploadSuccess(res) {
      if (res !== false) {
        this.$message.success('上传成功')
        this.$store.commit(USER_AVATAR, res)
        this.avatar = this.resolveAvatar(res)
      } else {
        this.$message.error('上传失败')
      }
    },
    uploadError() {
      this.$message.error('上传失败')
    },
    save(status) {
      if (status === 1) {
        const nowSchool = this.schools.find(e => e.sclName === this.school)
        if (!nowSchool) {
          this.$message.error('请选择正确的学校')
          return
        }

        request({
          url: '/api/updateUserInfo',
          method: 'put',
          params: {
            name: this.username,
            sclID: nowSchool.sclID,
            userId: this.user.userId
          }
        }).then(() => {
          this.user.name = this.username
          this.user.school = nowSchool
          this.$message.success('基本资料已更新')
          this.editBasic = false
        }).catch(() => {
          this.$message.error('基本资料更新失败')
        })
      } else if (status === 2) {
        if (this.user.permission && this.user.permission.pid === 2) {
          this.$message.warning('教师身份暂不支持在这里直接变更')
          return
        }

        request({
          url: '/api/updateUserInfo',
          method: 'put',
          params: {
            pid: this.permission,
            userId: this.user.userId
          }
        }).then(() => {
          this.user.permission = {
            pid: this.permission,
            pname: this.permission === 1 ? '学生' : '教师'
          }
          this.$message.success('身份已更新')
          this.editPermission = false
        }).catch(() => {
          this.$message.error('身份更新失败')
        })
      } else {
        if (!this.pwd || !this.pwdAgain) {
          this.$message.warning('请先输入并确认新密码')
          return
        }
        if (this.pwd !== this.pwdAgain) {
          this.$message.error('两次输入的密码不一致')
          return
        }

        request({
          url: '/api/updateUserInfo',
          method: 'put',
          params: {
            password: this.pwd,
            userId: this.user.userId
          }
        }).then(() => {
          this.$message.success('密码已更新')
          this.editUser = false
        }).catch(() => {
          this.$message.error('密码更新失败')
        })
      }
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
    padding: 104px 0 48px;
  }

  .top {
    padding: 32px 24px;
    text-align: center;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(44, 88, 171, 0.92), rgba(50, 186, 240, 0.9));
    color: #fff;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  }

  .avatar-wrap {
    position: relative;
    width: 88px;
    height: 88px;
    margin: 0 auto 16px;
  }

  .avatar-wrap img {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  .avatar-uploader {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .avatar-wrap:hover .avatar-uploader {
    opacity: 1;
  }

  .upload-tip {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.45);
    color: #fff;
    font-size: 14px;
  }

  .top h1 {
    font-size: 30px;
    margin-bottom: 8px;
  }

  .top p {
    opacity: 0.9;
  }

  .grid {
    margin-top: 24px;
    display: grid;
    gap: 16px;
  }

  .panel {
    padding: 24px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #e2e6ed;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .panel-head h3 {
    font-size: 18px;
    color: #1f2937;
  }

  .rows {
    display: grid;
    gap: 14px;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .row > span {
    color: #64748b;
    min-width: 72px;
  }

  .row strong {
    color: #1f2937;
    font-weight: 600;
  }

  .actions {
    margin-top: 18px;
    text-align: right;
  }
</style>
