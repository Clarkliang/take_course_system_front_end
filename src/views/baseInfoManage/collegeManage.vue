<template>
  <div class="box">
    <el-container v-loading="loading">
      <el-header height="auto">
        <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        <el-button type="success" size="small" @click="addBtnClick">添加</el-button>
      </el-header>
      <el-main>
        <el-table size="small" :data="collegeData">
          <el-table-column prop="name" label="名称"/>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="small" @click="updateBtnClick(scope.row)">修改</el-button>
              <el-button type="danger" size="small" @click="deleteBtnClick(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <!-- <el-footer>Footer</el-footer> -->
    </el-container>
  </div>
</template>

<script>
import {
  getCollege,
  postCollege,
  putCollege,
  deleteCollege,
} from '@/api/baseData'

export default {
  name: 'CollegeManage',
  data() {
    return {
      loading: false,
      collegeData: [],
    }
  },
  async mounted() {
    await this.refreshData()
  },
  methods: {
    async refreshCollegeData() {
      try {
        const { data: response } = await getCollege({
          disablePagination: 1,
        })
        this.collegeData = response.data.rows
        this.$message.success('获取职称信息成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取职称信息失败，请重试！')
        }
      }
    },
    async refreshData() {
      this.loading = true
      await this.refreshCollegeData()
      this.loading = false
    },
    async addBtnClick() {
      this.$prompt('名称', '添加学院', {
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
            await postCollege({ name: value })
            this.$message.success('添加学院成功！')
            done()
            await this.refreshCollegeData()
          } catch (err) {
            if (err.data && err.data.errorMessage) {
              this.$message.error(err.data.errorMessage)
            } else {
              this.$message.error('添加学院失败，请重试！')
            }
          }
          loading.close()
        },
      })
    },
    async updateBtnClick(row) {
      this.$prompt('名称', '修改学院', {
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
            await putCollege({ id: row.id, name: value })
            this.$message.success('修改学院成功！')
            done()
            await this.refreshCollegeData()
          } catch (err) {
            if (err.data && err.data.errorMessage) {
              this.$message.error(err.data.errorMessage)
            } else {
              this.$message.error('修改学院失败，请重试！')
            }
          }
          loading.close()
        },
      })
    },
    async deleteBtnClick(row) {
      try {
        await this.$confirm(`确认删除学院：${row.name}？`, '确认删除', {
          type: 'warning',
        })
        this.loading = true
        try {
          await deleteCollege({
            id: row.id,
          })
          this.$message.success('删除学院成功！')
          await this.refreshCollegeData()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('删除学院失败，请重试！')
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
</style>
