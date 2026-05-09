<template>
  <div class="page">
    <work-nav :cname="course.name" />
    <div class="shell">
      <section class="hero">
        <div>
          <h1>{{ course.name }}</h1>
          <p>课程号 {{ course.cno }} · {{ course.year }} · {{ showSemester }}</p>
        </div>
        <el-button type="primary" plain @click="gotoCourseMember">查看成员</el-button>
      </section>

      <section v-if="tasks.length" class="task-list">
        <div v-for="task in tasks" :key="task.tno" class="task-card">
          <div class="task-head">
            <div>
              <span class="badge">个人作业</span>
              <h2>{{ task.tname }}</h2>
            </div>
            <el-button type="primary" @click="gotoTask(task)">提交作业</el-button>
          </div>
          <div class="task-body">
            <div class="desc" v-html="task.description"></div>
            <div class="attachments" v-if="task.annex">
              <div
                v-for="item in annex_format(task.annex)"
                :key="item.name"
                class="annex-box"
                @click="download_annex(item.name)">
                <img :src="getIconSource(item.name.substring(10))" :alt="item.name.substring(10)" />
                <div class="annex-label">{{ item.name.substring(10) }}</div>
                <el-link href="javascript:;" type="primary" :underline="false">下载</el-link>
              </div>
            </div>
          </div>
          <div class="task-foot">
            <span>截止：{{ date_format(task.endDate) }} {{ time_format(task.endDate) }}</span>
            <span class="comment-link" @click="gotoDiscuss(task)">评论 {{ task.commentCount || 0 }}</span>
          </div>
        </div>
      </section>

      <div v-else class="empty-state">当前课程还没有作业</div>
    </div>
  </div>
</template>

<script>
import WorkNav from 'components/content/WorkNav'
import { request } from '../../network/request'
import axios from 'axios'

export default {
  name: 'StudentTask',
  components: {
    WorkNav
  },
  data() {
    return {
      course: {},
      tasks: [],
      loadKey: true
    }
  },
  computed: {
    showSemester() {
      return this.course.semester === '1' ? '第一学期' : '第二学期'
    }
  },
  mounted() {
    const taskConfig = request({
      url: '/api/taskList',
      method: 'get',
      params: {
        cno: this.$route.params.cno
      }
    })

    const courseConfig = request({
      url: '/api/course/getCourseByCno',
      method: 'get',
      params: {
        cno: this.$route.params.cno
      }
    })

    axios.all([courseConfig, taskConfig])
      .then(axios.spread((res1, res2) => {
        this.course = res1.data || {}
        this.tasks = res2.data || []
        this.loadCommentCounts()
      }))
  },
  methods: {
    date_format(date) {
      return new Date(date).format('yy/MM/dd')
    },
    time_format(date) {
      return new Date(date).format('hh:mm')
    },
    gotoTask(task) {
      this.$router.push({ path: `/studenttaskcommit/${task.cno}/${task.tno}` })
    },
    gotoDiscuss(task) {
      this.$router.push({ path: `/discuss/${task.cno}/${task.tno}` })
    },
    loadCommentCounts() {
      const requests = this.tasks.map(task => {
        return request({
          url: '/api/task/getComments',
          method: 'get',
          params: {
            tno: task.tno
          }
        }).then(res => {
          this.$set(task, 'commentCount', (res.data || []).length)
        }).catch(() => {
          this.$set(task, 'commentCount', 0)
        })
      })
      axios.all(requests)
    },
    gotoCourseMember() {
      this.$router.push(`/coursemember/${this.course.cno}`)
    },
    annex_format(annex) {
      if (!annex) return []
      return annex.split('?').map(item => ({ name: item }))
    },
    getIconSource(fileName) {
      const parts = fileName.split('.')
      try {
        return require('../../assets/fileicons/' + parts[parts.length - 1] + '.png')
      } catch (e) {
        return require('../../assets/fileicons/txt.png')
      }
    },
    download_annex(fileName) {
      const anchor = document.createElement('a')
      anchor.setAttribute('href', '/static/annex/' + fileName)
      anchor.setAttribute('download', fileName.substring(10))
      anchor.click()
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

  .hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    margin-bottom: 20px;
    padding: 28px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(44, 88, 171, 0.92), rgba(50, 186, 240, 0.9));
    color: #fff;
  }

  .hero h1 {
    font-size: 30px;
    margin-bottom: 8px;
  }

  .hero p {
    opacity: 0.92;
  }

  .task-list {
    display: grid;
    gap: 16px;
  }

  .task-card {
    border: 1px solid #e2e6ed;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    overflow: hidden;
  }

  .task-head,
  .task-body,
  .task-foot {
    padding: 20px 22px;
  }

  .task-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    border-bottom: 1px solid #eef2f7;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    background: #e8f1ff;
    color: #2c58ab;
    font-size: 12px;
    margin-bottom: 10px;
  }

  h2 {
    font-size: 20px;
    color: #1f2937;
  }

  .desc {
    color: #475569;
    line-height: 1.8;
  }

  .attachments {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
    gap: 12px;
  }

  .annex-box {
    padding: 12px;
    border-radius: 10px;
    background: #f8fbff;
    border: 1px solid #e2e6ed;
    cursor: pointer;
    text-align: center;
  }

  .annex-box img {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }

  .annex-label {
    margin: 10px 0 6px;
    font-size: 12px;
    color: #334155;
    word-break: break-all;
  }

  .task-foot {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    color: #64748b;
    border-top: 1px solid #eef2f7;
  }

  .comment-link {
    color: #2c58ab;
    cursor: pointer;
  }

  .empty-state {
    padding: 64px 20px;
    text-align: center;
    color: #64748b;
    border: 1px dashed #cbd5e1;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.75);
  }

  @media (max-width: 900px) {
    .hero,
    .task-head,
    .task-foot {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
