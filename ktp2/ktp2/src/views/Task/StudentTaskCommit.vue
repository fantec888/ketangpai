<template>
  <div class="page" v-if="renderKey">
    <task-commit-nav
      :cname="course.name"
      :tno="task.tno"
      :cno="course.cno"
      @back="back" />

    <div class="shell">
      <section class="task-info">
        <div class="badge">个人作业</div>
        <h1>{{ task.tname }}</h1>
        <div class="desc" v-html="task.description"></div>
        <div class="meta">
          <span>截止：{{ date_format(task.endDate) }} {{ time_format(task.endDate) }}</span>
          <span>提交状态：{{ grade.status == 0 ? '未提交' : '已提交' }}</span>
        </div>
      </section>

      <section class="submit">
        <div class="submit-head">
          <h3>提交作业</h3>
          <el-button type="primary" :disabled="isDisabled" :loading="submitting" plain @click="submit">
            {{ grade.status == 0 ? '提交作业' : '更新提交' }}
          </el-button>
        </div>
        <el-input
          type="textarea"
          :autosize="{ minRows: 8 }"
          placeholder="在这里输入作业说明，也可以只上传文件"
          @input="updateSubmitDisabled"
          v-model="answer" />

        <div class="upload-area">
          <el-upload
            multiple
            action="/api/annex/upload"
            :file-list="annex"
            :before-upload="beforeUpload"
            :on-success="annexUploadSuccess"
            :on-error="annexUploadError"
            :on-remove="annexRemove"
            :on-preview="downloadAnnex">
            <el-button type="primary" plain>
              <i class="el-icon-upload el-icon--left" />上传作业文件
            </el-button>
            <div slot="tip" class="upload-tip">支持文档、压缩包、图片等文件；上传完成后再提交。</div>
          </el-upload>

          <div v-if="annex.length" class="file-grid">
            <div v-for="item in annex" :key="item.oriName" class="file-card" @click="downloadAnnex(item)">
              <img :src="getIconSource(item.name)" :alt="item.name" />
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import TaskCommitNav from 'components/content/TaskCommitNav'
import { request } from '../../network/request'

const SUBMIT_PREFIX = 'KTP_SUBMIT_V1:'

export default {
  name: 'TaskCommit',
  components: {
    TaskCommitNav
  },
  data() {
    return {
      course: {},
      task: {},
      grade: {},
      renderKey: false,
      answer: '',
      annex: [],
      isDisabled: true,
      submitting: false,
      uploading: 0
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

    const taskConfig = request({
      url: '/api/taskList',
      method: 'get',
      params: {
        tno: this.$route.params.tno,
        cno: this.$route.params.cno
      }
    })

    const gradeConfig = request({
      url: '/api/grade/getGrade',
      method: 'get',
      params: {
        uid: this.$store.state.uid,
        tno: this.$route.params.tno
      }
    })

    axios.all([courseConfig, taskConfig, gradeConfig])
      .then(axios.spread((res1, res2, res3) => {
        this.course = res1.data || {}
        this.task = (res2.data && res2.data[0]) || {}
        this.grade = res3.data || {}
        this.renderKey = true
        const submission = this.parseSubmission(this.grade.answer)
        this.answer = submission.text
        this.annex = submission.annex.map(item => ({
          oriName: item,
          name: item.substring(10)
        }))
        this.updateSubmitDisabled()
      })).catch(err => {
        console.log(err)
      })
  },
  methods: {
    submit() {
      if (this.uploading > 0) {
        this.$message.warning('文件还在上传，请稍后提交')
        return
      }
      this.submitting = true
      request({
        url: '/api/grade/submit',
        method: 'put',
        params: {
          uid: this.$store.state.uid,
          tno: this.task.tno,
          answer: this.formAnswer()
        }
      }).then(res => {
        if (res.data) {
          this.$message.success('提交成功')
          this.$router.push(`/studenttask/${this.course.cno}`)
        } else {
          this.$message.error('提交失败，请重试')
        }
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        this.submitting = false
      })
    },
    updateSubmitDisabled() {
      this.isDisabled = (this.answer.trim() === '' && this.annex.length === 0) || this.uploading > 0
    },
    beforeUpload() {
      this.uploading += 1
      this.updateSubmitDisabled()
      return true
    },
    annexUploadSuccess(res) {
      this.uploading = Math.max(0, this.uploading - 1)
      if (!res || res === 'false') {
        this.$message.error('文件上传失败')
        this.updateSubmitDisabled()
        return
      }
      this.annex.push({
        oriName: res,
        name: res.substring(10)
      })
      this.$message.success('文件上传成功')
      this.updateSubmitDisabled()
    },
    annexUploadError() {
      this.uploading = Math.max(0, this.uploading - 1)
      this.$message.error('文件上传失败')
      this.updateSubmitDisabled()
    },
    annexRemove(file) {
      const oriName = file.oriName || (file.response && file.response) || ''
      this.annex = this.annex.filter(item => item.oriName !== oriName && item.name !== file.name)
      this.updateSubmitDisabled()
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
    formAnswer() {
      return SUBMIT_PREFIX + JSON.stringify({
        text: this.answer.trim(),
        annex: this.annex.map(item => item.oriName)
      })
    },
    getIconSource(fileName) {
      const parts = fileName.split('.')
      try {
        return require('../../assets/fileicons/' + parts[parts.length - 1] + '.png')
      } catch (e) {
        return require('../../assets/fileicons/txt.png')
      }
    },
    downloadAnnex(file) {
      const oriName = file.oriName || (file.response && file.response)
      if (!oriName) return
      const anchor = document.createElement('a')
      anchor.setAttribute('href', '/static/annex/' + oriName)
      anchor.setAttribute('download', oriName.substring(10))
      anchor.click()
    },
    date_format(date) {
      return new Date(date).format('yy/MM/dd')
    },
    time_format(date) {
      return new Date(date).format('hh:mm')
    },
    back() {
      this.$router.push(`/studenttask/${this.course.cno}`)
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
    display: grid;
    gap: 16px;
  }

  .task-info,
  .submit {
    padding: 24px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #e2e6ed;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
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
    margin-bottom: 12px;
  }

  h1 {
    font-size: 28px;
    color: #1f2937;
    margin-bottom: 12px;
  }

  .desc {
    color: #475569;
    line-height: 1.85;
  }

  .meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 18px;
    font-size: 12px;
    color: #64748b;
  }

  .submit-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
  }

  .submit-head h3 {
    font-size: 18px;
    color: #1f2937;
  }

  .upload-area {
    margin-top: 18px;
    padding: 18px;
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    background: #f8fbff;
  }

  .upload-tip {
    margin-top: 8px;
    color: #64748b;
    font-size: 12px;
  }

  .file-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .file-card {
    min-height: 96px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e2e6ed;
    background: #fff;
    cursor: pointer;
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 8px;
  }

  .file-card img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  .file-card span {
    max-width: 100%;
    font-size: 12px;
    color: #334155;
    word-break: break-all;
    text-align: center;
  }
</style>
