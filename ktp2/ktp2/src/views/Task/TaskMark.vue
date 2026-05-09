<template>
  <div class="page">
    <task-commit-nav :cname="cname" :cno="$route.params.cno" :tno="$route.params.tno" @back="back" />
    <div class="shell">
      <section class="toolbar">
        <el-dropdown trigger="click" @command="give_mark_command">
          <span class="dropdown-trigger">批量给分</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="same">统一给分</el-dropdown-item>
            <el-dropdown-item command="area">区间给分</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </section>

      <el-table
        :data="gradeData"
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="expand">
          <template slot-scope="props">
            <div class="answer-box">
              <strong>学生答案</strong>
              <p>{{ submissionText(props.row.answer) || '未填写文字说明' }}</p>
              <div v-if="submissionFiles(props.row.answer).length" class="submitted-files">
                <div
                  v-for="file in submissionFiles(props.row.answer)"
                  :key="file"
                  class="submitted-file"
                  @click="downloadAnnex(file)">
                  <img :src="getIconSource(file.substring(10))" :alt="file.substring(10)" />
                  <span>{{ file.substring(10) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学号" prop="user.identifyNo" />
        <el-table-column label="姓名" prop="user.name" />
        <el-table-column label="成绩">
          <template slot-scope="scope">
            <el-input
              v-if="scope.row.isShow"
              v-model="scope.row.score"
              class="score-input"
              size="mini"
              @blur="score_in_handler(scope.row)" />
            <span v-else class="score-text" @click="showInput(scope.row)">{{ scope.row.score }}</span>
            /100
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <span>{{ statusText(scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-link type="primary" @click="into_judge(scope.row.user.identifyNo)">查看详情</el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="统一给分" :visible.sync="sameMarkVisible" width="360px">
      <el-input v-model="sameMark" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="sameMarkVisible = false">取消</el-button>
        <el-button type="primary" @click="sameMarkConfirm">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="区间给分" :visible.sync="areaMarkVisible" width="420px">
      <div class="range">
        <el-input v-model="areaMarkForward" />
        <span>到</span>
        <el-input v-model="areaMarkBackward" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="areaMarkVisible = false">取消</el-button>
        <el-button type="primary" @click="areaMarkConfirm">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="学生答案" :visible.sync="markModalVisible" width="720px">
      <el-carousel ref="markCarousel" :autoplay="false" trigger="click" height="320px">
        <el-carousel-item v-for="item in gradeData" :key="item.user.userId" :name="item.user.identifyNo">
          <div class="modal-answer">
            <div class="score-row">
              <span>成绩</span>
              <el-input v-model="item.score" size="mini" @blur="score_in_handler(item)" />
              <span>/100</span>
            </div>
            <div class="student-name">{{ item.user.name }} 的答案</div>
            <div class="answer-detail">
              <p>{{ submissionText(item.answer) || '未填写文字说明' }}</p>
              <div v-if="submissionFiles(item.answer).length" class="submitted-files">
                <div
                  v-for="file in submissionFiles(item.answer)"
                  :key="file"
                  class="submitted-file"
                  @click="downloadAnnex(file)">
                  <img :src="getIconSource(file.substring(10))" :alt="file.substring(10)" />
                  <span>{{ file.substring(10) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import { request } from '../../network/request'
import TaskCommitNav from 'components/content/TaskCommitNav'

const SUBMIT_PREFIX = 'KTP_SUBMIT_V1:'

export default {
  name: 'TaskMark',
  components: {
    TaskCommitNav
  },
  data() {
    return {
      markModalVisible: false,
      sameMarkVisible: false,
      sameMark: 0,
      areaMarkVisible: false,
      areaMarkForward: 0,
      areaMarkBackward: 100,
      multipleSelection: [],
      gradeData: [],
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

    const gradeConfig = request({
      url: '/api/grade/getGradeList',
      method: 'get',
      params: {
        tno: this.$route.params.tno
      }
    })

    axios.all([courseConfig, gradeConfig])
      .then(axios.spread((res1, res2) => {
        this.cname = res1.data.name
        this.gradeData = res2.data || []
      })).catch(err => {
        console.log(err)
      })
  },
  methods: {
    showInput(grade_row) {
      this.$set(grade_row, 'isShow', true)
    },
    score_in_handler(row) {
      request({
        url: '/api/grade/revise',
        method: 'put',
        params: {
          tno: row.task.tno,
          score: row.score,
          uid: row.user.userId
        }
      }).then(() => {
        this.$set(row, 'isShow', false)
        row.status = 1
        this.$message.success('成绩已保存')
      }).catch(err => {
        console.log(err)
        this.$set(row, 'isShow', false)
        this.$message.error('成绩保存失败')
      })
    },
    into_judge(i_no) {
      this.markModalVisible = true
      setTimeout(() => {
        this.$refs.markCarousel.setActiveItem(i_no)
      }, 0)
    },
    give_mark_command(command) {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请先勾选学生')
        return
      }
      if (command === 'same') {
        this.sameMarkVisible = true
      } else if (command === 'area') {
        this.areaMarkVisible = true
      }
    },
    sameMarkConfirm() {
      const data = {
        tno: this.multipleSelection[0].task.tno,
        member: [],
        score: this.sameMark
      }
      this.multipleSelection.forEach(item => {
        data.member.push(item.user.userId)
      })
      request({
        url: `/api/grade/reviseMany?tno=${data.tno}&score=${data.score}`,
        method: 'post',
        data: data.member
      }).then(res => {
        if (res.data) {
          this.multipleSelection.forEach(item => {
            item.score = this.sameMark
            item.status = 1
          })
          this.$message.success('成绩已保存')
        } else {
          this.$message.error('成绩保存失败')
        }
      }).catch(() => {
        this.$message.error('成绩保存失败')
      })
      this.sameMarkVisible = false
    },
    areaMarkConfirm() {
      const forward = Number(this.areaMarkForward)
      const backward = Number(this.areaMarkBackward)
      if (forward > backward) {
        this.$message.warning('区间上限不能小于下限')
        return
      }
      if (backward > 100) {
        this.$message.warning('区间上限不能大于 100')
        return
      }
      const data = {
        tno: this.multipleSelection[0].task.tno,
        member: [],
        score: []
      }
      this.multipleSelection.forEach(item => {
        data.member.push(item.user.userId)
        data.score.push(Math.floor(Math.random() * (backward - forward + 1)) + forward)
      })
      axios.post('/api/grade/reviseMulti', data).then(res => {
        if (res.data) {
          for (let i = 0; i < this.multipleSelection.length; i++) {
            this.multipleSelection[i].score = data.score[i]
            this.multipleSelection[i].status = 1
          }
          this.$message.success('成绩已保存')
        } else {
          this.$message.error('成绩保存失败')
        }
      }).catch(() => {
        this.$message.error('成绩保存失败')
      })
      this.areaMarkVisible = false
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    parseSubmission(answer) {
      if (!answer) {
        return { text: '', annex: [] }
      }
      if (answer.indexOf(SUBMIT_PREFIX) !== 0) {
        return { text: answer, annex: [] }
      }
      try {
        const data = JSON.parse(answer.slice(SUBMIT_PREFIX.length))
        return {
          text: data.text || '',
          annex: Array.isArray(data.annex) ? data.annex : []
        }
      } catch (e) {
        return { text: answer, annex: [] }
      }
    },
    submissionText(answer) {
      return this.parseSubmission(answer).text
    },
    submissionFiles(answer) {
      return this.parseSubmission(answer).annex
    },
    statusText(status) {
      if (status === 0) return '未提交'
      if (status === 1) return '待批改'
      return '已批改'
    },
    getIconSource(fileName) {
      const parts = fileName.split('.')
      try {
        return require('../../assets/fileicons/' + parts[parts.length - 1] + '.png')
      } catch (e) {
        return require('../../assets/fileicons/txt.png')
      }
    },
    downloadAnnex(fileName) {
      const anchor = document.createElement('a')
      anchor.setAttribute('href', '/static/annex/' + fileName)
      anchor.setAttribute('download', fileName.substring(10))
      anchor.click()
    },
    back() {
      this.$router.push(`/teachertask/${this.$route.params.cno}`)
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
  }

  .toolbar {
    margin-bottom: 16px;
  }

  .dropdown-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 16px;
    border-radius: 999px;
    background: #e8f1ff;
    color: #2c58ab;
    cursor: pointer;
  }

  .score-input {
    width: 72px;
  }

  .score-text {
    display: inline-flex;
    width: 72px;
    justify-content: center;
    border-bottom: 1px solid #94a3b8;
    cursor: pointer;
  }

  .answer-box {
    padding: 10px 0;
    color: #334155;
    line-height: 1.8;
  }

  .modal-answer {
    padding: 12px 8px;
  }

  .score-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .student-name {
    margin-bottom: 10px;
    color: #1f2937;
    font-weight: 600;
  }

  .answer-detail {
    padding: 16px;
    border: 1px solid #e2e6ed;
    border-radius: 10px;
    background: #f8fbff;
    line-height: 1.8;
    color: #334155;
  }

  .submitted-files {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    gap: 10px;
  }

  .submitted-file {
    padding: 10px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid #e2e6ed;
    cursor: pointer;
    display: grid;
    justify-items: center;
    gap: 8px;
  }

  .submitted-file img {
    width: 38px;
    height: 38px;
    object-fit: contain;
  }

  .submitted-file span {
    max-width: 100%;
    color: #334155;
    font-size: 12px;
    text-align: center;
    word-break: break-all;
  }

  .range {
    display: flex;
    align-items: center;
    gap: 12px;
  }
</style>
