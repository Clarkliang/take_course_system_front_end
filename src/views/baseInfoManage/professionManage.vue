<template>
  <div class="box">
    <el-container v-loading="loading">
      <el-header height="auto">
        <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        <el-button type="success" size="small" @click="addBtnClick">添加</el-button>
      </el-header>
      <el-main>
        <el-table size="small" :data="professionData">
          <el-table-column prop="name" label="名称"/>
          <el-table-column prop="college" label="所属学院">
            <template slot-scope="scope">
              <template v-if="scope.row.college">{{ scope.row.college.name }}</template>
            </template>
          </el-table-column>
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
    <!-- 添加专业对话框开始 -->
    <el-dialog
      title="添加专业"
      :visible.sync="addProfessionDiag.visible"
      v-loading="addProfessionDiag.loading"
      @closed="addProfessionDiagClosed"
    >
      <div class="diag-form-box">
        <el-form
          ref="addProfessionForm"
          label-width="80px"
          :model="addProfessionDiag.form"
          :rules="addProfessionDiag.rules"
        >
          <el-form-item label="专业名称" prop="name">
            <el-input v-model="addProfessionDiag.form.name"></el-input>
          </el-form-item>
          <el-form-item label="所属学院" prop="collegeId">
            <el-select
              v-model="addProfessionDiag.form.collegeId"
              filterable
              placeholder="请选择所属学院"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in collegeData"
                :key="index"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addProfessionDiag.visible = false">取 消</el-button>
        <el-button type="primary" @click="addProfessionDiagComfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加专业对话框结束 -->
  </div>
</template>

<script>
import {
  getProfessions,
  postProfessions,
  putProfessions,
  deleteProfessions,
  getCollege,
} from '@/api/baseData'

export default {
  name: 'ProfessionManage',
  data() {
    return {
      loading: false,
      professionData: [],
      collegeData: [],
      addProfessionDiag: {
        visible: false,
        loading: false,
        form: {
          name: '',
          collegeId: '',
        },
        rules: {
          name: [
            {
              required: true,
              message: '请填写专业名称',
              trigger: 'blur',
            },
          ],
          collegeId: [
            {
              required: true,
              message: '请选择所属学院',
              trigger: 'blur',
            },
          ],
        },
      },
    }
  },
  async mounted() {
    this.loading = true
    await Promise.all([this.refreshProfessionData(), this.refreshCollegeData()])
    this.loading = false
  },
  methods: {
    async refreshProfessionData() {
      try {
        const { data: response } = await getProfessions({
          disablePagination: 1,
        })
        this.professionData = response.data.rows
        this.$message.success('获取专业信息成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取专业信息失败，请重试！')
        }
      }
    },
    async refreshCollegeData() {
      try {
        const { data: response } = await getCollege({
          disablePagination: 1,
        })
        this.collegeData = response.data.rows
        this.$message.success('获取学院信息成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取学院信息失败，请重试！')
        }
      }
    },
    async refreshData() {
      this.loading = true
      await this.refreshProfessionData()
      this.loading = false
    },
    async addBtnClick() {
      this.addProfessionDiag.visible = true
      // const h = this.$createElement
      // try {
      //   await this.$msgbox({
      //     title: '添加专业',
      //     message: h(
      //       'el-form',
      //       {
      //         props: {
      //           $ref: 'add-profession-form',
      //           labelWidth: '80px',
      //         },
      //         model: 'addProfessionForm',
      //       },
      //       [
      //         h(
      //           'el-form-item',
      //           {
      //             props: {
      //               label: '专业名称',
      //             },
      //           },
      //           [
      //             h('el-input', {
      //               props: {
      //                 placeholder: '请输入专业名称',
      //                 clearable: true,
      //               },
      //               value: this.addProfessionForm.name,
      //               // domProps: {
      //               //   value: this.addProfessionForm.name,
      //               // },
      //               // on: {
      //               //   input: val => {
      //               //     this.addProfessionForm.name = val
      //               //     this.$emit()
      //               //     debugger
      //               //     // return val
      //               //   },
      //               // },
      //             }),
      //           ]
      //         ),
      //       ]
      //     ),
      //     beforeClose: async (action, instance, done) => {
      //       if (action !== 'confirm') {
      //         done()
      //         return
      //       }
      //       const loading = this.$loading()
      //       try {
      //         const value = instance.inputValue
      //         await postProfessions({ name: value })
      //         this.$message.success('添加职称信息成功！')
      //         done()
      //         await this.refreshTitleData()
      //       } catch (err) {
      //         if (err.data && err.data.errorMessage) {
      //           this.$message.error(err.data.errorMessage)
      //         } else {
      //           this.$message.error('添加职称信息失败，请重试！')
      //         }
      //       }
      //       loading.close()
      //     },
      //   })
      // } catch (err) {
      //   this.$message.warning('取消添加专业')
      // }
    },
    async addProfessionDiagClosed() {
      this.$refs.addProfessionForm.resetFields()
    },
    async addProfessionDiagComfirm() {
      this.$refs.addProfessionForm.validate(async valid => {
        if (!valid) {
          return
        }
        this.addProfessionDiag.loading = true
        try {
          const name = this.addProfessionDiag.form.name
          const collegeId = this.addProfessionDiag.form.collegeId
          await postProfessions({
            name,
            collegeId,
          })
          this.addProfessionDiag.visible = false
          await this.refreshProfessionData()
          this.$message.success('添加专业成功！')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('添加职称信息失败，请重试！')
          }
        }
        this.addProfessionDiag.loading = false
      })
    },
    async deleteBtnClick(row) {
      try {
        await this.$confirm(`确认删除专业：${row.name}？`, '确认删除', {
          type: 'warning',
        })
        this.loading = true
        try {
          await deleteProfessions({
            id: row.id,
          })
          this.$message.success('删除专业成功！')
          await this.refreshProfessionData()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('删除专业失败，请重试！')
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
