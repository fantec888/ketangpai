<template>
  <div>
    <div ref="toolbar" class="toolbar"></div>
    <div ref="editor" class="text" style="text-align:left;max-height: 200px;"></div>
  </div>
</template>

<script>
import E from 'wangeditor'
export default {
  name: 'editor',
  props: {
    description: {
      type: String,
      default: '',
    }
  },
  data () {
    return {
      editorContent: this.description
    }
  },
  mounted() {
    var editor = new E(this.$refs.toolbar, this.$refs.editor)

    // 【唯一修改的地方】：把 customConfig 删掉了，改成了 config
    editor.config.onchange = (html) => {
      this.editorContent = html
      this.$emit('description', this.editorContent) // 这里有时候也可能需要 emit('update:description', html) 看你父组件怎么写的，目前先保持你的原样
    }

    editor.create()
    editor.txt.html(this.description) // 初始化编辑器内容
  }
}
</script>

<style scoped>
  .toolbar {
    border: 1px solid #ccc;
  }
  .text {
    border: 1px solid #ccc;
    height: 400px;
  }
</style>
