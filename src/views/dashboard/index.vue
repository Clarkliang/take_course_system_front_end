<template>
  <div class="dashboard-container">
    <div class="dashboard-text">
      <template v-if="name">{{ name }}，欢迎你</template>
      <template v-else>欢迎你</template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    // ...mapGetters([
    //   'name',
    // ]),
    name() {
      const user = this.$store.state.user
      const userInfo = user.userInfo
      if (userInfo && userInfo.studentInfo) {
        return userInfo.studentInfo.name
      } else if (userInfo && userInfo.teacherInfo) {
        return userInfo.teacherInfo.name
      } else {
        return void 0
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
