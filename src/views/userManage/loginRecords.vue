<template>
  <div class="box">
    <el-container v-loading="loading">
      <!-- <el-header>Header</el-header> -->
      <el-main>
        <el-table
          :data="records"
          style="max-width: 800px; margin: 0 auto;"
          :default-sort="{prop: 'time', order: 'descending'}"
          @sort-change="handleSortChange"
        >
          <el-table-column prop="time" label="时间" width="180" sortable="custom">
            <template slot-scope="scope">{{ scope.row.time | parseTime }}</template>
          </el-table-column>
          <el-table-column prop="ip" label="ip"/>
          <el-table-column prop="status" label="状态" width="150">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status === 0" type="success">登录成功</el-tag>
              <el-tag v-else-if="scope.row.status === 1" type="danger">密码错误</el-tag>
              <el-tag v-else-if="scope.row.status === 2" type="info">账号被冻结</el-tag>
              <el-tag v-else type="warning">其他原因</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer v-if="paginationData.total > 0">
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
  </div>
</template>

<script>
import { getPersonalLoginRecord } from '@/api/user'
import { parseTime } from '@/utils'

export default {
  name: 'LoginRecords',
  filters: {
    parseTime,
  },
  data() {
    return {
      loading: false,
      records: [],
      sort: null,
      paginationData: {
        currentPage: 1,
        total: 0,
        pageSize: 10,
      },
    }
  },
  computed: {
    getRecordsParams() {
      const orderMap = {
        ascending: 'ASC',
        descending: 'DESC',
      }
      const params = {
        page: this.paginationData.currentPage,
        row: this.paginationData.pageSize,
      }
      const sort = this.sort
      // debugger
      if (sort && sort.prop) {
        params.order = JSON.stringify([[sort.prop, orderMap[sort.order]]])
      } else {
        params.order = JSON.stringify([['time', 'DESC']])
      }
      return params
    },
  },
  async mounted() {
    await this.refreshData()
  },
  methods: {
    async refreshRecords() {
      try {
        const { data: response } = await getPersonalLoginRecord(
          this.getRecordsParams
        )
        this.records = response.data.rows
        this.paginationData.total = response.data.count
        this.$message.success('获取登录日志成功！')
      } catch (err) {
        if (!err.data) {
          this.$message.error('获取登录日志失败，请重试！')
          return
        }
        const data = err.data
        this.$message.error(data.errorMessage || '获取登录日志失败，请重试！')
      }
    },
    handleSizeChange(val) {
      this.paginationData.pageSize = val
      this.refreshData()
    },
    handleCurrentChange(val) {
      this.paginationData.currentPage = val
      this.refreshData()
    },
    handleSortChange(val) {
      this.sort = val
      this.refreshData()
    },
    async refreshData() {
      this.loading = true
      await this.refreshRecords()
      this.loading = false
    },
  },
}
</script>

<style>
.el-container {
  display: flex;
  flex-direction: column;
}

.el-footer > .el-pagination {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
