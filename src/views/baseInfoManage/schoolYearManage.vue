<template>
  <div class="box">
    <el-container v-loading="loading">
      <el-header height="auto">
        <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        <el-button type="success" size="small" @click="addBtnClick">添加</el-button>
      </el-header>
      <el-main>
        <el-table size="small" :data="schoolYearData">
          <el-table-column prop="startYear" label="开始年份"/>
          <el-table-column prop="endYear" label="结束年份"/>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <!-- <el-button type="primary" size="small" @click="updateBtnClick(scope.row)">修改</el-button> -->
              <el-button type="danger" size="small" @click="deleteBtnClick(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <!-- <el-footer>Footer</el-footer> -->
    </el-container>
    <!-- 添加学年对话框开始 -->
    <el-dialog
      title="添加学年"
      v-loading="addSchoolYearDiag.loading"
      :visible.sync="addSchoolYearDiag.visible"
      @closed="addSchoolYearDiagClosed"
    >
      <div class="diag-form-box">
        <el-form
          ref="addSchoolYearForm"
          label-width="80px"
          :model="addSchoolYearDiag.form"
          :rules="addSchoolYearDiag.rules"
        >
          <el-form-item label="开始年份" prop="startYear">
            <el-input v-model="addSchoolYearDiag.form.startYear"></el-input>
          </el-form-item>
          <el-form-item label="结束年份" prop="endYear">
            <el-input v-model="addSchoolYearDiag.form.endYear"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addSchoolYearDiag.visible = false">取 消</el-button>
        <el-button type="primary" @click="addSchoolYearDiagComfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加学年对话框结束 -->
  </div>
</template>

<script>
import {
  getAllSchoolYears,
  postSchoolYear,
  putSchoolYear,
  deleteSchoolYear,
} from '@/api/baseData'

export default {
  name: 'SchoolYearManage',
  data() {
    return {
      loading: false,
      schoolYearData: [],
      addSchoolYearDiag: {
        visible: false,
        loading: false,
        form: {
          startYear: '',
          endYear: '',
        },
        rules: {
          startYear: [
            {
              required: true,
              message: '请填写学年开始年份',
              trigger: 'blur',
            },
          ],
          endYear: [
            {
              required: true,
              message: '请填写学年结束年份',
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
    async refreshSchoolYear() {
      try {
        const { data: response } = await getAllSchoolYears({
          order: JSON.stringify([['startYear', 'DESC'], ['endYear', 'ASC']]),
          disablePagination: 1,
        })
        this.schoolYearData = response.data.rows
        this.$message.success('获取学年信息成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取学年信息失败，请重试！')
        }
      }
    },
    async refreshData() {
      this.loading = true
      await this.refreshSchoolYear()
      this.loading = false
    },
    async addBtnClick() {
      this.addSchoolYearDiag.visible = true
    },
    addSchoolYearDiagClosed() {
      this.$refs.addSchoolYearForm.resetFields()
    },
    addSchoolYearDiagComfirm() {
      this.$refs.addSchoolYearForm.validate(async valid => {
        if (!valid) {
          return
        }
        this.addSchoolYearDiag.loading = true
        try {
          const startYear = this.addSchoolYearDiag.form.startYear
          const endYear = this.addSchoolYearDiag.form.endYear
          await postSchoolYear({
            startYear,
            endYear,
          })
          this.addSchoolYearDiag.visible = false
          await this.refreshSchoolYear()
          this.$message.success('添加学年成功！')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('添加学年失败，请重试！')
          }
        }
        this.addSchoolYearDiag.loading = false
      })
    },
    async deleteBtnClick(row) {
      try {
        await this.$confirm(
          `确认删除学年：${row.startYear} - ${row.endYear}？`,
          '确认删除',
          {
            type: 'warning',
          }
        )
        this.loading = true
        try {
          await deleteSchoolYear({
            id: row.id,
          })
          this.$message.success('删除学年成功！')
          await this.refreshSchoolYear()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('删除学年失败，请重试！')
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
