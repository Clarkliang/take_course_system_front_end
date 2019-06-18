<template>
  <div class="box">
    <el-form
      ref="form"
      v-loading="loading"
      :model="updatePasswordForm"
      label-width="100px"
      :rules="rules"
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="updatePasswordForm.oldPassword" type="password"/>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="updatePasswordForm.newPassword" type="password"/>
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input v-model="updatePasswordForm.confirmPassword" type="password"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="updateBtnClick">修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { updatePassword } from '@/api/user'

export default {
  name: 'UpdatePassword',
  data() {
    return {
      loading: false,
      updatePasswordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      rules: {
        oldPassword: [
          { required: true, message: '请输入原密码！', trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: '请输入新密码！', trigger: 'blur' },
        ],
        confirmPassword: [
          {
            required: true,
            message: '请输入原密码',
            trigger: 'blur',
          },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value !== this.updatePasswordForm.newPassword) {
                callback(new Error('两次输入的新密码不一致！'))
              }
              callback()
            },
          },
        ],
      },
    }
  },
  mounted() {},
  methods: {
    async updateBtnClick() {
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return
        }
        this.loading = true
        try {
          await updatePassword({
            oldPassword: this.updatePasswordForm.oldPassword,
            newPassword: this.updatePasswordForm.newPassword,
          })
          this.$message.success('修改密码成功！')
          this.$refs.form.resetFields()
        } catch (err) {
          const data = err.data
          this.$message.error(data.errorMessage || '修改密码错误，请重试！')
        }
        this.loading = false
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.box {
  max-width: 500px;
  padding-right: 10px;
  margin-top: 16px;
}
</style>
