# 课堂派仿真教学管理系统

这是一个基于 Spring Boot、MyBatis、Vue 2 和 Element UI 开发的课堂派课程管理系统。项目包含教师端和学生端常用流程，支持课程管理、成员管理、作业发布与提交、课程讨论、消息通知、待办、私信聊天、客服/公众号展示等功能。

## 项目结构

- `ktpsys/`：后端 Spring Boot 项目，提供课程、作业、成员、消息、文件上传等接口。
- `ktp2/ktp2/`：前端 Vue 2 项目，负责登录、首页、课程、作业、消息、个人中心等页面。
- `ktp2/ktp2/public/static/annex/`：项目附带的资料文件。

## 技术栈

- 后端：Java 8、Spring Boot 2.3.1、MyBatis、MySQL
- 前端：Vue 2、Vue Router、Vuex、Element UI、Axios、WangEditor
- 构建：Maven、Vue CLI

## 主要功能

- 登录、注册和身份区分
- 教师创建课程、归档课程、管理课程成员
- 学生通过课程码加入课程
- 教师发布作业，学生提交作业文件
- 作业批改、成绩展示和消息通知
- 课程讨论内容同步
- 右侧工具栏：待办、好友、私信、客服、公众号等入口
- 论文查重和 AI PPT 外部工具入口

## 后端启动

先准备 MySQL，并创建 `ktp` 数据库。数据库连接默认读取环境变量，也可以直接使用 `application.yml` 中的默认值。

```powershell
cd ktpsys
$env:KTP_DB_URL="jdbc:mysql://127.0.0.1:3306/ktp?serverTimezone=UTC&useUnicode=true&characterEncoding=utf-8"
$env:KTP_DB_USERNAME="root"
$env:KTP_DB_PASSWORD="你的数据库密码"
.\mvnw.cmd spring-boot:run
```

后端默认地址：

```text
http://localhost:8090
```

## 前端启动

```powershell
cd ktp2/ktp2
npm install
npm.cmd run serve
```

前端默认地址：

```text
http://localhost:3000
```

## 打包

前端打包：

```powershell
cd ktp2/ktp2
npm.cmd run build
```

后端打包：

```powershell
cd ktpsys
.\mvnw.cmd -DskipTests package
```

## 说明

本仓库已经排除了 `node_modules`、`dist`、`target`、日志文件和 IDE 配置等本地生成内容。克隆后需要分别安装前端依赖、配置数据库，再启动前后端服务。
