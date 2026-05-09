<template>
  <div class="course-card" :class="[themeClass, { compact }]">
    <div class="banner" @click="gotoTask">
      <div class="term">{{ course.year }} {{ showSemester }}</div>
      <h3>{{ course.name }}</h3>
      <p>{{ courseClass }}</p>
      <div class="invite">
        <i class="el-icon-s-grid" />
        <span>邀请码:{{ course.cno }}</span>
      </div>
    </div>

    <div class="footer">
      <div class="owner">
        <span class="role">{{ roleLabel }}</span>
        <span>负责人:{{ ownerName }}</span>
      </div>
      <div class="actions">
        <button type="button" class="pin" @click.stop="togglePin">
          {{ pinned ? '取消置顶' : '置顶' }}
        </button>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="more">···</span>
          <el-dropdown-menu slot="dropdown">
            <template v-if="isOwner">
              <el-dropdown-item command="edit">编辑课程</el-dropdown-item>
              <el-dropdown-item command="archive">归档课程</el-dropdown-item>
              <el-dropdown-item command="delete">删除课程</el-dropdown-item>
            </template>
            <template v-else>
              <el-dropdown-item command="dropout">退出课程</el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeCard',
  props: {
    course: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    pinned: {
      type: Boolean,
      default: false
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    showSemester() {
      return this.course.semester === '1' ? '第一学期' : '第二学期'
    },
    ownerName() {
      return this.course.admin && this.course.admin.name ? this.course.admin.name : '未设置'
    },
    isOwner() {
      return this.course.admin && this.course.admin.userId == this.$store.state.uid
    },
    roleLabel() {
      return this.isOwner ? '教' : '学'
    },
    courseClass() {
      return this.course.className || this.course.class || '课程班级'
    },
    themeClass() {
      return 'theme-' + (this.index % 4)
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'edit') {
        this.$emit('edit-course', this.course)
      } else if (command === 'delete') {
        this.$emit('delete-course', this.course)
      } else if (command === 'archive') {
        this.$emit('archive-course', this.course)
      } else if (command === 'dropout') {
        this.$emit('drop-out', this.course)
      }
    },
    togglePin() {
      this.$emit('toggle-pin', this.course)
    },
    gotoTask() {
      this.$emit('goto-task', this.course)
    }
  }
}
</script>

<style scoped>
  .course-card {
    height: 226px;
    border: 1px solid #e4e8f0;
    border-radius: 6px;
    background: #fff;
    overflow: hidden;
    display: grid;
    grid-template-rows: 148px 78px;
  }

  .course-card.compact {
    min-width: 248px;
  }

  .banner {
    padding: 18px 20px 16px;
    color: #fff;
    cursor: pointer;
    background-size: cover;
    background-position: center;
    position: relative;
    min-width: 0;
  }

  .banner::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.02));
  }

  .banner > * {
    position: relative;
    z-index: 1;
  }

  .theme-0 .banner {
    background: linear-gradient(135deg, #2f6f6d, #1f5655);
  }

  .theme-1 .banner {
    background: linear-gradient(135deg, #c84f4f, #a23635);
  }

  .theme-2 .banner {
    background: linear-gradient(135deg, #269c35, #168229);
  }

  .theme-3 .banner {
    background: linear-gradient(135deg, #745056, #5b3d42);
  }

  .term {
    font-size: 13px;
    opacity: 0.78;
  }

  h3 {
    margin-top: 8px;
    max-width: 100%;
    font-size: 18px;
    line-height: 1.25;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  p {
    margin-top: 8px;
    font-size: 12px;
    font-weight: 600;
    opacity: 0.94;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .invite {
    margin-top: 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
  }

  .footer {
    padding: 12px 16px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: #1f2937;
    font-size: 13px;
  }

  .owner {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .owner span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .role {
    width: 20px;
    height: 20px;
    border: 1px solid #3f7fff;
    border-radius: 3px;
    color: #3f7fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .actions {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .pin {
    border: 0;
    background: transparent;
    color: #1f2937;
    cursor: pointer;
    padding: 0;
    font-size: 13px;
  }

  .pin:hover,
  .more:hover {
    color: #3f7fff;
  }

  .more {
    cursor: pointer;
    font-weight: 700;
    letter-spacing: 1px;
  }
</style>
