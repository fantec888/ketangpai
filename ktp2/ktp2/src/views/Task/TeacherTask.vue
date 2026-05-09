<template>
  <div class="page">
    <work-nav :cname="course.name" />
    <div class="shell">
      <section class="hero">
        <div>
          <h1>{{ course.name }}</h1>
          <p>课程号 {{ course.cno }} · {{ course.year }} · {{ showSemester }}</p>
        </div>
        <div class="hero-stats">
          <div><span>作业</span><strong>{{ tasks.length }}</strong></div>
          <div><span>成员</span><strong>{{ course.members + 1 || 0 }}</strong></div>
        </div>
      </section>

      <section class="toolbar">
        <el-button type="primary" plain @click="deliver(1)">发布个人作业</el-button>
        <el-button type="primary" plain @click="deliver(2)">发布小组作业</el-button>
      </section>

      <PersonalDeliver
        v-show="showDeliver === 1"
        :cno="course.cno"
        @deliver="deliver"
        @send="send" />
      <GroupDeliver
        v-show="showDeliver === 2"
        @deliver="deliver" />

      <section v-if="tasks.length" class="task-list">
        <div v-for="task in tasks" :key="task.tno" class="task-card">
          <div v-if="!editing[task.tno]" class="task-view">
            <div class="task-head">
              <div>
                <span class="badge">个人作业</span>
                <h2>{{ task.tname }}</h2>
                <div class="time">{{ date_format(task.createDate) }} {{ time_format(task.createDate) }}</div>
              </div>
              <el-dropdown trigger="click" @command="commandHandler(task, $event)">
                <span class="more">更多</span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                  <el-dropdown-item command="grade">批改</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div class="task-body">
              <div class="counts">
                <span>已批 {{ task.judgeNum }}</span>
                <span>未批 {{ task.submitNum - task.judgeNum }}</span>
                <span>未交 {{ course.members - task.submitNum }}</span>
              </div>
              <div class="desc" v-html="task.description"></div>
            </div>
            <div class="task-foot">
              <span>截止：{{ date_format(task.endDate) }} {{ time_format(task.endDate) }}</span>
              <el-link type="primary" @click="gotoDiscuss(task)">作业讨论</el-link>
            </div>
          </div>

          <div v-else class="task-edit">
            <PersonalDeliver :task="task" :edit="true" @deliver="editing[task.tno] = false" @send="send" />
          </div>
        </div>
      </section>

      <div v-else class="empty-state">当前课程还没有发布作业</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import PersonalDeliver from "components/content/PersonalDeliver"
import WorkNav from 'components/content/WorkNav'
import GroupDeliver from 'components/content/GroupDeliver'
import { request } from '../../network/request'

export default {
  name: 'TeacherTask',
  components: { PersonalDeliver, WorkNav, GroupDeliver },
  data() {
    return {
      showDeliver: 0,
      tasks: [],
      editing: {},
      course: {}
    }
  },
  computed: {
    showSemester() {
      return this.course.semester === '1' ? '第一学期' : '第二学期'
    }
  },
  mounted() {
    request({
      url: '/api/course/getCourseByCno',
      method: 'get',
      params: {
        cno: this.$route.params.cno
      }
    }).then(res => {
      this.course = res.data || {}
      this.send(true)
    }).catch(err => {
      console.log(err)
    })
  },
  methods: {
    gotoCourseMember() {
      this.$router.push(`/coursemember/${this.course.cno}`)
    },
    deliver(index) {
      this.showDeliver = this.showDeliver === index ? 0 : index
    },
    deepClone(origin, target) {
      const tar = target || {}
      const arrStr = '[object Array]'
      for (const prop in origin) {
        if (Object.prototype.hasOwnProperty.call(origin, prop)) {
          if (typeof origin[prop] === 'object' && typeof origin[prop] !== 'undefined') {
            tar[prop] = Object.prototype.toString.call(origin[prop]) === arrStr ? [] : {}
            this.deepClone(origin[prop], tar[prop])
          } else {
            tar[prop] = origin[prop]
          }
        }
      }
      return tar
    },
    send(restore = false) {
      axios.get('/api/taskList?cno=' + this.course.cno).then(res => {
        this.tasks = res.data || []
        if (restore) {
          this.tasks.forEach(task => {
            this.$set(this.editing, task.tno, false)
          })
        }
      })
    },
    date_format(date) {
      return new Date(date).format('yy/MM/dd')
    },
    time_format(date) {
      return new Date(date).format('hh:mm')
    },
    commandHandler(task, command) {
      if (command === 'edit') {
        this.$set(this.editing, task.tno, true)
      } else if (command === 'delete') {
        axios.post('/api/deleteTask?tno=' + task.tno).then(() => {
          this.send()
        })
      } else if (command === 'grade') {
        this.gotoRevise(task)
      }
    },
    gotoRevise(task) {
      this.$router.push({ path: `/taskmark/${task.cno}/${task.tno}` })
    },
    gotoDiscuss(task) {
      this.$router.push({ path: `/discuss/${task.cno}/${task.tno}` })
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

  .hero-stats {
    display: flex;
    gap: 12px;
  }

  .hero-stats div {
    min-width: 110px;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.14);
    text-align: center;
  }

  .hero-stats span {
    display: block;
    font-size: 12px;
    opacity: 0.85;
    margin-bottom: 4px;
  }

  .hero-stats strong {
    font-size: 24px;
  }

  .toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
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
    padding: 18px 22px;
  }

  .task-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
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

  .time {
    margin-top: 8px;
    font-size: 12px;
    color: #64748b;
  }

  .counts {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;
    color: #334155;
  }

  .counts span {
    padding: 4px 10px;
    border-radius: 999px;
    background: #f8fbff;
    border: 1px solid #e2e6ed;
  }

  .desc {
    color: #475569;
    line-height: 1.8;
  }

  .task-foot {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    color: #64748b;
    border-top: 1px solid #eef2f7;
  }

  .more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 54px;
    height: 30px;
    padding: 0 14px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #334155;
    cursor: pointer;
    user-select: none;
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
