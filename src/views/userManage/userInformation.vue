<template>
  <div class="box">
    <el-form ref="userInfoForm" v-loading="loading" :model="userInfoForm" label-width="80px">
      <div v-if="userInfoForm.userInfo">
        <el-form-item label="用户名">
          <el-input v-model="userInfoForm.userInfo.username" readonly />
        </el-form-item>
      </div>
      <el-form-item v-if="userInfoForm.roleInfo" label="角色">
        <el-tag>{{ userInfoForm.roleInfo.name }}</el-tag>
      </el-form-item>
      <div v-if="userInfoForm.teacherInfo">
        <el-form-item label="工号">
          <el-input v-model="userInfoForm.teacherInfo.number" readonly />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="userInfoForm.teacherInfo.name" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="userInfoForm.teacherInfo.sex">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="userInfoForm.teacherInfo.title !== void 0" label="职称">
          <el-tag>{{ userInfoForm.teacherInfo.title.name }}</el-tag>
        </el-form-item>
      </div>
      <el-form-item>
        <el-button type="primary" @click="updateInfoBtnClick">修改</el-button>
        <el-button @click="resetBtnClick">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getInfo, updateUserInfo } from '@/api/user'

export default {
  name: 'UserInformation',
  data() {
    return {
      loading: false,
      userInfoForm: {
        userInfo: {
          username: '',
        },
        roleInfo: null,
      },
    }
  },
  async mounted() {
    this.loading = true
    await this.refreshInfo()
    this.loading = false
  },
  methods: {
    async refreshInfo() {
      try {
        const { data: response } = await getInfo()
        const data = response.data
        const userInfoForm = {}

        if (data.userInfo) {
          userInfoForm.userInfo = {}
          userInfoForm.userInfo.username = data.userInfo.username
        }
        if (data.roleInfo) {
          userInfoForm.roleInfo = data.roleInfo
        }
        if (data.teacherInfo) {
          userInfoForm.teacherInfo = data.teacherInfo
        }
        this.userInfoForm = userInfoForm
        this.$message.success('刷新用户信息成功！')
      } catch (err) {
        this.$message.error('刷新用户信息失败，请重试！')
      }
    },
    async updateInfoBtnClick() {
      this.loading = true
      try {
        const userInfoForm = this.userInfoForm
        if (userInfoForm.teacherInfo) {
          const values = {
            name: userInfoForm.teacherInfo.name,
            sex: userInfoForm.teacherInfo.sex,
          }
          await updateUserInfo(
            JSON.stringify(values)
          )
          this.$message.success('修改成功！')
        }
        await this.refreshInfo()
      } catch (err) {
        this.$message.error(err.response.errorMessage || '修改失败，请重试！')
      }
      this.loading = false
    },
    async resetBtnClick() {
      this.loading = true
      this.refreshInfo()
      this.loading = false
    },
  },
}
</script>

<style lang="scss">
.box {
  max-width: 500px;
  padding-right: 10px;
  margin-top: 16px;
}
</style>
