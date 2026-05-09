<template>
  <div class="page">
    <task-commit-nav :cname="course.name" @back="back" />
    <div class="shell">
      <section class="header">
        <div>
          <h1>{{ task.tname }}</h1>
          <p>课程：{{ course.name }}</p>
        </div>
      </section>

      <section class="comment-box">
        <div class="composer">
          <img :src="avatar" alt="头像" />
          <el-input
            type="textarea"
            :rows="5"
            placeholder="写下你的评论"
            v-model="textarea" />
        </div>
        <div class="actions">
          <el-button type="primary" :disabled="textarea === ''" @click="createComment">发布评论</el-button>
        </div>
      </section>

      <section class="list">
        <div v-for="item in comments" :key="item.cmId" class="comment-card">
          <div class="comment-top">
            <img :src="resolveAvatar(item.user.avatar)" alt="头像" />
            <div>
              <strong>{{ item.user.name }}</strong>
              <span>{{ item.user.userId }}</span>
            </div>
            <time>{{ date_format(item.cmDate) }} {{ time_format(item.cmDate) }}</time>
          </div>
          <div class="comment-text">{{ item.comment }}</div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import TaskCommitNav from 'components/content/TaskCommitNav'
import { request } from '../../network/request'
import axios from 'axios'

export default {
  name: 'Discuss',
  components: {
    TaskCommitNav
  },
  data() {
    return {
      textarea: '',
      task: {},
      comments: [],
      course: {},
      avatar: require('../../assets/avatar/default.jpg')
    }
  },
  mounted() {
    this.avatar = this.resolveAvatar(this.$store.state.avatar)
    const commentConfig = request({
      url: '/api/task/getComments',
      method: 'get',
      params: {
        tno: this.$route.params.tno
      }
    })
    const courseConfig = request({
      url: '/api/course/getCourseByCno',
      method: 'get',
      params: {
        cno: this.$route.params.cno
      }
    })
    const taskConfig = request({
      url: '/api/taskList',
      method: 'get',
      params: {
        cno: this.$route.params.cno,
        tno: this.$route.params.tno
      }
    })

    axios.all([commentConfig, courseConfig, taskConfig])
      .then(axios.spread((res1, res2, res3) => {
        this.course = res2.data || {}
        this.task = (res3.data && res3.data[0]) || {}
        this.comments = res1.data || []
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
    createComment() {
      const item = {
        task: { tno: this.$route.params.tno },
        user: { userId: this.$store.state.uid },
        comment: this.textarea
      }

      request({
        url: '/api/task/comment',
        method: 'post',
        data: item
      }).then(res => {
        if (res.data) {
          return request({
            url: '/api/task/getComments',
            method: 'get',
            params: {
              tno: this.$route.params.tno
            }
          })
        }
      }).then(res => {
        if (res) {
          this.comments = res.data || []
          this.textarea = ''
        }
      }).catch(err => {
        console.log(err)
      })
    },
    date_format(date) {
      return new Date(date).format('yy/MM/dd')
    },
    time_format(date) {
      return new Date(date).format('hh:mm')
    },
    back() {
      if (this.$store.state.permission == '2') {
        this.$router.push(`/teachertask/${this.$route.params.cno}`)
      } else {
        this.$router.push(`/studenttask/${this.$route.params.cno}`)
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
    display: grid;
    gap: 16px;
  }

  .header,
  .comment-box,
  .comment-card {
    border: 1px solid #e2e6ed;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  }

  .header {
    padding: 24px;
  }

  .header h1 {
    font-size: 26px;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .header p {
    color: #64748b;
  }

  .comment-box {
    padding: 20px;
  }

  .composer {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 16px;
    align-items: start;
  }

  .composer img,
  .comment-top img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
  }

  .actions {
    margin-top: 12px;
    text-align: right;
  }

  .list {
    display: grid;
    gap: 12px;
  }

  .comment-card {
    padding: 18px 20px;
  }

  .comment-top {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
  }

  .comment-top strong {
    display: block;
    color: #1f2937;
  }

  .comment-top span,
  .comment-top time {
    font-size: 12px;
    color: #64748b;
  }

  .comment-text {
    line-height: 1.8;
    color: #334155;
  }
</style>
