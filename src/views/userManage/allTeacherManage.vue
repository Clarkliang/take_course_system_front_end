<template>
  <div class="box">
    <el-container v-loading="loading">
      <el-header height="auto">
        <div class="filter-item">
          <el-select size="small" width="50" v-model="filterForm.baseOption" placeholder="请选择">
            <el-option
              v-for="(item, index) in filterBaseItemOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div class="ipt-box">
            <el-input size="small" v-model="filterForm.baseValue"/>
          </div>
        </div>
        <div class="filter-item">
          <div class="ipt-box">
            <el-select size="small" width="100" v-model="filterForm.titleId">
              <el-option label value></el-option>
              <el-option label="助教" value="a9dd6faa-747a-11e9-955c-0242ac110002"></el-option>
              <el-option label="讲师" value="b88cc16b-747a-11e9-955c-0242ac110002"></el-option>
              <el-option label="副教授" value="c058f174-747a-11e9-955c-0242ac110002"></el-option>
              <el-option label="教授" value="c938d759-747a-11e9-955c-0242ac110002"></el-option>
            </el-select>
          </div>
        </div>
        <el-button type="primary" size="small" @click="refreshData">查找</el-button>
        <el-button type="success" size="small" @click="addStudentBtnClick">添加老师</el-button>
      </el-header>
      <el-main>
        <el-table style="max-width: 100%" size="small" :data="teacherLists">
          <el-table-column fixed prop="number" label="工号"/>
          <el-table-column prop="name" label="姓名"/>
          <el-table-column prop="sex" label="性别">
            <template slot-scope="scope">
              <template v-if="scope.row.sex === 0">男</template>
              <template v-else-if="scope.row.sex === 1">女</template>
            </template>
          </el-table-column>
          <el-table-column prop="title.name" label="职称"/>
          <el-table-column fixed="right" label="操作" width="180">
            <template>
              <el-button type="warning" size="small">重置密码</el-button>
            </template>
          </el-table-column>
        </el-table>
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
    <!-- 添加老师对话框开始 -->
    <el-dialog title="添加老师" width="60px;" :visible.sync="addTeacherDiagVisible" v-loading="addTeacherDiagLoading">
      <div class="add-teacher-form-box">
        <el-form
          ref="addTeacherForm"
          label-width="80px"
          :model="addTeacherForm"
          :rules="addTeacherFormRules"
        >
          <el-form-item label="工号" prop="number">
            <el-input size="small" v-model="addTeacherForm.number"/>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              type="password"
              size="small"
              v-model="addTeacherForm.password"
              :show-password="true"
            />
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input size="small" v-model="addTeacherForm.name"/>
          </el-form-item>
          <el-form-item label="性别" prop="sex">
            <el-select
              size="small"
              placeholder="请选择"
              style="width: 100%"
              v-model="addTeacherForm.sex"
            >
              <el-option label="男" value="0"></el-option>
              <el-option label="女" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="职称" prop="titleId">
            <el-select
              size="small"
              placeholder="请选择"
              style="width: 100%"
              v-model="addTeacherForm.titleId"
            >
              <el-option label="助教" value="a9dd6faa-747a-11e9-955c-0242ac110002"/>
              <el-option label="讲师" value="b88cc16b-747a-11e9-955c-0242ac110002"/>
              <el-option label="副教授" value="c058f174-747a-11e9-955c-0242ac110002"/>
              <el-option label="教授" value="c938d759-747a-11e9-955c-0242ac110002"/>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addStudentCloseClick">取 消</el-button>
        <el-button type="primary" @click="addStudentConfirmClick">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加老师对话框结束 -->
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import { getAllTeachers, postTeacher, allUsersPassword } from '@/api/allUsers'
import { getProfessions } from '@/api/baseData'
import { Promise } from 'q'

export default {
  name: 'AllTeacherManage',
  filters: {
    parseTime,
  },
  data() {
    return {
      loading: false,
      addTeacherDiagLoading: false,
      baseData: {
        // professions: [],
      },
      filterBaseItemOptions: [
        {
          value: 'number',
          label: '工号',
        },
        {
          value: 'name',
          label: '姓名',
        },
      ],
      filterForm: {
        baseOption: 'number',
        baseValue: '',
        titleId: '',
      },
      teacherLists: [],
      paginationData: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      addTeacherDiagVisible: false,
      addTeacherForm: {
        number: '',
        password: '',
        name: '',
        sex: '',
        titleId: '',
      },
      addTeacherFormRules: {
        number: [
          {
            required: true,
            message: '请填写工号',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: '请填写密码',
            trigger: 'blur',
          },
        ],
        name: [
          {
            required: true,
            message: '请填写姓名',
            trigger: 'blur',
          },
        ],
        sex: [
          {
            required: true,
            // message: '',
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请选择性别'))
              } else {
                callback()
              }
            },
          },
        ],
        titleId: [
          {
            required: true,
            // message: '请选择职称',
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请选择职称'))
              } else {
                callback()
              }
            },
          },
        ],
      },
    }
  },
  computed: {
    getAllTeachersParams() {
      const filterForm = this.filterForm
      const params = {
        page: this.paginationData.currentPage,
        row: this.paginationData.pageSize,
      }
      const where = {}

      if (filterForm.baseValue) {
        where[filterForm.baseOption] = {
          $like: `%${filterForm.baseValue}%`,
        }
      }
      if (filterForm.titleId) {
        where.titleId = filterForm.titleId
      }

      params.where = JSON.stringify(where)
      return params
    },
  },
  async mounted() {
    this.loading = true
    await this.refreshTeacherLists()
    this.loading = false
  },
  methods: {
    async refreshTeacherLists() {
      try {
        const { data: response } = await getAllTeachers(
          this.getAllTeachersParams
        )
        const data = response.data
        this.teacherLists = data.rows
        this.paginationData.total = data.count
        this.$message.success('刷新数据成功！')
      } catch (err) {
        if (!err.data) {
          this.$message.error('刷新数据失败，请重试！')
          return
        }
        const data = err.data
        this.$message.error(data.errorMessage || '刷新数据失败，请重试！')
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
    async refreshData() {
      this.loading = true
      await this.refreshTeacherLists()
      this.loading = false
    },
    addStudentBtnClick() {
      this.addTeacherDiagVisible = true
    },
    addStudentCloseClick() {
      this.addTeacherDiagVisible = false
      this.$refs.addTeacherForm.resetFields()
    },
    addStudentConfirmClick() {
      this.$refs.addTeacherForm.validate(async valid => {
        if (!valid) {
          return
        }
        try {
          this.addTeacherDiagLoading = true
          const addTeacherForm = this.addTeacherForm

          const userValue = {
            username: addTeacherForm.number,
            password: addTeacherForm.password,
          }
          const teacherValue = {
            number: addTeacherForm.number,
            name: addTeacherForm.name,
            sex: addTeacherForm.sex,
            titleId: addTeacherForm.titleId,
          }

          await postTeacher({
            userValue: JSON.stringify(userValue),
            teacherValue: JSON.stringify(teacherValue),
          })

          this.addTeacherDiagLoading = false
          this.$message.success('添加老师成功！')

          this.addTeacherDiagVisible = false
          this.refreshData()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(
              err.data.errorMessage || '添加老师失败，请重试！'
            )
          } else {
            this.$message.error('添加老师失败，请重试！')
          }
        }
      })
    },
  },
}
</script>

<style>
.el-input.el-input--small span.el-input__prefix {
  line-height: 32px;
}

.el-footer > .el-pagination {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
</style>

<style scoped>
.box {
  margin-top: 20px;
}

.box .filter-item {
  display: inline-block;
}

.box .filter-item .ipt-box {
  max-width: 200px;
  display: inline-block;
}

.add-teacher-form-box {
  max-width: 400px;
  margin-right: 10px;
}
</style>
