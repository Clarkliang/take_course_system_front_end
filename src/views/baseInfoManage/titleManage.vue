<template>
  <div class="box">
    <el-container v-loading="loading">
      <el-header height="auto">
        <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        <el-button type="success" size="small" @click="addBtnClick">添加</el-button>
      </el-header>
      <el-main>
        <el-table size="small" :data="titleData">
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
import { getTitle, postTitle, putTitle, deleteTitle } from '@/api/baseData'

export default {
  name: 'TitleManage',
  data() {
    return {
      loading: false,
      titleData: [],
    }
  },
  async mounted() {
    await this.refreshData()
  },
  methods: {
    async refreshTitleData() {
      try {
        const { data: response } = await getTitle({
          disablePagination: 1,
        })
        this.titleData = response.data.rows
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
      await this.refreshTitleData()
      this.loading = false
    },
    async addBtnClick() {
      this.$prompt('名称', '添加职称', {
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
            await postTitle({ name: value })
            this.$message.success('添加职称信息成功！')
            done()
            await this.refreshTitleData()
          } catch (err) {
            if (err.data && err.data.errorMessage) {
              this.$message.error(err.data.errorMessage)
            } else {
              this.$message.error('添加职称信息失败，请重试！')
            }
          }
          loading.close()
        },
      })
    },
    async updateBtnClick(row) {
      this.$prompt('名称', '修改职称', {
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
            await putTitle({ id: row.id, name: value })
            this.$message.success('修改职称信息成功！')
            done()
            await this.refreshTitleData()
          } catch (err) {
            if (err.data && err.data.errorMessage) {
              this.$message.error(err.data.errorMessage)
            } else {
              this.$message.error('修改职称信息失败，请重试！')
            }
          }
          loading.close()
        },
      })
    },
    async deleteBtnClick(row) {
      try {
        await this.$confirm(`确认删除职称：${row.name}？`, '确认删除', {
          type: 'warning',
        })
        this.loading = true
        try {
          await deleteTitle({
            id: row.id,
          })
          this.$message.success('删除职称成功！')
          await this.refreshTitleData()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('删除职称失败，请重试！')
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
