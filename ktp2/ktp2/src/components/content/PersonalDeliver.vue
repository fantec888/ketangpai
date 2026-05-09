<template>
  <div class="panel">
    <div class="fields">
      <el-input v-model="tname" placeholder="作业标题" />
      <Editor class="editor" :description="description" @description="upDescription" />

      <el-upload
        class="upload"
        multiple
        action="/api/annex/upload"
        :file-list="annex"
        :on-success="annexUploadSuccess"
        :on-error="annexUploadError"
        :before-remove="annexBeforeDelete">
        <el-button type="primary" plain><i class="el-icon-paperclip el-icon--left" />上传附件</el-button>
      </el-upload>

      <div class="row">
        <span class="label">截止日期</span>
        <el-date-picker
          v-model="endDate"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          :clearable="false" />
        <el-time-select
          v-if="endDate !== ''"
          v-model="end_time"
          :picker-options="{ start: '00:00', step: '00:15', end: '23:45' }"
          placeholder="选择时间" />
      </div>

      <div class="row">
        <span class="label">满分值</span>
        <el-input v-model="max_point" style="width: 100px" />
        <span class="hint">可选</span>
        <el-switch v-model="outdate" active-text="超时禁止提交" />
      </div>

      <div class="row">
        <span class="label">查重</span>
        <el-switch v-model="check_dump" />
        <template v-if="check_dump">
          <span class="hint">阈值</span>
          <el-input v-model="alarm_line" style="width: 100px" />
          <span class="hint">%</span>
        </template>
      </div>

      <div class="actions">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submit">{{ edit ? '保存' : '发布个人作业' }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"
import Editor from "@/components/content/Editor"

export default {
  name: "PersonalDeliver",
  components: { Editor },
  props: {
    edit: {
      type: Boolean,
      default: false
    },
    task: {
      type: Object
    },
    cno: {
      type: String
    }
  },
  data() {
    return {
      tname: '',
      description: this.task === undefined ? '' : this.task.description,
      endDate: '',
      end_time: '',
      annex: [],
      annex_map: [],
      outdate: false,
      max_point: '',
      check_dump: false,
      alarm_line: '',
      auto_alarm: false
    }
  },
  mounted() {
    if (this.edit) {
      this.putUp()
    }
  },
  methods: {
    cancel() {
      this.$emit('deliver', 0)
    },
    submit() {
      if (!this.tname) {
        this.$message.warning('请先填写作业标题')
        return
      }
      if (!this.endDate || !this.end_time) {
        this.$message.warning('请选择截止日期和时间')
        return
      }

      const data = {
        tno: this.task === undefined ? '' : this.task.tno,
        tname: this.tname,
        description: this.description,
        annex: this.form_annex(),
        avgScore: this.task === undefined ? 0 : this.task.avgScore,
        passRate: this.task === undefined ? 0 : this.task.passRate,
        highestScore: this.task === undefined ? 0 : this.task.highestScore,
        lowestScore: this.task === undefined ? 0 : this.task.lowestScore,
        createDate: new Date().format('yyyy-MM-ddThh:mm:ss+0800'),
        endDate: this.endDate + 'T' + this.end_time + ':00+0800',
        submitNum: this.task === undefined ? 0 : this.task.submitNum,
        judgeNum: this.task === undefined ? 0 : this.task.judgeNum,
        cno: this.task === undefined ? this.cno : this.task.cno
      }

      axios.post(this.edit ? '/api/updateTask' : '/api/insertTask', data).then(() => {
        this.annex_map = []
        this.$message.success(this.edit ? '保存成功' : '作业已发布')
        this.$emit('send')
        this.$emit('deliver')
      }).catch(err => {
        console.error(err)
        this.$message.error('发布失败，请检查网络')
      })
    },
    putUp() {
      this.tname = this.task.tname
      this.endDate = new Date(this.task.endDate).format('yyyy-MM-dd')
      this.end_time = new Date(this.task.endDate).format('hh:mm')
      this.annex = this.annex_format(this.task.annex)
    },
    upDescription(description) {
      this.description = description
    },
    annex_format(annex) {
      if (!annex) {
        return []
      }
      return annex.split('?').map(item => ({
        oriName: item,
        name: item.substring(10)
      }))
    },
    annexUploadSuccess(res) {
      this.annex.push({
        oriName: res,
        name: res.substring(10)
      })
      this.$message.success('附件上传成功')
    },
    annexUploadError() {
      this.$message.error('附件上传失败')
    },
    annexBeforeDelete(file) {
      this.annex = this.annex.filter(item => item.name !== file.name)
    },
    form_annex() {
      if (this.annex.length === 0) {
        return null
      }
      return this.annex.map(item => item.oriName).join('?')
    }
  }
}
</script>

<style scoped>
  .panel {
    border: 1px solid #e2e6ed;
    margin-top: 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.92);
    padding: 20px;
    text-align: left;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  }

  .fields {
    display: grid;
    gap: 16px;
  }

  .editor {
    position: relative;
    z-index: 40;
  }

  .upload {
    display: inline-flex;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .label {
    width: 70px;
    color: #64748b;
    text-align: right;
  }

  .hint {
    color: #94a3b8;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
