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
          <!-- 年级： -->
          <div class="ipt-box">
            <el-input type="text" size="small" v-model="filterForm.grade">
              <template slot="prefix">年级</template>
            </el-input>
          </div>
        </div>
        <el-button type="primary" size="small" @click="refreshData">查找</el-button>
        <el-button type="success" size="small" @click="addStudentBtnClick">添加学生</el-button>
      </el-header>
      <el-main>
        <el-table style="max-width: 100%" size="small" :data="studentLists">
          <el-table-column fixed prop="number" label="学号"/>
          <el-table-column prop="name" label="姓名"/>
          <el-table-column prop="sex" label="性别">
            <template slot-scope="scope">
              <template v-if="scope.row.sex === 0">男</template>
              <template v-else-if="scope.row.sex === 1">女</template>
            </template>
          </el-table-column>
          <el-table-column prop="birthday" label="生日"/>
          <el-table-column prop="grade" label="年级"/>
          <el-table-column prop="profession.name" label="专业"/>
          <el-table-column prop="profession.college.name" label="学院"/>
          <el-table-column fixed="right" label="操作" width="180">
            <template slot-scope="scope">
              <el-button type="warning" size="small" @click="resetPassword(scope.row)">重置密码</el-button>
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
    <!-- 添加学生对话框开始 -->
    <el-dialog title="添加学生" width="60px;" :visible.sync="addStudentDiagVisible">
      <div class="add-student-form-box">
        <el-form
          ref="addStudentForm"
          label-width="80px"
          :model="addStudentForm"
          :rules="addStudentFormRules"
        >
          <el-form-item label="学号" prop="number">
            <el-input size="small" v-model="addStudentForm.number"/>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              type="password"
              size="small"
              v-model="addStudentForm.password"
              :show-password="true"
            />
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input size="small" v-model="addStudentForm.name"/>
          </el-form-item>
          <el-form-item label="性别" prop="sex">
            <el-select
              size="small"
              placeholder="请选择"
              style="width: 100%"
              v-model="addStudentForm.sex"
            >
              <el-option label="男" value="0"></el-option>
              <el-option label="女" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              type="date"
              size="small"
              style="width: 100%"
              placeholder="请选择生日"
              v-model="addStudentForm.birthday"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="年级" prop="grade">
            <el-input type="number" size="small" v-model="addStudentForm.grade"/>
          </el-form-item>
          <el-form-item label="专业" prop="professionId">
            <el-select
              size="small"
              placeholder="请选择"
              style="width: 100%"
              filterable
              v-model="addStudentForm.professionId"
            >
              <el-option
                v-for="(item, index) in baseData.professions"
                :key="index"
                :label="`${item.name} - ${item.college.name}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addStudentCloseClick">取 消</el-button>
        <el-button type="primary" @click="addStudentConfirmClick">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加学生对话框结束 -->
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import {
  getAllStudents,
  postStudent,
  putAllUsersPassword,
} from '@/api/allUsers'
import { getProfessions } from '@/api/baseData'

export default {
  name: 'AllStudentManage',
  filters: {
    parseTime,
  },
  data() {
    return {
      loading: false,
      baseData: {
        professions: [],
      },
      filterBaseItemOptions: [
        {
          value: 'number',
          label: '学号',
        },
        {
          value: 'name',
          label: '姓名',
        },
      ],
      filterForm: {
        baseOption: 'number',
        baseValue: '',
        grade: '',
      },
      studentLists: [],
      paginationData: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      addStudentDiagVisible: false,
      addStudentForm: {
        number: '',
        password: '',
        name: '',
        sex: '',
        birthday: null,
        grade: '',
        professionId: '',
      },
      addStudentFormRules: {
        number: [
          {
            required: true,
            message: '请填写学号',
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
        birthday: [
          {
            required: true,
            message: '请选择生日',
            trigger: 'blur',
          },
        ],
        grade: [
          {
            required: true,
            message: '请填写年级',
            trigger: 'blur',
          },
        ],
        professionId: [
          {
            required: true,
            // message: '请选择专业',
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请选择专业'))
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
    getAllStudentsParams() {
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
      if (filterForm.grade) {
        where.grade = filterForm.grade
      }

      params.where = JSON.stringify(where)
      return params
    },
  },
  async mounted() {
    this.loading = true
    await Promise.all([this.refreshStudentLists(), this.getProfessions()])
    this.loading = false
  },
  methods: {
    async refreshStudentLists() {
      try {
        const { data: response } = await getAllStudents(
          this.getAllStudentsParams
        )
        const data = response.data
        this.studentLists = data.rows
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
      await this.refreshStudentLists()
      this.loading = false
    },
    addStudentBtnClick() {
      this.addStudentDiagVisible = true
    },
    addStudentCloseClick() {
      this.addStudentDiagVisible = false
      this.$refs.addStudentForm.resetFields()
    },
    addStudentConfirmClick() {
      this.$refs.addStudentForm.validate(async valid => {
        if (!valid) {
          return
        }
        try {
          this.loading = true
          const addStudentForm = this.addStudentForm

          const userValue = {
            username: addStudentForm.number,
            password: addStudentForm.password,
          }
          const studentValue = {
            number: addStudentForm.number,
            name: addStudentForm.name,
            sex: addStudentForm.sex,
            birthday: addStudentForm.birthday,
            professionId: addStudentForm.professionId,
            grade: addStudentForm.grade,
          }

          await postStudent({
            userValue: JSON.stringify(userValue),
            studentValue: JSON.stringify(studentValue),
          })

          this.loading = false
          this.$message.success('添加学生成功！')

          this.addStudentDiagVisible = false
          this.refreshData()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(
              err.data.errorMessage || '添加学生失败，请重试！'
            )
          } else {
            this.$message.error('添加学生失败，请重试！')
          }
        }
      })
    },
    async getProfessions() {
      try {
        const { data: response } = await getProfessions()
        this.baseData.professions = response.data.rows
      } catch (err) {
        this.$message.error('获取专业数据失败，请重试！')
      }
    },
    async resetPassword(row) {
      try {
        await this.$confirm(
          `确认将学生：${row.name}的密码重置为：123456？`,
          '重置提示'
        )
        this.loading = true
        try {
          await putAllUsersPassword({
            userId: row.userId,
            newPassword: '123456',
          })
          this.$message.success('重置密码成功！')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('重置密码失败，请重试！')
          }
        }
        this.loading = false
      } catch (err) {}
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

.add-student-form-box {
  max-width: 400px;
  margin-right: 10px;
}
</style>
