<template>
  <div class="page">
    <course-member-nav :cname="cname" :cno="$route.params.cno" @back="back" />

    <div class="shell">
      <aside class="side">
        <div :class="{ active: isActive === 1 }" @click="change(1)">教师团队（{{ teaCount }}）</div>
        <div :class="{ active: isActive === 2 }" @click="change(2)">全部学生（{{ stuCount }}）</div>
      </aside>

      <main class="main">
        <div class="panel-head">
          <span v-if="isActive === 1">教师团队（{{ teaCount }}）</span>
          <span v-else>全部学生（{{ stuCount }}）</span>
          <div v-if="$store.state.permission == '2' && isActive === 2" class="bulk">
            <el-checkbox v-model="checked" @change="selectAll">全选（{{ multipleSelection.length }}）</el-checkbox>
            <el-button type="primary" :disabled="multipleSelection.length === 0" @click="delAll">删除成员</el-button>
          </div>
        </div>

        <ul v-if="isActive === 1" class="member-list">
          <li v-for="item in teachers" :key="item.userId">
            <span class="name">{{ item.name }}</span>
            <span class="id">{{ item.userId }}</span>
            <span class="extra">{{ item.identifyNo }}</span>
          </li>
        </ul>

        <ul v-else class="member-list">
          <li v-for="(item, index) in students" :key="item.userId">
            <el-checkbox
              v-if="$store.state.permission == '2'"
              v-model="checkStatus[index]"
              @change="mutiplySelectionMethod(item, index)" />
            <span class="name">{{ item.name }}</span>
            <span class="id">{{ item.userId }}</span>
            <span class="extra">{{ item.identifyNo }}</span>
            <span v-if="$store.state.permission == '2'" class="remove" @click="delHandle(index)">删除</span>
          </li>
        </ul>
      </main>
    </div>

    <el-dialog title="提示" :visible.sync="delVisible" width="360px" center>
      <div class="dialog-text">删除后无法恢复，确认继续吗？</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancle">取消</el-button>
        <el-button type="primary" @click="deleteRow">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from '../../network/request'
import CourseMemberNav from 'components/content/CourseMemberNav'
import axios from 'axios'

export default {
  name: 'CourseMember',
  components: {
    CourseMemberNav
  },
  data() {
    return {
      teachers: [],
      students: [],
      stuCount: 0,
      teaCount: 0,
      isActive: 1,
      checked: false,
      delVisible: false,
      delarr: [],
      multipleSelection: [],
      checkStatus: [],
      cname: ''
    }
  },
  mounted() {
    const courseConfig = request({
      url: '/api/course/getCourseByCno',
      method: 'get',
      params: {
        cno: this.$route.params.cno
      }
    })

    const userConfig = request({
      url: '/api/userList',
      method: 'get',
      params: {
        cno: this.$route.params.cno
      }
    })

    axios.all([courseConfig, userConfig])
      .then(axios.spread((res1, res2) => {
        this.cname = res1.data.name
        const list = res2.data || []
        this.students = list.filter(e => e.permission.pid == '1')
        this.teachers = list.filter(e => e.permission.pid == '2')
        this.stuCount = this.students.length
        this.teaCount = this.teachers.length
        this.checkStatus = this.students.map(() => false)
      })).catch(err => {
        console.log(err)
      })
  },
  methods: {
    change(num) {
      this.isActive = num
    },
    delHandle(index) {
      this.delVisible = true
      this.delarr = [this.students[index]]
    },
    delAll() {
      this.delVisible = true
      this.delarr = this.multipleSelection.slice()
      this.multipleSelection = []
    },
    mutiplySelectionMethod(item) {
      if (this.multipleSelection.indexOf(item) === -1) {
        this.multipleSelection.push(item)
      } else {
        this.multipleSelection = this.multipleSelection.filter(v => v !== item)
      }

      this.checked = this.students.length > 0 && this.multipleSelection.length === this.students.length
    },
    selectAll() {
      this.checkStatus = this.students.map(() => this.checked)
      this.multipleSelection = this.checked ? this.students.slice() : []
    },
    clearSelect() {
      this.checkStatus = this.students.map(() => false)
      this.checked = false
    },
    deleteRow() {
      request({
        url: '/api/course/deleteMembers?cno=' + this.$route.params.cno,
        method: 'post',
        data: this.delarr
      }).then(res => {
        if (res.data) {
          this.students = this.students.filter(v => this.delarr.indexOf(v) === -1)
          this.delarr = []
          this.stuCount = this.students.length
          this.delVisible = false
          this.clearSelect()
          this.$message.success('删除成功')
        }
      }).catch(err => {
        console.log(err)
      })
    },
    back() {
      if (this.$store.state.permission == '2') {
        this.$router.push(`/teachertask/${this.$route.params.cno}`)
      } else {
        this.$router.push(`/studenttask/${this.$route.params.cno}`)
      }
    },
    cancle() {
      this.delarr = []
      this.multipleSelection = []
      this.delVisible = false
      this.clearSelect()
    }
  }
}
</script>

<style scoped>
  .page {
    min-height: 100%;
  }

  .shell {
    width: min(1280px, 92%);
    margin: 0 auto;
    padding: 104px 0 48px;
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 16px;
  }

  .side,
  .main {
    border: 1px solid #e2e6ed;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  }

  .side {
    padding: 12px;
    height: fit-content;
  }

  .side div {
    padding: 14px 16px;
    border-radius: 10px;
    cursor: pointer;
    color: #334155;
    font-weight: 600;
  }

  .side div.active {
    background: #e8f1ff;
    color: #2c58ab;
  }

  .main {
    padding: 18px 0 8px;
  }

  .panel-head {
    padding: 0 20px 14px;
    border-bottom: 1px solid #eef2f7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .bulk {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .member-list {
    margin: 0;
    padding: 0;
  }

  .member-list li {
    list-style: none;
    display: grid;
    grid-template-columns: 1.2fr 0.9fr 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 1px solid #f1f5f9;
  }

  .member-list li:hover {
    background: #f8fbff;
  }

  .name,
  .id,
  .extra {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .name {
    font-weight: 600;
    color: #1f2937;
  }

  .id,
  .extra {
    color: #64748b;
    font-size: 13px;
  }

  .remove {
    color: #2c58ab;
    cursor: pointer;
  }

  .dialog-text {
    text-align: center;
    color: #334155;
    padding: 10px 0;
  }

  @media (max-width: 900px) {
    .shell {
      grid-template-columns: 1fr;
    }

    .member-list li {
      grid-template-columns: 1fr;
      gap: 6px;
    }
  }
</style>
