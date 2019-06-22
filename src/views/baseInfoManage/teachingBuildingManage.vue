<template>
  <div class="box">
    <el-container v-loading="loading">
      <el-header height="auto">
        <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        <el-button type="success" size="small" @click="addBtnClick">添加</el-button>
      </el-header>
      <el-main>
        <el-table size="small" :data="teachingBuildingData">
          <el-table-column prop="name" label="名称"/>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="small" @click="updateBtnClick(scope)">修改</el-button>
              <el-button type="danger" size="small" @click="deleteBtnClick(scope)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <!-- <el-footer>Footer</el-footer> -->
    </el-container>
    <!-- 添加教学楼对话框开始 -->
    <el-dialog
      title="添加教学楼"
      v-loading="addTeachingBuildingDiag.loading"
      :visible.sync="addTeachingBuildingDiag.visible"
      @closed="addTeachingBuildingDiagClosed"
    >
      <div class="diag-form-box">
        <el-form
          ref="addTeachingBuildingForm"
          label-width="80px"
          :model="addTeachingBuildingDiag.form"
          :rules="addTeachingBuildingDiag.rules"
        >
          <el-form-item label="名称" prop="name">
            <el-input v-model="addTeachingBuildingDiag.form.name"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addTeachingBuildingDiag.visible = false">取 消</el-button>
        <el-button type="primary" @click="addTeachingBuildingDiagConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加教学楼对话框结束 -->
  </div>
</template>

<script>
import {
  getAllTeachingBuildings,
  postTeachingBuilding,
  putTeachingBuilding,
  deleteTeachingBuilding,
} from '@/api/baseData'

export default {
  name: 'TeachingBuildingManage',
  data() {
    return {
      loading: false,
      teachingBuildingData: [],
      addTeachingBuildingDiag: {
        visible: false,
        loading: false,
        form: {
          name: '',
        },
        rules: {
          name: [
            {
              required: true,
              message: '请填写名称',
              trigger: 'blur',
            },
          ],
        },
      },
    }
  },
  async mounted() {
    await this.refreshData()
  },
  methods: {
    async refreshTechingBuildingData() {
      try {
        const { data: response } = await getAllTeachingBuildings({
          disablePagination: 1,
        })
        this.teachingBuildingData = response.data.rows
        this.$message.success('获取数据成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取数据失败，请重试！')
        }
      }
    },
    async refreshData() {
      this.loading = true
      await this.refreshTechingBuildingData()
      this.loading = false
    },
    addBtnClick() {
      this.addTeachingBuildingDiag.visible = true
    },
    addTeachingBuildingDiagClosed() {
      this.$refs.addTeachingBuildingForm.resetFields()
    },
    addTeachingBuildingDiagConfirm() {
      this.$refs.addTeachingBuildingForm.validate(async valid => {
        if (!valid) {
          return
        }
        this.addTeachingBuildingDiag.loading = true
        try {
          const name = this.addTeachingBuildingDiag.form.name
          await postTeachingBuilding({
            name,
          })
          this.addTeachingBuildingDiag.visible = false
          await this.refreshTechingBuildingData()
          this.$message.success('添加教学楼成功！')
        } catch (err) {}
        this.addTeachingBuildingDiag.loading = false
      })
    },
    updateBtnClick(scope) {
      const row = scope.row
      this.$prompt('名称', '修改教学楼信息', {
        inputValue: row.name,
        inputValidator(val) {
          if (!val) {
            return '请输入名称'
          }
          return true
        },
        beforeClose: async (action, instance, done) => {
          if (action !== 'confirm') {
            done()
            return
          }
          const loading = this.$loading()
          try {
            const value = instance.inputValue
            await putTeachingBuilding({
              id: row.id,
              value: JSON.stringify({ name: value }),
            })
            this.$message.success('修改教学楼信息成功！')
            done()
            await this.refreshTechingBuildingData()
          } catch (err) {
            if (err.data && err.data.errorMessage) {
              this.$message.error(err.data.errorMessage)
            } else {
              this.$message.error('修改教学楼信息失败，请重试！')
            }
          }
          loading.close()
        },
      })
    },
    async deleteBtnClick(scope) {
      const row = scope.row
      try {
        await this.$confirm(`确认删除教学楼：${row.name}？`, '确认删除', {
          type: 'warning',
        })
        this.loading = true
        try {
          await deleteTeachingBuilding({
            id: row.id,
          })
          this.$message.success('删除教学楼成功！')
          await this.refreshTechingBuildingData()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('删除教学楼失败，请重试！')
          }
        }
        this.loading = false
      } catch (err) {
        this.$message.warning('取消删除操作')
      }
    },
  },
}
</script>

<style scoped>
.box {
  margin-top: 10px;
}

.box .diag-form-box {
  max-width: 300px;
}
</style>
