<template>
  <div class="page">
    <home-nav @clear-style="clearStyle" />
    <side-tool-bar />

    <div class="shell">
      <section v-if="pinnedCourses.length" class="pinned-panel">
        <div class="section-head">
          <h2>置顶课程</h2>
          <el-button type="primary" icon="el-icon-plus" @click="addCourseDialog = true">加入课程</el-button>
        </div>
        <div class="pinned-scroll">
          <home-card
            v-for="(course, index) in pinnedCourses"
            :key="'pin-' + course.cno"
            :course="course"
            :index="index"
            :pinned="isPinned(course)"
            compact
            @toggle-pin="togglePin"
            @edit-course="editCourse"
            @delete-course="deleteCourse"
            @archive-course="archiveCourse"
            @drop-out="dropOut"
            @goto-task="gotoTask" />
        </div>
      </section>

      <section class="course-bar">
        <div class="tabs">
          <button :class="{ active: activeTab === 'learn' }" @click="activeTab = 'learn'">我学的</button>
          <button :class="{ active: activeTab === 'assist' }" @click="activeTab = 'assist'">我协助的</button>
        </div>
        <div class="bar-actions">
          <el-button type="primary" icon="el-icon-plus" @click="addCourseDialog = true">加入课程</el-button>
          <el-button @click="archiveDialog = true">归档管理</el-button>
          <el-button v-if="isTeacher" type="primary" plain @click="cc('创建课程')">创建课程</el-button>
          <el-input
            v-model="keyword"
            clearable
            prefix-icon="el-icon-search"
            placeholder="搜索我的课程" />
        </div>
      </section>

      <section v-if="groupedCourses.length" class="semester-list">
        <div v-for="group in groupedCourses" :key="group.key" class="semester-panel">
          <div class="semester-head">
            <h2>{{ group.title }}</h2>
            <button type="button" @click="toggleGroup(group.key)">
              <i :class="expandedGroups[group.key] ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" />
              {{ expandedGroups[group.key] ? '收起' : '展开' }}
            </button>
          </div>
          <div v-show="expandedGroups[group.key]" class="course-grid">
            <home-card
              v-for="(course, index) in group.courses"
              :key="course.cno"
              :course="course"
              :index="index"
              :pinned="isPinned(course)"
              @toggle-pin="togglePin"
              @edit-course="editCourse"
              @delete-course="deleteCourse"
              @archive-course="archiveCourse"
              @drop-out="dropOut"
              @goto-task="gotoTask" />
          </div>
        </div>
      </section>

      <div v-else class="empty-state">
        没有找到匹配的课程
      </div>
    </div>

    <el-dialog title="归档管理" :visible.sync="archiveDialog" width="760px">
      <div class="archive-list">
        <div v-for="item in archiveCourses" :key="item.cno" class="archive-item">
          <div>
            <div class="archive-title">{{ item.name }}</div>
            <div class="archive-meta">角色: {{ showPermission }}</div>
          </div>
          <div class="archive-actions">
            <span @click="recover(item)">恢复</span>
            <span v-if="isTeacher" @click="deleteCourse(item, true)">删除</span>
            <span v-else @click="dropOut(item, true)">退课</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="加入课程" :visible.sync="addCourseDialog" width="420px">
      <el-input v-model="cno" placeholder="请输入课程号" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :disabled="!cno" @click="addToACourse">加入</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="course_select" :visible.sync="createCourseDialog" width="540px">
      <div class="create">
        <el-input v-model="course.cname" placeholder="课程名称" />
        <div class="row">
          <el-select v-model="course.year" placeholder="学年">
            <el-option v-for="item in years" :key="item" :label="item" :value="item" />
          </el-select>
          <el-select v-model="course.semester" placeholder="学期">
            <el-option v-for="item in semesters" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :disabled="createNotNull" @click="addCourse">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import HomeNav from 'components/content/HomeNav'
import SideToolBar from 'components/content/SideToolBar'
import HomeCard from 'views/Home/HomeCard'
import { request } from '../../network/request'
import axios from 'axios'

export default {
  name: 'Home',
  components: {
    HomeNav,
    SideToolBar,
    HomeCard
  },
  data() {
    return {
      courses: [],
      archiveCourses: [],
      permission: '',
      archiveDialog: false,
      addCourseDialog: false,
      createCourseDialog: false,
      cno: '',
      createNotNull: true,
      years: ['2023-2024', '2024-2025', '2025-2026'],
      semesters: [
        { id: '1', label: '第一学期' },
        { id: '2', label: '第二学期' }
      ],
      course: {
        year: '',
        cname: '',
        semester: '',
        members: 0,
        admin: {
          userId: this.$store.state.uid,
          name: this.$store.state.name
        }
      },
      course_select: '',
      keyword: '',
      activeTab: 'learn',
      pinnedCnos: [],
      expandedGroups: {}
    }
  },
  computed: {
    isTeacher() {
      return this.permission === '2'
    },
    showPermission() {
      return this.permission === '1' ? '学生' : '教师'
    },
    filteredCourses() {
      const keyword = this.keyword.trim().toLowerCase()
      const list = this.roleCourses
      if (!keyword) return list
      return list.filter(course => {
        return `${course.name} ${course.cno} ${course.year}`.toLowerCase().includes(keyword)
      })
    },
    roleCourses() {
      return this.courses.filter(course => {
        const owner = this.isCourseOwner(course)
        return this.activeTab === 'assist' ? owner : !owner
      })
    },
    pinnedCourses() {
      return this.filteredCourses.filter(course => this.isPinned(course))
    },
    groupedCourses() {
      const groups = []
      const map = {}
      this.filteredCourses.forEach(course => {
        const key = `${course.year}-${course.semester}`
        if (!map[key]) {
          map[key] = {
            key,
            title: `${course.year} ${this.semesterText(course.semester)}`,
            courses: []
          }
          groups.push(map[key])
        }
        map[key].courses.push(course)
      })
      return groups.sort((a, b) => b.key.localeCompare(a.key))
    }
  },
  watch: {
    'course.cname': 'changeCreateDisable',
    'course.year': 'changeCreateDisable',
    'course.semester': 'changeCreateDisable'
  },
  mounted() {
    this.permission = String(this.$store.state.permission || '')
    this.activeTab = this.isTeacher ? 'assist' : 'learn'
    this.pinnedCnos = this.getSavedPins()
    this.getCourses()
  },
  methods: {
    getCourses() {
      const stCourse = request({
        url: '/api/course/getCourse',
        method: 'get',
        params: {
          uid: this.$store.state.uid
        }
      })
      const tCourse = request({
        url: '/api/course/getCourses',
        method: 'get',
        params: {
          uid: this.$store.state.uid
        }
      })

      axios.all([stCourse, tCourse])
        .then(axios.spread((res1, res2) => {
          const allCourses = [...(res1.data || []), ...(res2.data || [])]
          this.archiveCourses = allCourses.filter(e => e.archiveStatus === 1)
          this.courses = allCourses.filter(e => e.archiveStatus === 0)
          this.ensureDefaultPins()
          this.initExpandedGroups()
        }))
    },
    isCourseOwner(course) {
      return course.admin && course.admin.userId == this.$store.state.uid
    },
    semesterText(semester) {
      return semester === '1' ? '第一学期' : '第二学期'
    },
    getSavedPins() {
      try {
        return JSON.parse(window.localStorage.getItem(this.pinStoreKey()) || '[]')
      } catch (e) {
        return []
      }
    },
    pinStoreKey() {
      return `ktp:pinned:${this.$store.state.uid || 'guest'}`
    },
    savePins() {
      window.localStorage.setItem(this.pinStoreKey(), JSON.stringify(this.pinnedCnos))
    },
    isPinned(course) {
      return this.pinnedCnos.includes(course.cno)
    },
    togglePin(course) {
      if (this.isPinned(course)) {
        this.pinnedCnos = this.pinnedCnos.filter(item => item !== course.cno)
      } else {
        this.pinnedCnos = [course.cno, ...this.pinnedCnos]
      }
      this.savePins()
    },
    ensureDefaultPins() {
      if (this.pinnedCnos.length > 0 || this.courses.length === 0) {
        return
      }
      this.pinnedCnos = this.courses.slice(0, 4).map(course => course.cno)
      this.savePins()
    },
    initExpandedGroups() {
      this.groupedCourses.forEach((group, index) => {
        if (this.expandedGroups[group.key] === undefined) {
          this.$set(this.expandedGroups, group.key, index === 0)
        }
      })
    },
    toggleGroup(key) {
      this.$set(this.expandedGroups, key, !this.expandedGroups[key])
    },
    cc(title) {
      this.course_select = title
      this.createCourseDialog = true
      this.course = {
        year: '',
        cname: '',
        semester: '',
        members: 0,
        admin: {
          userId: this.$store.state.uid,
          name: this.$store.state.name
        }
      }
      this.createNotNull = true
    },
    changeCreateDisable() {
      this.createNotNull = !(this.course.cname && this.course.year && this.course.semester)
    },
    cancel() {
      this.cno = ''
      this.addCourseDialog = false
      this.createCourseDialog = false
      this.archiveDialog = false
      this.course_select = ''
      this.changeCreateDisable()
    },
    addCourse() {
      if (this.course_select === '创建课程') {
        request({
          url: '/api/course/addCourse',
          method: 'post',
          data: this.course
        }).then(res => {
          if (res.data === true) {
            this.$message.success('课程创建成功')
            this.getCourses()
          } else {
            this.$message.error('创建失败')
          }
          this.cancel()
        }).catch(err => {
          console.log(err)
          this.cancel()
        })
      } else {
        request({
          url: '/api/course/updateCourse',
          method: 'put',
          params: {
            name: this.course.cname,
            year: this.course.year,
            semester: this.course.semester,
            cno: this.course.cno
          }
        }).then(res => {
          if (res.data === true) {
            this.$message.success('课程已更新')
            this.getCourses()
          } else {
            this.$message.error('编辑失败')
          }
          this.cancel()
        }).catch(err => {
          console.log(err)
          this.cancel()
        })
      }
    },
    editCourse(course) {
      this.course = JSON.parse(JSON.stringify(course))
      this.course.cname = this.course.name
      delete this.course.name
      this.course_select = '编辑课程'
      this.createCourseDialog = true
      this.changeCreateDisable()
    },
    deleteCourse(course) {
      this.$confirm('确认永久删除该课程吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/api/course/updateCourse',
          method: 'put',
          params: {
            cno: course.cno,
            deleteStatus: 1
          }
        }).then(res => {
          if (res.data === true) {
            this.getCourses()
            this.$message.success('删除成功')
          } else {
            this.$message.error('删除失败')
          }
        })
      }).catch(() => {})
    },
    archiveCourse(course) {
      this.$confirm('确认归档该课程吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/api/course/updateCourse',
          method: 'put',
          params: {
            cno: course.cno,
            archive: 1
          }
        }).then(res => {
          if (res.data === true) {
            this.getCourses()
            this.$message.success('已归档')
          } else {
            this.$message.error('归档失败')
          }
        })
      }).catch(() => {})
    },
    recover(course) {
      const requestBody = this.isTeacher
        ? {
            url: '/api/course/updateCourse',
            method: 'put',
            params: {
              cno: course.cno,
              archive: 0
            }
          }
        : {
            url: '/api/course/changeStatus',
            method: 'put',
            params: {
              cno: course.cno,
              uid: this.$store.state.uid,
              status: '0'
            }
          }

      this.$confirm('确认恢复该课程吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request(requestBody).then(res => {
          if (res.data === true) {
            this.getCourses()
            this.$message.success('恢复成功')
          } else {
            this.$message.error('恢复失败')
          }
        })
      }).catch(() => {})
    },
    dropOut(course) {
      this.$confirm('确认退出该课程吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/api/course/changeStatus',
          method: 'put',
          params: {
            cno: course.cno,
            uid: this.$store.state.uid,
            status: '2'
          }
        }).then(res => {
          if (res.data === true) {
            this.getCourses()
            this.$message.success('已退出课程')
          } else {
            this.$message.error('退出失败')
          }
        })
      }).catch(() => {})
    },
    addToACourse() {
      request({
        url: '/api/course/addMember',
        method: 'put',
        params: {
          cno: this.cno,
          uid: this.$store.state.uid
        }
      }).then(res => {
        if (res.data) {
          this.getCourses()
          this.$message.success('已加入课程')
        } else {
          this.$message.error('未找到对应课程')
        }
      }).catch(err => {
        console.log(err)
      })
      this.cancel()
    },
    clearStyle() {},
    gotoTask(course) {
      if (this.isTeacher) {
        this.$router.push({ path: `/teachertask/${course.cno}` })
      } else {
        this.$router.push({ path: `/studenttask/${course.cno}` })
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
    width: min(1180px, 92%);
    margin: 0 auto;
    padding-top: 86px;
    padding-bottom: 48px;
  }

  .pinned-panel {
    min-height: 318px;
    border: 1px solid #dde3ec;
    border-radius: 8px;
    background: #fff;
    padding: 22px 24px;
    overflow-x: auto;
    margin-bottom: 22px;
  }

  .section-head,
  .course-bar,
  .semester-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .section-head {
    margin-bottom: 20px;
  }

  .section-head h2,
  .semester-head h2 {
    color: #1f2937;
    font-size: 18px;
    font-weight: 700;
  }

  .pinned-scroll {
    display: grid;
    grid-template-columns: repeat(4, minmax(238px, 1fr));
    gap: 20px;
    min-width: 960px;
  }

  .course-bar {
    margin-bottom: 22px;
  }

  .tabs {
    display: flex;
    gap: 36px;
    border-bottom: 1px solid #dbe3f0;
  }

  .tabs button {
    border: 0;
    background: transparent;
    height: 42px;
    padding: 0;
    color: #1f2937;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 3px solid transparent;
  }

  .tabs button.active {
    color: #3f7fff;
    border-bottom-color: #3f7fff;
  }

  .bar-actions {
    display: grid;
    grid-template-columns: auto auto auto minmax(220px, 1fr);
    gap: 12px;
    align-items: center;
  }

  .semester-list {
    display: grid;
    gap: 16px;
  }

  .semester-panel {
    border: 1px solid #dde3ec;
    border-radius: 8px;
    background: #fff;
    padding: 20px 24px 22px;
  }

  .semester-head {
    margin-bottom: 20px;
  }

  .semester-head button {
    border: 0;
    background: transparent;
    color: #3f7fff;
    cursor: pointer;
    font-size: 14px;
  }

  .course-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  .empty-state {
    padding: 64px 20px;
    text-align: center;
    color: #64748b;
    border: 1px dashed #cbd5e1;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.75);
  }

  .archive-list {
    max-height: 360px;
    overflow: auto;
    display: grid;
    gap: 10px;
  }

  .archive-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 10px;
    background: #f8fbff;
    border: 1px solid #e2e6ed;
  }

  .archive-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .archive-meta {
    margin-top: 6px;
    font-size: 12px;
    color: #64748b;
  }

  .archive-actions {
    display: flex;
    gap: 14px;
    white-space: nowrap;
  }

  .archive-actions span {
    cursor: pointer;
    color: #2c58ab;
  }

  .create {
    display: grid;
    gap: 14px;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  @media (max-width: 900px) {
    .section-head,
    .course-bar,
    .semester-head {
      flex-direction: column;
      align-items: flex-start;
    }

    .bar-actions,
    .course-grid,
    .row {
      grid-template-columns: 1fr;
    }

    .pinned-panel {
      height: auto;
    }

    .pinned-scroll {
      min-width: 0;
      grid-template-columns: 1fr;
    }
  }
</style>
