<template>
  <div class="box">
    <!-- 学期列表开始 -->
    <el-container v-loading="loading">
      <el-header height="auto">
        <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        <el-button type="success" size="small" @click="addBtnClick">添加</el-button>
      </el-header>
      <el-main>
        <el-table size="small" :data="termData">
          <el-table-column prop="name" label="学年">
            <template slot-scope="scope">
              <template
                v-if="scope.row.schoolYear"
              >{{ `${scope.row.schoolYear.startYear} - ${scope.row.schoolYear.endYear}` }}</template>
            </template>
          </el-table-column>
          <el-table-column prop="number" label="学期序号"/>
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
    <!-- 学期列表结束 -->
    <!-- 添加学期对话框开始 -->
    <el-dialog
      title="添加学期"
      :visible.sync="addTermDiag.visible"
      v-loading="addTermDiag.loading"
      @closed="addTermDiagClosed"
    >
      <div class="diag-form-box">
        <el-form
          ref="addTermForm"
          label-width="80px"
          :model="addTermDiag.form"
          :rules="addTermDiag.rules"
        >
          <el-form-item label="学期" prop="number">
            <el-input v-model="addTermDiag.form.number"></el-input>
          </el-form-item>
          <el-form-item label="所属学年" prop="schoolYearId">
            <el-select
              v-model="addTermDiag.form.schoolYearId"
              filterable
              placeholder="请选择所属学年"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in schoolYearData"
                :key="index"
                :label="`${item.startYear} - ${item.endYear}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addTermDiag.visible = false">取 消</el-button>
        <el-button type="primary" @click="addTermDiagComfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加学期对话框结束 -->
  </div>
</template>

<script>
import {
  getAllTerms,
  postTerm,
  putTerm,
  deleteTerm,
  getAllSchoolYears,
} from '@/api/baseData'

export default {
  name: 'TermManage',
  data() {
    return {
      loading: false,
      termData: [],
      schoolYearData: [],
      addTermDiag: {
        visible: false,
        loading: false,
        form: {
          number: '',
          schoolYearId: '',
        },
        rules: {
          number: [
            {
              required: true,
              message: '请填写学期',
              trigger: 'blur',
            },
          ],
          schoolYearId: [
            {
              required: true,
              message: '请选择所属学年',
              trigger: 'blur',
            },
          ],
        },
      },
    }
  },
  async mounted() {
    this.loading = true
    await Promise.all([this.refreshTermData(), this.refreshSchoolYearData()])
    this.loading = false
  },
  methods: {
    async refreshTermData() {
      try {
        const { data: response } = await getAllTerms({
          order: JSON.stringify([['number', 'ASC']]),
          disablePagination: 1,
        })
        this.termData = response.data.rows
        this.$message.success('获取学期信息成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取学期信息失败，请重试！')
        }
      }
    },
    async refreshSchoolYearData() {
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
      await this.refreshTermData()
      this.loading = false
    },
    async addBtnClick() {
      this.addTermDiag.visible = true
    },
    async addTermDiagClosed() {
      this.$refs.addTermForm.resetFields()
    },
    async addTermDiagComfirm() {
      this.$refs.addTermForm.validate(async valid => {
        if (!valid) {
          return
        }
        this.addTermDiag.loading = true
        try {
          const number = this.addTermDiag.form.number
          const schoolYearId = this.addTermDiag.form.schoolYearId
          await postTerm({
            number,
            schoolYearId,
          })
          this.addTermDiag.visible = false
          await this.refreshTermData()
          this.$message.success('添加学期成功！')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('添加学期失败，请重试！')
          }
        }
        this.addTermDiag.loading = false
      })
    },
    async deleteBtnClick(row) {
      try {
        let confirmMessage
        if (row.schoolYear) {
          confirmMessage = `确认删除学期：${row.schoolYear.startYear} - ${
            row.schoolYear.endYear
          }学年第${row.number}学期？`
        } else {
          confirmMessage = `确认删除第${row.number}学期？`
        }
        await this.$confirm(confirmMessage, '确认删除', {
          type: 'warning',
        })
        this.loading = true
        try {
          await deleteTerm({
            id: row.id,
          })
          this.$message.success('删除学期成功！')
          await this.refreshTermData()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('删除学期失败，请重试！')
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
