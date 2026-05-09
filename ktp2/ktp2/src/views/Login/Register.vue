<template>
  <div class="register-page">
    <div class="register-shell">
      <div class="intro">
        <img class="brand-logo" src="../../assets/img/logo.png" alt="课堂派" />
        <h1>创建你的课堂账号</h1>
        <p>先选择角色，再补全基础信息和学校信息，最后完成安全验证。</p>
        <div class="role-list" v-if="status === 1">
          <div class="role-item" @click="status = 3">
            <strong>我是教师 / 助教</strong>
            <span>创建课程、发布作业、批改成绩</span>
          </div>
          <div class="role-item" @click="status = 2">
            <strong>我是学生</strong>
            <span>加入课程、提交作业、查看反馈</span>
          </div>
        </div>
      </div>

      <div class="form-panel">
        <template v-if="status === 1">
          <div class="panel-head">选择身份</div>
          <div class="entry-grid">
            <button class="entry-card teacher" @click.prevent="status = 3">教师 / 助教注册</button>
            <button class="entry-card student" @click.prevent="status = 2">学生注册</button>
          </div>
          <div class="back-link" @click="login">已有账号，去登录</div>
        </template>

        <template v-else>
          <div class="panel-head">
            <i class="el-icon-back" @click="changeStatus" />
            <span>{{ roleTitle }}</span>
          </div>

          <div class="fields">
            <div class="field">
              <el-input v-model="account" placeholder="账号" clearable @blur="verifyAccountExist" />
              <div class="hint" v-if="errors.account">{{ errors.account }}</div>
            </div>
            <div class="field">
              <el-input v-model="pwd" type="password" placeholder="密码" clearable @blur="validatePwd" />
              <div class="hint" v-if="errors.pwd">{{ errors.pwd }}</div>
            </div>
            <div class="field">
              <el-input v-model="pwdAgain" type="password" placeholder="再次输入密码" clearable @blur="validatePwd" />
              <div class="hint" v-if="errors.pwdAgain">{{ errors.pwdAgain }}</div>
            </div>
            <div class="field">
              <el-input v-model="name" placeholder="姓名" clearable @blur="validateRequired('name')" />
              <div class="hint" v-if="errors.name">{{ errors.name }}</div>
            </div>
            <div class="field" v-if="status === 2">
              <el-input v-model="identityNo" placeholder="学号" clearable @blur="validateRequired('identityNo')" />
              <div class="hint" v-if="errors.identityNo">{{ errors.identityNo }}</div>
            </div>
            <div class="field">
              <el-select
                v-model="school"
                filterable
                remote
                reserve-keyword
                placeholder="学校"
                :remote-method="remoteMethod"
                :loading="loading"
                value-key="sclID"
                style="width: 100%">
                <el-option
                  v-for="item in options"
                  :key="item.sclID"
                  :label="item.sclName"
                  :value="item" />
              </el-select>
              <div class="hint" v-if="errors.school">{{ errors.school }}</div>
            </div>
            <div class="captcha">
              <slide-verify
                :l="42"
                :r="10"
                :w="310"
                :h="155"
                :imgs="imgs"
                slider-text="向右滑动"
                @success="onSuccess"
                @fail="onFail" />
            </div>
            <el-button class="submit-btn" type="primary" :loading="submitting" @click="register">
              {{ status === 2 ? '注册学生账号' : '注册教师账号' }}
            </el-button>
          </div>

          <div class="back-link" @click="login">已有账号，去登录</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import verify1 from 'assets/img/verify1.jpg'
import verify3 from 'assets/img/verify3.jpg'
import verify4 from 'assets/img/verify4.jpg'
import verify5 from 'assets/img/verify5.jpg'
import verify6 from 'assets/img/verify6.jpg'
import verify7 from 'assets/img/verify7.jpg'
import { request } from '../../network/request.js'
import { IS_LOGIN, USER_AVATAR, CHANGE_UID, PERMISSION, CHANGE_NAME } from "../../store/mutation-type"

export default {
  name: 'Register',
  data() {
    return {
      status: 1,
      account: '',
      pwd: '',
      pwdAgain: '',
      name: '',
      identityNo: '',
      school: null,
      schools: [],
      options: [],
      loading: false,
      imgs: [verify1, verify3, verify4, verify5, verify6, verify7],
      verify: false,
      accountExist: false,
      submitting: false,
      errors: {}
    }
  },
  computed: {
    roleTitle() {
      return this.status === 2 ? '学生注册' : '教师 / 助教注册'
    }
  },
  mounted() {
    request({
      url: '/api/selectSchool',
      method: 'get'
    }).then(res => {
      this.schools = res.data || []
      this.options = this.schools.slice(0, 20)
    }).catch(err => {
      console.log(err)
    })
  },
  methods: {
    login() {
      this.$router.push('/')
    },
    remoteMethod(query) {
      if (!query) {
        this.options = this.schools.slice(0, 20)
        return
      }
      this.loading = true
      setTimeout(() => {
        this.options = this.schools.filter(item => item.sclName.indexOf(query) > -1)
        this.loading = false
      }, 180)
    },
    onSuccess() {
      this.verify = true
      this.$message.success('验证通过')
    },
    onFail() {
      this.verify = false
      this.$message.error('验证失败，请重试')
    },
    changeStatus() {
      this.status = 1
      this.account = ''
      this.pwd = ''
      this.pwdAgain = ''
      this.name = ''
      this.identityNo = ''
      this.school = null
      this.options = this.schools.slice(0, 20)
      this.accountExist = false
      this.verify = false
      this.errors = {}
    },
    validateRequired(field) {
      const messages = {
        name: '姓名不能为空',
        identityNo: '学号不能为空',
        school: '请选择学校'
      }
      if (field === 'school') {
        this.errors.school = this.school ? '' : messages.school
        return
      }
      this.errors[field] = this[field] ? '' : messages[field]
    },
    validatePwd() {
      this.errors.pwd = this.pwd ? '' : '密码不能为空'
      this.errors.pwdAgain = this.pwdAgain ? '' : '请再次输入密码'
      if (this.pwd && this.pwdAgain && this.pwd !== this.pwdAgain) {
        this.errors.pwdAgain = '两次密码不一致'
      }
    },
    verifyAccountExist() {
      if (!this.account) {
        this.errors.account = '账号不能为空'
        return
      }
      request({
        url: '/api/verify',
        method: 'get',
        params: {
          account: this.account,
          password: '',
          func: 'register'
        }
      }).then(res => {
        this.accountExist = !res.data
        this.errors.account = this.accountExist ? '该账号已存在' : ''
      }).catch(err => {
        console.log(err)
      })
    },
    isFormValid() {
      this.validateRequired('name')
      if (this.status === 2) {
        this.validateRequired('identityNo')
      }
      this.validateRequired('school')
      this.validatePwd()

      if (!this.account) this.errors.account = '账号不能为空'
      if (!this.pwd) this.errors.pwd = '密码不能为空'
      if (!this.pwdAgain) this.errors.pwdAgain = '请再次输入密码'
      if (!this.verify) this.$message.warning('请先完成滑块验证')

      return !this.errors.account &&
        !this.errors.pwd &&
        !this.errors.pwdAgain &&
        !this.errors.name &&
        !this.errors.identityNo &&
        !this.errors.school &&
        this.verify &&
        !this.accountExist &&
        this.account &&
        this.pwd &&
        this.pwd === this.pwdAgain &&
        this.school
    },
    register() {
      if (!this.isFormValid()) {
        this.$message.warning('请先补全信息')
        return
      }

      this.submitting = true
      const payload = {
        account: this.account,
        password: this.pwd,
        name: this.name,
        permission: this.status === 2 ? { pid: 1, pname: '学生' } : { pid: 2, pname: '教师' },
        school: this.school
      }

      if (this.status === 2) {
        payload.identifyNo = this.identityNo
      }

      request({
        url: '/api/register',
        method: 'post',
        data: payload
      }).then(() => {
        this.$message.success('注册成功')
        return request({
          url: '/api/findOneEntity',
          method: 'get',
          params: {
            account: this.account
          }
        })
      }).then(res => {
        this.$store.commit(IS_LOGIN, this.account)
        this.$store.commit(CHANGE_UID, res.data.userId)
        this.$store.commit(USER_AVATAR, res.data.avatar)
        this.$store.commit(PERMISSION, res.data.permission.pid)
        this.$store.commit(CHANGE_NAME, res.data.name)
        setTimeout(() => {
          this.$router.replace('/home')
        }, 600)
      }).catch(err => {
        console.log(err)
        this.$message.error('注册失败，请重试')
      }).finally(() => {
        this.submitting = false
      })
    }
  }
}
</script>

<style scoped>
  .register-page {
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
  }

  .register-shell {
    width: min(1120px, 100%);
    display: grid;
    grid-template-columns: 1fr 0.92fr;
    gap: 28px;
  }

  .intro,
  .form-panel {
    border: 1px solid rgba(226, 230, 237, 0.95);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  }

  .intro {
    padding: 54px;
    color: #fff;
    background:
      linear-gradient(135deg, rgba(44, 88, 171, 0.92), rgba(50, 186, 240, 0.9));
    min-height: 640px;
  }

  .brand-logo {
    width: 56px;
    height: 56px;
    object-fit: contain;
    margin-bottom: 18px;
  }

  .intro h1 {
    font-size: 34px;
    line-height: 1.2;
    margin-bottom: 16px;
  }

  .intro p {
    max-width: 420px;
    line-height: 1.75;
    color: rgba(255, 255, 255, 0.9);
  }

  .role-list {
    margin-top: 36px;
    display: grid;
    gap: 16px;
  }

  .role-item {
    padding: 18px 20px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
  }

  .role-item strong {
    display: block;
    font-size: 16px;
    margin-bottom: 6px;
  }

  .role-item span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.82);
  }

  .form-panel {
    padding: 42px;
    min-height: 640px;
  }

  .panel-head {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 22px;
  }

  .entry-grid {
    display: grid;
    gap: 16px;
  }

  .entry-card {
    min-height: 104px;
    border-radius: 12px;
    border: 1px solid #dbe3f0;
    background: #f8fbff;
    text-align: left;
    padding: 18px 20px;
    cursor: pointer;
    color: #1f2937;
    font-size: 16px;
    font-weight: 600;
  }

  .entry-card.teacher {
    border-color: rgba(44, 88, 171, 0.18);
  }

  .entry-card.student {
    border-color: rgba(50, 186, 240, 0.18);
  }

  .fields {
    display: grid;
    gap: 14px;
  }

  .field {
    display: grid;
    gap: 6px;
  }

  .hint {
    min-height: 18px;
    font-size: 12px;
    color: #ef4444;
  }

  .captcha {
    padding-top: 6px;
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    border-radius: 10px;
    margin-top: 4px;
  }

  .back-link {
    margin-top: 18px;
    font-size: 14px;
    color: #2c58ab;
    cursor: pointer;
    text-align: right;
  }

  .el-icon-back {
    cursor: pointer;
  }

  @media (max-width: 900px) {
    .register-shell {
      grid-template-columns: 1fr;
    }

    .intro,
    .form-panel {
      min-height: auto;
      padding: 28px;
    }
  }
</style>
