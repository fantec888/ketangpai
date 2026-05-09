import axios from 'axios'
import { request } from 'network/request'

function semesterText(semester) {
  return String(semester) === '1' ? ' 第一学期' : ' 第二学期'
}

function courseClass(course) {
  return course.className || course.class || `${course.year || ''}${semesterText(course.semester)}`.trim() || '课堂'
}

function dateTimeText(date) {
  if (!date) return '未设置截止时间'
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return '未设置截止时间'
  const pad = num => String(num).padStart(2, '0')
  return `${value.getFullYear()}/${pad(value.getMonth() + 1)}/${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`
}

function makeStudentTodo(course, task) {
  return {
    id: `submit-${task.tno}`,
    type: 'submit',
    icon: 'el-icon-edit-outline',
    label: '作业',
    actionText: '去提交',
    courseName: course.name || '未命名课程',
    taskName: task.tname || '未命名作业',
    className: courseClass(course),
    timeText: dateTimeText(task.endDate),
    endDate: task.endDate,
    path: `/studenttaskcommit/${task.cno}/${task.tno}`
  }
}

function makeTeacherTodo(course, task) {
  const count = Number(task.submitNum || 0) - Number(task.judgeNum || 0)
  return {
    id: `grade-${task.tno}`,
    type: 'grade',
    icon: 'el-icon-document-checked',
    label: `批改 ${count}份`,
    actionText: '去批改',
    courseName: course.name || '未命名课程',
    taskName: task.tname || '未命名作业',
    className: courseClass(course),
    timeText: dateTimeText(task.endDate),
    endDate: task.endDate,
    path: `/taskmark/${task.cno}/${task.tno}`
  }
}

function buildStudentTodos(uid, courses) {
  const requests = courses.map(course => {
    return request({
      url: '/api/taskList',
      method: 'get',
      params: { cno: course.cno }
    }).then(taskRes => {
      const tasks = taskRes.data || []
      const gradeRequests = tasks.map(task => {
        return request({
          url: '/api/grade/getGrade',
          method: 'get',
          params: {
            uid,
            tno: task.tno
          }
        }).then(gradeRes => {
          const grade = gradeRes.data || {}
          return grade.status === 0 ? makeStudentTodo(course, task) : null
        }).catch(() => null)
      })
      return axios.all(gradeRequests)
    }).then(list => list.filter(Boolean))
  })

  return axios.all(requests).then(groups => groups.reduce((result, group) => result.concat(group), []))
}

function buildTeacherTodos(courses) {
  const requests = courses.map(course => {
    return request({
      url: '/api/taskList',
      method: 'get',
      params: { cno: course.cno }
    }).then(taskRes => {
      return (taskRes.data || [])
        .filter(task => Number(task.submitNum || 0) - Number(task.judgeNum || 0) > 0)
        .map(task => makeTeacherTodo(course, task))
    })
  })

  return axios.all(requests).then(groups => groups.reduce((result, group) => result.concat(group), []))
}

export function loadTodos(uid) {
  if (!uid) return Promise.resolve([])

  const studentCourseReq = request({
    url: '/api/course/getCourse',
    method: 'get',
    params: { uid }
  })
  const teacherCourseReq = request({
    url: '/api/course/getCourses',
    method: 'get',
    params: { uid }
  })

  return axios.all([studentCourseReq, teacherCourseReq])
    .then(axios.spread((studentRes, teacherRes) => {
      const studentCourses = (studentRes.data || []).filter(course => course.archiveStatus !== 1)
      const teacherCourses = (teacherRes.data || []).filter(course => course.archiveStatus !== 1)

      return axios.all([
        buildStudentTodos(uid, studentCourses),
        buildTeacherTodos(teacherCourses)
      ])
    }))
    .then(([studentTodos, teacherTodos]) => {
      return [...studentTodos, ...teacherTodos]
        .sort((a, b) => new Date(a.endDate || 0) - new Date(b.endDate || 0))
    })
}

export function loadNotificationCount(uid) {
  if (!uid) return Promise.resolve(0)

  const messageReq = request({
    url: '/api/message/getNotReadCount',
    method: 'get',
    params: {
      to: uid
    }
  }).then(res => Number(res.data || 0)).catch(() => 0)

  const todoReq = loadTodos(uid).then(todos => todos.length).catch(() => 0)

  return Promise.all([messageReq, todoReq]).then(([messageCount, todoCount]) => messageCount + todoCount)
}

export function todoToMessage(todo) {
  return {
    id: `todo-${todo.id}`,
    source: 'todo',
    status: 0,
    icon: todo.icon,
    title: todo.type === 'grade' ? '待批改作业' : '待提交作业',
    msg: todo.type === 'grade'
      ? `${todo.courseName} 的「${todo.taskName}」还有作业需要批改。`
      : `${todo.courseName} 的「${todo.taskName}」还没有提交，请在截止前完成。`,
    meta: `${todo.className} · 截止 ${todo.timeText}`,
    actionText: todo.actionText,
    path: todo.path,
    endDate: todo.endDate
  }
}
