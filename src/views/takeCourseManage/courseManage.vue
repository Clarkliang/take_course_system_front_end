<template>
  <div class="box">
    <el-container v-loading="loading">
      <el-header height="auto">
        <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        <el-button type="success" size="small" @click="addBtnClick">添加</el-button>
      </el-header>
      <el-main>
        <!-- 课程列表开始 -->
        <el-table size="small" :data="courseData">
          <el-table-column prop="name" label="名称"/>
          <el-table-column prop="credit" label="学分"/>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <!-- <el-button type="primary" size="small" @click="updateBtnClick(scope.row)">修改</el-button> -->
              <el-button type="danger" size="small" @click="deleteBtnClick(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 课程列表结束 -->
      </el-main>
      <el-footer>
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="paginationData.currentPage"
          :page-size="10"
          :total="paginationData.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-footer>
    </el-container>
    <!-- 添加课程对话框开始 -->
    <el-dialog
      title="添加课程"
      :visible.sync="addCourseDiag.visible"
      v-loading="addCourseDiag.loading"
      @closed="addCourseDiagClosed"
    >
      <div class="diag-form-box">
        <el-form
          ref="addCourseForm"
          label-width="80px"
          :model="addCourseDiag.form"
          :rules="addCourseDiag.rules"
        >
          <el-form-item label="课程名称" prop="name">
            <el-input v-model="addCourseDiag.form.name"></el-input>
          </el-form-item>
          <el-form-item label="学分" prop="credit">
            <el-input v-model="addCourseDiag.form.credit" type="number"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCourseDiag.visible = false">取 消</el-button>
        <el-button type="primary" @click="addCourseDiagComfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加课程对话框结束 -->
  </div>
</template>

<script>
import {
  getAllCourses,
  postCourse,
  putCourse,
  deleteCourse,
} from '@/api/course'

export default {
  name: 'CourseManage',
  data() {
    return {
      loading: false,
      courseData: [],
      addCourseDiag: {
        visible: false,
        loading: false,
        form: {
          name: '',
          credit: '',
        },
        rules: {
          name: [
            {
              required: true,
              message: '请填写课程名称',
              trigger: 'blur',
            },
          ],
          credit: [
            {
              required: true,
              message: '请填写课程学分',
              trigger: 'blur',
            },
          ],
        },
      },
      paginationData: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
    }
  },
  computed: {
    getCourseParams() {
      return {
        page: this.paginationData.currentPage,
        row: this.paginationData.pageSize,
      }
    },
  },
  async mounted() {
    this.loading = true
    await this.refreshData()
    this.loading = false
  },
  methods: {
    async refreshCourseData() {
      try {
        const { data: response } = await getAllCourses(this.getCourseParams)
        this.courseData = response.data.rows
        this.paginationData.total = response.data.count
        this.$message.success('获取课程信息成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取课程信息失败，请重试！')
        }
      }
    },
    async refreshData() {
      this.loading = true
      await this.refreshCourseData()
      this.loading = false
    },
    async addBtnClick() {
      this.addCourseDiag.visible = true
    },
    async addCourseDiagClosed() {
      this.$refs.addCourseForm.resetFields()
    },
    async addCourseDiagComfirm() {
      this.$refs.addCourseForm.validate(async valid => {
        if (!valid) {
          return
        }
        this.addCourseDiag.loading = true
        try {
          const name = this.addCourseDiag.form.name
          const credit = this.addCourseDiag.form.credit
          await postCourse({
            name,
            credit,
          })
          this.addCourseDiag.visible = false
          await this.refreshCourseData()
          this.$message.success('添加课程成功！')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('添加课程失败，请重试！')
          }
        }
        this.addCourseDiag.loading = false
      })
    },
    async deleteBtnClick(row) {
      try {
        await this.$confirm(`确认删除课程：${row.name}？`, '确认删除', {
          type: 'warning',
        })
        this.loading = true
        try {
          await deleteCourse({
            id: row.id,
          })
          this.$message.success('删除课程成功！')
          await this.refreshCourseData()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('删除课程失败，请重试！')
          }
        }
        this.loading = false
      } catch (err) {
        this.$message.warning('取消删除操作')
      }
    },
    handleSizeChange(val) {
      this.paginationData.pageSize = val
      this.refreshData()
    },
    async handleCurrentChange(val) {
      this.paginationData.currentPage = val
      this.refreshData()
    },
  },
}
</script>

<style>
.box .el-pagination {
  display: flex;
  justify-content: center;
}
</style>

<style scoped>
.box {
  margin-top: 10px;
}

.box .diag-form-box {
  max-width: 300px;
}
</style>
