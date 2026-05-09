<template>
  <div class="login-page">
    <header class="site-header">
      <div class="header-inner">
        <div class="brand" @click="scrollToTop">
          <span class="brand-ai">Ai</span>
          <span>课堂派</span>
        </div>
        <nav class="nav-links">
          <a class="active" href="#home">首页</a>
          <a href="#matrix">产品矩阵</a>
          <a href="#solution">解决方案</a>
          <a href="#partner">渠道合作</a>
          <a href="#member">会员权益</a>
          <a href="#support">帮助中心</a>
          <a href="#tools" class="tool-link">AI工具集<i>New</i></a>
        </nav>
        <el-button class="enter-btn" type="primary" size="small" @click="openLogin">进入课堂</el-button>
      </div>
    </header>

    <main id="home" class="page-main">
      <section class="hero-section">
        <div class="section-badge">
          <i class="el-icon-magic-stick"></i>
          <span>AI-POWERED EDUCATION</span>
        </div>
        <h1>
          智慧教学
          <strong>新范式</strong>
        </h1>
        <p class="hero-subtitle">
          课堂派 一 面向 AI 时代的智慧教学平台<br />
          以数据智能驱动教学创新，让每一次课堂都精彩纷呈
        </p>
        <div class="hero-actions">
          <el-button type="primary" @click="openLogin">立即体验 <i class="el-icon-right"></i></el-button>
          <el-button @click="scrollToSection('matrix')"><i class="el-icon-video-play"></i> 了解更多</el-button>
        </div>

        <div class="stats-panel">
          <div v-for="item in statItems" :key="item.label">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </section>

      <section id="matrix" class="content-section matrix-section">
        <div class="section-badge">
          <i class="el-icon-menu"></i>
          <span>PRODUCT MATRIX</span>
        </div>
        <h2>全场景智慧教学产品矩阵</h2>
        <p class="section-desc">围绕教学、教研、AI、知识、门户构建可组合的数字化能力栈</p>

        <div class="product-grid">
          <article v-for="card in productCards" :key="card.title" class="product-card">
            <div class="card-head">
              <span class="product-icon" :style="{ background: card.color }">
                <i :class="card.icon"></i>
              </span>
              <em>{{ card.tag }}</em>
            </div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.sub }}</p>
            <ul>
              <li v-for="point in card.points" :key="point">{{ point }}</li>
            </ul>
            <div class="card-foot">
              <span v-for="label in card.labels" :key="label">{{ label }}</span>
              <button type="button" @click="openLogin">了解详情 <i class="el-icon-right"></i></button>
            </div>
          </article>
        </div>

        <article class="wide-card">
          <div class="wide-icon">
            <i class="el-icon-monitor"></i>
          </div>
          <div>
            <h3>课堂派教学平台一体机</h3>
            <p>集教学、作业、考试、数据分析于一体，满足课堂教学的高频使用场景。</p>
          </div>
          <ul>
            <li>一键建课</li>
            <li>成员管理</li>
            <li>作业批改</li>
          </ul>
          <button type="button" @click="openLogin">了解详情 <i class="el-icon-right"></i></button>
        </article>

        <el-button class="outline-center" plain @click="openLogin">智慧生产力全场景解决方案 <i class="el-icon-right"></i></el-button>
      </section>

      <section id="solution" class="content-section">
        <div class="section-badge">
          <i class="el-icon-guide"></i>
          <span>FULL PROCESS</span>
        </div>
        <h2>混合教学全过程管理</h2>
        <p class="section-desc">课前、课中、课后，线上线下，教学场景全过程管理</p>

        <div class="process-grid">
          <article v-for="item in processCards" :key="item.title" class="process-card">
            <span class="process-icon" :style="{ background: item.color }">
              <i :class="item.icon"></i>
            </span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </section>

      <section id="tools" class="content-section platform-section">
        <div class="section-badge">
          <i class="el-icon-cloudy"></i>
          <span>SMART PLATFORM</span>
        </div>
        <h2>智慧教学平台</h2>
        <p class="section-desc">AI 赋能的全场景教学解决方案</p>

        <div class="platform-grid">
          <article v-for="item in platformCards" :key="item.title" class="platform-card">
            <span :style="{ background: item.color }"><i :class="item.icon"></i></span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </section>

      <section id="partner" class="org-section">
        <div class="device-card">
          <div class="device-shell">
            <aside>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </aside>
            <div class="device-main">
              <div class="chart-row">
                <span style="height: 34%"></span>
                <span style="height: 58%"></span>
                <span style="height: 78%"></span>
                <span style="height: 46%"></span>
              </div>
              <div class="data-row">
                <strong>564</strong>
                <strong>434</strong>
                <em>80%</em>
              </div>
              <div class="mini-courses">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
        <div class="org-copy">
          <h2>课堂派机构版</h2>
          <p>为高校及教育机构量身定制的智慧教学解决方案</p>
          <ul>
            <li v-for="point in institutionPoints" :key="point.title">
              <i class="el-icon-check"></i>
              <span>
                <strong>{{ point.title }}</strong>
                {{ point.text }}
              </span>
            </li>
          </ul>
          <div class="org-actions">
            <el-button plain @click="scrollToSection('matrix')">了解详细功能</el-button>
            <el-button type="primary" @click="openLogin">申请免费试用</el-button>
          </div>
        </div>
      </section>

      <section id="member" class="content-section news-section">
        <div class="section-badge">
          <i class="el-icon-news"></i>
          <span>NEWS & UPDATES</span>
        </div>
        <h2>新闻动态</h2>
        <p class="section-desc">了解课堂派最新动态与教育科技前沿</p>
        <div class="news-grid">
          <article v-for="item in newsCards" :key="item.title" class="news-card">
            <div class="news-cover" :class="item.cover">
              <span>{{ item.coverText }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
            <button type="button" @click="openLogin">查看详情 <i class="el-icon-right"></i></button>
          </article>
        </div>
        <el-button class="outline-center" plain @click="openLogin">查看更多新闻 <i class="el-icon-arrow-down"></i></el-button>
      </section>

      <section class="welcome-section">
        <span class="welcome-icon"><i class="el-icon-collection"></i></span>
        <h2>欢迎使用课堂派</h2>
        <p>精彩教学，从这里开启</p>
        <div>
          <el-button @click="openLogin"><i class="el-icon-phone-outline"></i> 联系课堂派</el-button>
          <el-button type="primary" @click="register">免费注册 <i class="el-icon-right"></i></el-button>
        </div>
      </section>
    </main>

    <footer id="support" class="site-footer">
      <div class="footer-inner">
        <div>
          <div class="footer-logo">Ai课堂派</div>
          <nav>
            <a href="#home">关于我们</a>
            <a href="#support">服务条款</a>
            <a href="#member">产品动态</a>
            <a href="#tools">浏览器下载</a>
            <a href="#home">语言⌄</a>
          </nav>
        </div>
        <div class="contact">
          <strong>联系我们</strong>
          <span>工作日 09:30-18:30</span>
          <b><i class="el-icon-phone"></i> 010-57748642</b>
          <b><i class="el-icon-message"></i> hi@ketangpai.com</b>
        </div>
        <div class="qr-list">
          <span></span>
          <span></span>
        </div>
      </div>
      <p class="copyright">Copyright © 2014 ketangpai.com All Rights Reserved.</p>
    </footer>

    <button class="back-top" type="button" @click="scrollToTop">
      <i class="el-icon-top"></i>
      顶部
    </button>

    <el-dialog
      title="账号登录"
      :visible.sync="loginVisible"
      width="430px"
      custom-class="login-dialog"
      append-to-body>
      <div class="login-form">
        <el-input
          v-model="account"
          prefix-icon="el-icon-user"
          placeholder="请输入账号"
          clearable
          @keyup.enter.native="openCaptcha" />
        <el-input
          v-model="pwd"
          prefix-icon="el-icon-lock"
          type="password"
          placeholder="请输入密码"
          show-password
          clearable
          @keyup.enter.native="openCaptcha" />
        <div class="login-meta">
          <el-checkbox v-model="checked">下次自动登录</el-checkbox>
          <span @click="register">立即注册</span>
        </div>
        <el-button class="login-submit" type="primary" :loading="logging" @click="openCaptcha">登录</el-button>
      </div>
    </el-dialog>

    <el-dialog title="安全验证" :visible.sync="captchaVisible" width="380px" append-to-body>
      <slide-verify
        ref="slideblock"
        :l="42"
        :r="10"
        :w="310"
        :h="155"
        :imgs="imgs"
        slider-text="向右滑动"
        @success="onSuccess"
        @fail="onFail" />
    </el-dialog>
  </div>
</template>

<script>
import verify1 from 'assets/img/verify1.jpg'
import verify3 from 'assets/img/verify3.jpg'
import verify4 from 'assets/img/verify4.jpg'
import verify5 from 'assets/img/verify5.jpg'
import verify6 from 'assets/img/verify6.jpg'
import verify7 from 'assets/img/verify7.jpg'
import { request } from 'network/request'
import { IS_LOGIN, CHANGE_UID, USER_AVATAR, PERMISSION, CHANGE_NAME } from "../../store/mutation-type"

export default {
  name: 'Login',
  data() {
    return {
      account: '',
      pwd: '',
      checked: false,
      logging: false,
      loginVisible: false,
      captchaVisible: false,
      imgs: [verify1, verify3, verify4, verify5, verify6, verify7],
      statItems: [
        { value: '2000万+', label: '注册用户' },
        { value: '500+', label: '合作院校' },
        { value: '10年+', label: '教育科技' },
        { value: '99.99%', label: '服务可用性' }
      ],
      productCards: [
        {
          title: '课堂派教学平台',
          sub: '智慧教学 · 全程互动 · 数据赋能',
          tag: '教学OS',
          color: '#3478f6',
          icon: 'el-icon-monitor',
          labels: ['课堂', '作业', '数据'],
          points: ['重塑课堂交互新范式，全链路数据赋能教学创新。', '从课前预习到课后评价，实现以学生为中心的个性化培养。']
        },
        {
          title: '虚拟教研室',
          sub: '云端协作 · 资源沉淀 · 共同成长',
          tag: '协同云',
          color: '#8b4df6',
          icon: 'el-icon-user',
          labels: ['协作', '教研', '资源'],
          points: ['打破时空边界的数字化教研协作空间。', '结构化沉淀优秀备课资源与教学反思。']
        },
        {
          title: 'PAI智能体平台',
          sub: '人机协同 · 智能助教 · 效率革命',
          tag: 'AI智能体',
          color: '#12b886',
          icon: 'el-icon-cpu',
          labels: ['AI助教', '备课', '学情'],
          points: ['低代码构建专属 AI 智能体，重构教学管理生产力。', '7x24 小时智能助教在线，提供个性化答疑与辅导。']
        },
        {
          title: '知识图谱平台',
          sub: '知识建模 · 路径推荐 · 能力画像',
          tag: '认知图谱',
          color: '#ff8a1f',
          icon: 'el-icon-share',
          labels: ['图谱', '画像', '推荐'],
          points: ['构建课程知识网络，清晰呈现知识点之间的关系。', '基于学习行为推荐路径，帮助学生补齐薄弱环节。']
        },
        {
          title: '多场景知识库',
          sub: '资料沉淀 · 多端检索 · 精准问答',
          tag: '知识库',
          color: '#ef4b86',
          icon: 'el-icon-notebook-2',
          labels: ['资料', '问答', '检索'],
          points: ['资料统一归集，教学内容可追溯、可复用。', '面向课程场景提供智能搜索和问答服务。']
        }
      ],
      processCards: [
        { title: '作业', color: '#12c48b', icon: 'el-icon-edit-outline', text: '81 种文档格式作业在线展示和批阅，支持查重、精准对比，避免学生抄袭。' },
        { title: '考试/练习', color: '#ffcb19', icon: 'el-icon-document-checked', text: '单选、多选、填空、简答等题型，支持题库随机抽题组卷。' },
        { title: '课件资料', color: '#6bd319', icon: 'el-icon-folder-opened', text: '课件、资料、话题和公告等教学内容统一沉淀，课后可回看。' },
        { title: '课中互动', color: '#ff8a1f', icon: 'el-icon-chat-line-square', text: '签到、讨论、弹幕、抢答、投票等课堂互动，让课堂更精彩。' },
        { title: '考勤签到', color: '#f8ad13', icon: 'el-icon-date', text: '二维码、数字口令、GPS 等签到方式，考勤数据自动生成。' },
        { title: '成绩管理', color: '#ff5b17', icon: 'el-icon-reading', text: '汇总互动数据、平时成绩、期末成绩，形成全过程成长画像。' },
        { title: '教学数据分析', color: '#4b86e8', icon: 'el-icon-data-analysis', text: '全方位教学数据可视化，辅助老师掌握班级学情。' },
        { title: '直播-云录屏', color: '#ee4d5a', icon: 'el-icon-video-camera', text: '满足线上线下混合式教学，课后自动生成回放资源。' }
      ],
      platformCards: [
        { title: '线下互动课堂', color: '#ff6b12', icon: 'el-icon-chat-dot-square', text: '多种互动教学工具，沉浸式学习体验。' },
        { title: '混合教学全过程管理', color: '#4f85f6', icon: 'el-icon-pie-chart', text: '课前课中课后全流程教学管理，数据可视化。' },
        { title: '在线直播教室', color: '#10caa0', icon: 'el-icon-video-play', text: '在线直播教学搭配教学互动，还原真实课堂。' },
        { title: '在线课程建设', color: '#ff6b8f', icon: 'el-icon-postcard', text: '精品课程资源建设，沉淀数字化教学资产。' }
      ],
      institutionPoints: [
        { title: '精准高效管理教学事务', text: '一键对接教务系统，精准高效管理师生教学、课程、服务。' },
        { title: '有效提升教学质量', text: '以课堂教学为核心，实时监控师生、课程、教学活动全过程。' },
        { title: '教学资产管理', text: '沉淀教学过程资产，促进优质课程、资源、知识图谱建设。' },
        { title: '智慧校园全景定制', text: '以学生为中心，以教学为导向，提供校园全景智慧教学解决方案。' }
      ],
      newsCards: [
        { cover: 'cover-blue', coverText: '5.0计划', title: '爱课互动携手教学软件启动教育生态计划', text: '以数字化平台能力连接课堂、教研与教学评价，持续推动教学创新。' },
        { cover: 'cover-red', coverText: '案例收录证明', title: '课堂派再次喜获国家级优秀案例荣誉', text: '课堂派智慧教学实践入选典型案例，助力更多高校建设智慧课堂。' },
        { cover: 'cover-gray', coverText: '2024 信息技术', title: '国家级典型解决方案：课堂派成功入围', text: '以全场景教学平台服务高校，提升课堂质量与教学管理效率。' }
      ]
    }
  },
  methods: {
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },
    scrollToSection(id) {
      const target = document.getElementById(id)
      target && target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    },
    register() {
      this.$router.push('/register')
    },
    openLogin() {
      this.loginVisible = true
      this.$nextTick(() => {
        const input = document.querySelector('.login-dialog input')
        input && input.focus()
      })
    },
    openCaptcha() {
      if (!this.account || !this.pwd) {
        this.$message.warning('请先填写账号和密码')
        return
      }
      this.captchaVisible = true
    },
    onSuccess() {
      this.captchaVisible = false
      this.submitLogin()
    },
    onFail() {
      this.$message.error('验证失败，请重试')
    },
    submitLogin() {
      if (this.logging) return
      this.logging = true
      request({
        url: '/api/verify',
        method: 'get',
        params: {
          password: this.pwd,
          account: this.account,
          func: 'login'
        }
      }).then(res => {
        if (!res.data) {
          this.$message.error('账号或密码不正确')
          this.$refs.slideblock && this.$refs.slideblock.reset()
          this.pwd = ''
          return
        }

        request({
          url: '/api/findOneEntity',
          method: 'get',
          params: {
            account: this.account
          }
        }).then(res => {
          this.$store.commit(IS_LOGIN, this.account)
          this.$store.commit(CHANGE_UID, res.data.userId)
          this.$store.commit(USER_AVATAR, res.data.avatar)
          this.$store.commit(PERMISSION, res.data.permission.pid)
          this.$store.commit(CHANGE_NAME, res.data.name)

          if (this.checked) {
            this.$cookies.set('user', {
              uid: res.data.userId,
              avatar: res.data.avatar,
              permission: res.data.permission.pid,
              name: res.data.name,
              account: res.data.account
            })
          }

          this.loginVisible = false
          this.$message.success('登录成功')
          setTimeout(() => {
            this.$router.push('/home')
          }, 500)
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        this.logging = false
      })
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  color: #0d1934;
  background:
    radial-gradient(circle at 18% 16%, rgba(217, 235, 255, 0.72), transparent 28%),
    radial-gradient(circle at 82% 18%, rgba(226, 248, 229, 0.82), transparent 32%),
    radial-gradient(circle at 52% 54%, rgba(231, 251, 238, 0.75), transparent 42%),
    #f7fbff;
  overflow-x: hidden;
}

.login-page::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.68;
  background-image:
    radial-gradient(circle, rgba(57, 133, 255, 0.55) 1.2px, transparent 1.5px),
    linear-gradient(36deg, transparent 0 47%, rgba(111, 170, 255, 0.22) 48% 49%, transparent 50%),
    linear-gradient(112deg, transparent 0 48%, rgba(111, 170, 255, 0.15) 49% 50%, transparent 51%);
  background-size: 112px 112px, 280px 280px, 340px 340px;
  background-position: 18px 24px, 0 0, 60px 80px;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 72px;
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid rgba(225, 232, 245, 0.9);
  backdrop-filter: blur(18px);
}

.header-inner {
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 38px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #3878ff;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0;
  cursor: pointer;
  white-space: nowrap;
}

.brand-ai {
  font-style: italic;
}

.nav-links {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 30px;
  color: #0d1934;
  font-size: 16px;
  font-weight: 600;
}

.nav-links a {
  position: relative;
  height: 72px;
  display: inline-flex;
  align-items: center;
}

.nav-links a::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  border-radius: 999px;
  background: #2f74ff;
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.nav-links a:hover::after,
.nav-links a.active::after {
  transform: scaleX(1);
}

.tool-link i {
  margin-left: 4px;
  color: #ff2f4b;
  font-size: 12px;
  font-style: normal;
  transform: translateY(-7px);
}

.enter-btn {
  min-width: 92px;
  height: 36px;
  border-radius: 5px;
  background: #3d82ff;
  border-color: #3d82ff;
  font-weight: 700;
}

.page-main,
.site-footer,
.back-top {
  position: relative;
  z-index: 1;
}

.hero-section {
  min-height: 720px;
  padding: 108px 24px 86px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.section-badge {
  min-height: 36px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8px 28px rgba(42, 97, 189, 0.08);
  color: #3777ff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.8px;
}

.hero-section h1 {
  margin: 36px 0 24px;
  font-size: 62px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0;
}

.hero-section h1 strong {
  display: block;
  color: #5557ff;
}

.hero-subtitle {
  color: #5e6a81;
  font-size: 18px;
  line-height: 2;
}

.hero-actions {
  margin: 36px 0 70px;
  display: flex;
  justify-content: center;
  gap: 18px;
}

.hero-actions .el-button {
  min-width: 138px;
  height: 54px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 800;
}

.hero-actions .el-button--primary,
.login-submit,
.org-actions .el-button--primary,
.welcome-section .el-button--primary {
  background: linear-gradient(180deg, #377cff 0%, #1556e8 100%);
  border-color: #2368f4;
  box-shadow: 0 10px 24px rgba(34, 99, 235, 0.28);
}

.stats-panel {
  width: min(880px, 100%);
  min-height: 138px;
  padding: 28px 56px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 50px rgba(35, 69, 113, 0.08);
}

.stats-panel strong {
  display: block;
  margin-bottom: 10px;
  color: #315eff;
  font-size: 34px;
  line-height: 1;
}

.stats-panel span {
  color: #536178;
  font-size: 13px;
  font-weight: 700;
}

.content-section {
  width: min(1160px, calc(100% - 48px));
  margin: 0 auto;
  padding: 74px 0 56px;
  text-align: center;
}

.content-section h2,
.org-copy h2,
.welcome-section h2 {
  margin: 28px 0 14px;
  font-size: 42px;
  line-height: 1.2;
  color: #111b34;
  letter-spacing: 0;
}

.section-desc {
  margin-bottom: 56px;
  color: #66738a;
  font-size: 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  text-align: left;
}

.product-card {
  min-height: 318px;
  padding: 28px;
  border: 1px solid rgba(226, 234, 247, 0.96);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 44px rgba(33, 67, 113, 0.08);
}

.card-head {
  margin-bottom: 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-icon,
.process-icon {
  width: 50px;
  height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #fff;
  font-size: 24px;
}

.card-head em {
  padding: 7px 12px;
  border-radius: 999px;
  background: #edf4ff;
  color: #4779ff;
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
}

.product-card h3 {
  margin-bottom: 9px;
  font-size: 21px;
  color: #13203a;
}

.product-card p {
  margin-bottom: 22px;
  color: #8b97aa;
}

.product-card li {
  position: relative;
  min-height: 42px;
  padding-left: 16px;
  color: #526179;
  font-size: 14px;
  line-height: 1.6;
}

.product-card li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #316fff;
}

.card-foot {
  margin-top: 12px;
  padding-top: 18px;
  border-top: 1px solid #e8eef8;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-foot span {
  padding: 6px 10px;
  border-radius: 5px;
  background: #f2f6fb;
  color: #6d7890;
  font-size: 12px;
  font-weight: 700;
}

.card-foot button,
.wide-card button,
.news-card button {
  margin-left: auto;
  border: 0;
  background: #eef5ff;
  color: #2f74ff;
  font-weight: 800;
  cursor: pointer;
}

.wide-card {
  margin-top: 22px;
  padding: 22px 26px;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 24px;
  text-align: left;
  border: 1px solid #8bb6ff;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.86);
}

.wide-icon {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #162234;
  color: #fff;
  font-size: 24px;
}

.wide-card h3 {
  margin-bottom: 8px;
  color: #14213b;
}

.wide-card p,
.wide-card li {
  color: #65738a;
}

.wide-card ul {
  display: flex;
  gap: 14px;
  font-size: 13px;
  font-weight: 700;
}

.outline-center {
  min-width: 220px;
  height: 44px;
  margin-top: 42px;
  border-color: #2f74ff;
  color: #2f74ff;
  border-radius: 8px;
  font-weight: 800;
}

.process-grid,
.platform-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.process-card,
.platform-card {
  min-height: 242px;
  padding: 34px 28px;
  border: 1px solid rgba(232, 239, 249, 0.92);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 16px 38px rgba(35, 67, 113, 0.06);
}

.process-card h3,
.platform-card h3 {
  margin: 22px 0 14px;
  color: #14213b;
  font-size: 21px;
}

.process-card p,
.platform-card p {
  color: #65738a;
  line-height: 1.75;
}

.platform-section {
  padding-top: 96px;
}

.platform-card {
  min-height: 210px;
}

.platform-card span {
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #fff;
  font-size: 22px;
  box-shadow: 0 12px 30px rgba(74, 115, 212, 0.12);
}

.org-section {
  width: min(1160px, calc(100% - 48px));
  margin: 0 auto;
  padding: 82px 0 94px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 72px;
  align-items: center;
}

.device-card {
  min-height: 390px;
  padding: 38px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 26px 54px rgba(35, 67, 113, 0.12);
}

.device-shell {
  height: 306px;
  display: grid;
  grid-template-columns: 92px 1fr;
  overflow: hidden;
  border: 6px solid #263140;
  border-radius: 10px;
  background: #fff;
}

.device-shell aside {
  padding: 28px 16px;
  background: #1c2735;
}

.device-shell aside span {
  display: block;
  height: 16px;
  margin-bottom: 18px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.16);
}

.device-main {
  padding: 28px;
}

.chart-row {
  height: 112px;
  display: flex;
  align-items: flex-end;
  gap: 18px;
  border-bottom: 1px solid #e7edf7;
}

.chart-row span {
  width: 38px;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(180deg, #ff5ba4, #ff8fc5);
}

.data-row {
  height: 74px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.data-row strong {
  font-size: 28px;
}

.data-row em {
  width: 54px;
  height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #2f74ff;
  border: 7px solid #dbe8ff;
  font-style: normal;
  font-weight: 900;
}

.mini-courses {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.mini-courses span {
  height: 54px;
  border-radius: 7px;
}

.mini-courses span:nth-child(1) {
  background: #2f74ff;
}

.mini-courses span:nth-child(2) {
  background: #22a6f2;
}

.mini-courses span:nth-child(3) {
  background: #a045f8;
}

.org-copy {
  text-align: left;
}

.org-copy h2 {
  margin-top: 0;
}

.org-copy > p {
  margin-bottom: 34px;
  color: #65738a;
  font-size: 17px;
}

.org-copy li {
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  color: #65738a;
  line-height: 1.7;
}

.org-copy li i {
  width: 28px;
  height: 28px;
  margin-top: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #11b981;
  color: #fff;
  font-weight: 900;
}

.org-copy li strong {
  display: block;
  margin-bottom: 4px;
  color: #14213b;
  font-size: 18px;
}

.org-actions {
  margin-top: 30px;
  display: flex;
  gap: 16px;
}

.org-actions .el-button {
  width: 146px;
  height: 52px;
  border-radius: 10px;
  font-weight: 800;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
  text-align: left;
}

.news-card {
  overflow: hidden;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 20px 46px rgba(35, 67, 113, 0.09);
}

.news-cover {
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  font-weight: 900;
}

.cover-blue {
  background: linear-gradient(135deg, #1877f2, #58c4ff);
}

.cover-red {
  background: linear-gradient(135deg, #b8202b, #f0d5ad);
}

.cover-gray {
  background: linear-gradient(135deg, #e5e9ef, #8d98a7);
  color: #243048;
}

.news-card h3 {
  padding: 24px 24px 10px;
  color: #14213b;
  font-size: 21px;
  line-height: 1.4;
}

.news-card p {
  min-height: 92px;
  padding: 0 24px;
  color: #65738a;
  line-height: 1.7;
}

.news-card button {
  margin: 18px 24px 26px;
  padding: 10px 16px;
  border-radius: 6px;
}

.welcome-section {
  width: min(1160px, calc(100% - 48px));
  min-height: 420px;
  margin: 84px auto;
  padding: 72px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 30px 70px rgba(35, 67, 113, 0.1);
}

.welcome-icon {
  width: 78px;
  height: 78px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #fff;
  color: #3377ff;
  font-size: 42px;
  box-shadow: 0 16px 34px rgba(35, 67, 113, 0.08);
}

.welcome-section p {
  margin: 8px 0 38px;
  color: #65738a;
  font-size: 18px;
}

.welcome-section .el-button {
  min-width: 150px;
  height: 52px;
  border-radius: 10px;
  font-weight: 800;
}

.site-footer {
  color: #dce5f4;
  background: #252d39;
}

.footer-inner {
  width: min(1160px, calc(100% - 48px));
  min-height: 230px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 74px;
}

.footer-logo {
  margin-bottom: 44px;
  color: #fff;
  font-size: 34px;
  font-weight: 900;
}

.site-footer nav {
  display: flex;
  gap: 58px;
  color: #fff;
  font-weight: 800;
}

.contact {
  display: grid;
  gap: 10px;
  color: #fff;
}

.contact strong {
  font-size: 16px;
}

.contact span {
  color: #9aa7b8;
}

.contact b {
  font-size: 18px;
}

.qr-list {
  display: flex;
  gap: 18px;
}

.qr-list span {
  width: 118px;
  height: 118px;
  border: 8px solid #fff;
  background:
    linear-gradient(90deg, #111 10px, transparent 10px) 0 0 / 22px 22px,
    linear-gradient(#111 10px, transparent 10px) 0 0 / 22px 22px,
    #fff;
}

.copyright {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #748094;
}

.back-top {
  position: fixed;
  right: 18px;
  bottom: 90px;
  width: 46px;
  height: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 1px solid #e1e8f3;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  color: #69778e;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(35, 67, 113, 0.08);
}

.login-form {
  display: grid;
  gap: 18px;
}

.login-form >>> .el-input__inner {
  height: 46px;
  border-radius: 8px;
}

.login-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-meta span {
  color: #2f67d8;
  cursor: pointer;
  user-select: none;
}

.login-submit {
  width: 100%;
  height: 46px;
  border-radius: 8px;
  font-size: 16px;
}

@media (max-width: 1180px) {
  .nav-links {
    gap: 18px;
    font-size: 14px;
  }

  .product-grid,
  .news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .process-grid,
  .platform-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 920px) {
  .header-inner {
    justify-content: space-between;
  }

  .nav-links {
    display: none;
  }

  .hero-section h1 {
    font-size: 48px;
  }

  .stats-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 26px;
  }

  .wide-card,
  .org-section,
  .footer-inner {
    grid-template-columns: 1fr;
  }

  .footer-inner {
    padding: 48px 0;
  }
}

@media (max-width: 640px) {
  .brand {
    font-size: 24px;
  }

  .hero-section {
    padding-top: 70px;
  }

  .hero-section h1 {
    font-size: 38px;
  }

  .hero-subtitle {
    font-size: 15px;
  }

  .hero-actions,
  .org-actions,
  .welcome-section > div,
  .site-footer nav {
    flex-direction: column;
  }

  .stats-panel,
  .product-grid,
  .process-grid,
  .platform-grid,
  .news-grid {
    grid-template-columns: 1fr;
  }

  .content-section h2,
  .org-copy h2,
  .welcome-section h2 {
    font-size: 30px;
  }

  .device-card {
    padding: 18px;
  }

  .device-shell {
    grid-template-columns: 62px 1fr;
  }

  .qr-list {
    flex-wrap: wrap;
  }
}
</style>
