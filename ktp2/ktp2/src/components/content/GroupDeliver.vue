<template>
  <div class="panel">
    <div class="fields">
      <el-input v-model="tname" placeholder="作业标题" />
      <Editor class="editor" :description="description" @description="upDescription" />
      <div class="row">
        <span class="label">选择小组</span>
        <el-select v-model="group" placeholder="请选择">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="row">
        <span class="label">截止日期</span>
        <el-date-picker v-model="end_date" type="date" placeholder="选择日期" :clearable="false" />
        <el-time-select
          v-if="end_date !== ''"
          v-model="end_time"
          :picker-options="{ start: '00:00', step: '00:15', end: '23:45' }"
          placeholder="选择时间" />
      </div>
      <div class="row">
        <span class="label">满分值</span>
        <el-input v-model="max_point" style="width: 100px" />
      </div>
      <div class="note">同一小组的成员共享这次作业提交。</div>
      <div class="actions">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submit">发布小组作业</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Editor from '@/components/content/Editor'

export default {
  name: 'GroupDeliver',
  components: {
    Editor
  },
  data() {
    return {
      tname: '',
      description: '',
      end_date: '',
      end_time: '08:30',
      max_point: '',
      group: '',
      options: [
        { value: 'g1', label: '小组 1' },
        { value: 'g2', label: '小组 2' },
        { value: 'g3', label: '小组 3' },
        { value: 'g4', label: '小组 4' }
      ]
    }
  },
  methods: {
    cancel() {
      this.$emit('deliver', 0)
    },
    upDescription(description) {
      this.description = description
    },
    submit() {
      if (!this.tname || !this.group || !this.end_date || !this.end_time) {
        this.$message.warning('请补全作业信息')
        return
      }

      const data = {
        tname: this.tname,
        description: this.description || ('【小组作业】' + this.group),
        annex: null,
        avgScore: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 0,
        createDate: new Date().format('yyyy-MM-ddThh:mm:ss+0800'),
        endDate: this.end_date + 'T' + this.end_time + ':00+0800',
        submitNum: 0,
        judgeNum: 0,
        cno: this.$route.params.cno
      }

      axios.post('/api/insertTask', data).then(() => {
        this.$message.success('小组作业已发布')
        this.$emit('deliver', 0)
        this.$emit('send')
      }).catch(err => {
        console.error(err)
        this.$message.error('发布失败')
      })
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

  .note {
    color: #64748b;
    font-size: 13px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
