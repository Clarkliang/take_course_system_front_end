<template>
  <div class="box" v-loading="loading">
    <el-container>
      <el-header height="auto">
        <el-form class="header-filter-form-inline" :inline="true">
          <el-form-item>
            <el-button type="primary" size="small" icon="el-icon-search" @click="searchBtnClick">查询</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-main>
        <el-table size="small" :data="recordData">
          <el-table-column prop="takeCourseArrangement.course.name" label="课程名"/>
          <el-table-column prop="takeCourseArrangement.teacher.name" label="授课教师"/>
          <el-table-column label="学期">
            <template
              slot-scope="scope"
            >{{ `${scope.row.takeCourseArrangement.takeCourseEvent.term.schoolYear.startYear}-${scope.row.takeCourseArrangement.takeCourseEvent.term.schoolYear.endYear}学年 第${scope.row.takeCourseArrangement.takeCourseEvent.term.number}学期` }}</template>
          </el-table-column>
          <el-table-column label="成绩">
            <template slot-scope="scope">
              <template
                v-if="scope.row.takeCourseScore"
              >{{ `${scope.row.takeCourseScore.finallyScore}` }}</template>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer>
        <el-row type="flex" class="row-bg" justify="center">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="pagination.currentPage"
            :page-size="10"
            :total="pagination.total"
            @size-change="handleListSizeChange"
            @current-change="handleListCurrentChange"
          />
        </el-row>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { getPersonalTakeCourseRecords } from '@/api/course'

export default {
  name: 'MyTakeCourseRecord',
  data() {
    return {
      loading: false,
      recordData: [],
      pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
    }
  },
  async mounted() {
    await this.refreshData()
  },
  methods: {
    async refreshRecordData() {
      try {
        const { data: response } = await getPersonalTakeCourseRecords({
          page: this.pagination.currentPage,
          row: this.pagination.pageSize,
          order: JSON.stringify([['createTime', 'DESC']]),
        })
        this.recordData = response.data.rows
        this.pagination.total = response.data.count
        this.$message.success('刷新选课数据成功！')
      } catch (err) {
        this.recordData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('刷新选课数据失败，请重试！')
        }
      }
    },
    async refreshData() {
      this.loading = true
      await this.refreshRecordData()
      this.loading = false
    },
    async searchBtnClick() {
      await this.refreshData()
    },
    async handleListSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      await this.refreshData()
    },
    async handleListCurrentChange(val) {
      this.pagination.currentPage = val
      await this.refreshData()
    },
  },
}
</script>

<style scoped>
.box {
  margin-top: 10px;
}
</style>
