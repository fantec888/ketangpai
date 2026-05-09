<template>
  <div class="nav-shell">
    <div class="content">
      <div class="slot slot-left"><slot name="left" /></div>
      <div class="slot slot-center"><slot name="center" /></div>
      <div class="slot slot-right"><slot name="right" /></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Navigation',
}
</script>

<style scoped>
  .nav-shell {
    width: 100%;
    height: 72px;
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.88);
    border-bottom: 1px solid rgba(226, 230, 237, 0.9);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }
  .content {
    width: min(92%, 1280px);
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    gap: 16px;
  }
  .slot {
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .slot-center {
    flex: 1;
    justify-content: center;
  }
  .slot-right {
    justify-content: flex-end;
  }
</style>
