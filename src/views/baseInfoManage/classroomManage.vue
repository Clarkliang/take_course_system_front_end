<template>
  <div class="box" v-loading="loading">
    <!-- 显示教学楼开始 -->
    <el-container v-if="step === 1" :key="1">
      <el-header height="auto">
        <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshStep1Data">刷新</el-button>
      </el-header>
      <el-main>
        <el-table size="small" :data="teachingBuildingData">
          <el-table-column prop="name" label="名称"/>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="enterTeachingBuilding(scope)">管理课室</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
    <!-- 显示教学楼结束 -->
    <!-- 课室管理开始 -->
    <el-container v-else-if="step === 2" :key="2">
      <el-header height="auto">
        <el-form :inline="true">
          <el-form-item>
            <el-button size="small" icon="el-icon-arrow-left" @click="backToStep1BtnClick">返回</el-button>
          </el-form-item>
          <el-form-item label="课室号">
            <el-input v-model="classroomFilterForm.number" size="small"/>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="searchClassroomBtnClick"
            >查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="success" size="small" @click="addClassroomBtnClick">添加</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-main>
        <el-table size="small" :data="classroomData">
          <el-table-column prop="number" label="课室号"/>
          <el-table-column label="座位数">
            <template slot-scope="scope">{{ scope.row.seatCount }}</template>
          </el-table-column>
          <el-table-column prop="isMultimedia" label="多媒体">
            <template slot-scope="scope">
              <el-switch readonly :value="!!scope.row.isMultimedia"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="warning" size="mini" @click="updateClassroomClick(scope)">修改</el-button>
              <el-button type="danger" size="mini" @click="deleteClassroomClick(scope)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer>
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="classroomPagination.currentPage"
          :page-size="classroomPagination.pageSize"
          :total="classroomPagination.total"
          @size-change="classroomHandleSizeChange"
          @current-change="classroomHandleCurrentChange"
        ></el-pagination>
      </el-footer>
    </el-container>
    <!-- 课室管理结束 -->
    <!-- 添加课室对话框开始 -->
    <el-dialog
      title="添加课室"
      :visible.sync="addClassroomDiag.visible"
      v-loading="addClassroomDiag.loading"
      @closed="addClassroomDiagClosed"
    >
      <div class="diag-form-box">
        <el-form
          ref="addClassroomForm"
          label-width="80px"
          :model="addClassroomDiag.form"
          :rules="addClassroomDiag.rules"
        >
          <el-form-item label="课室号" prop="number">
            <el-input v-model="addClassroomDiag.form.number"></el-input>
          </el-form-item>
          <el-form-item label="座位数" prop="seatCount">
            <el-input-number v-model="addClassroomDiag.form.seatCount" :min="0" style="width: 100%"></el-input-number>
          </el-form-item>
          <el-form-item label="多媒体" prop="isMultimedia">
            <el-switch v-model="addClassroomDiag.form.isMultimedia"></el-switch>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addClassroomDiag.visible = false">取 消</el-button>
        <el-button type="primary" @click="addClassroomDiagConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加课室对话框结束 -->
    <!-- 修改课室对话框开始 -->
    <el-dialog
      title="修改课室信息"
      :visible.sync="updateClassroomDiag.visible"
      v-loading="updateClassroomDiag.loading"
      @closed="updateClassroomDiagClosed"
    >
      <div class="diag-form-box">
        <el-form
          ref="updateClassroomForm"
          label-width="80px"
          :model="updateClassroomDiag.form"
          :rules="updateClassroomDiag.rules"
        >
          <el-form-item label="课室号" prop="number">
            <el-input v-model="updateClassroomDiag.form.number"></el-input>
          </el-form-item>
          <el-form-item label="座位数" prop="seatCount">
            <el-input-number
              v-model="updateClassroomDiag.form.seatCount"
              :min="0"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="多媒体" prop="isMultimedia">
            <el-switch v-model="updateClassroomDiag.form.isMultimedia"></el-switch>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateClassroomDiag.visible = false">取 消</el-button>
        <el-button type="primary" @click="updateClassroomDiagConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改课室对话框结束 -->
  </div>
</template>

<script>
import {
  getAllTeachingBuildings,
  getAllClassrooms,
  postClassroom,
  putClassroom,
  deleteClassroom,
} from '@/api/baseData'

export default {
  name: 'ClassroomManage',
  data() {
    return {
      loading: false,
      step: 1,
      teachingBuildingData: [],
      nowTeachingBuildingIndex: -1,
      classroomFilterForm: {
        number: '',
      },
      classroomData: [],
      classroomPagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      addClassroomDiag: {
        visible: false,
        loading: false,
        form: {
          number: '',
          seatCount: 50,
          isMultimedia: true,
        },
        rules: {
          number: [
            {
              required: true,
              message: '请填写课室号',
              trigger: 'blur',
            },
          ],
          seatCount: [
            {
              required: true,
              message: '请填写座位数',
              trigger: 'blur',
            },
          ],
          isMultimedia: [
            {
              required: true,
              message: '请选择该课室是否有多媒体设备',
              trigger: 'blur',
            },
          ],
        },
      },
      updateClassroomDiag: {
        visible: false,
        loading: false,
        form: {
          number: '',
          seatCount: 50,
          isMultimedia: true,
        },
        rules: {
          number: [
            {
              required: true,
              message: '请填写课室号',
              trigger: 'blur',
            },
          ],
          seatCount: [
            {
              required: true,
              message: '请填写座位数',
              trigger: 'blur',
            },
          ],
          isMultimedia: [
            {
              required: true,
              message: '请选择该课室是否有多媒体设备',
              trigger: 'blur',
            },
          ],
        },
      },
      nowClassroomIndex: -1,
    }
  },
  async mounted() {
    await this.refreshStep1Data()
  },
  methods: {
    async refreshTeachingBuildingData() {
      try {
        const { data: response } = await getAllTeachingBuildings({
          disablePagination: 1,
        })
        this.teachingBuildingData = response.data.rows
        this.$message.success('获取数据成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取数据失败，请重试！')
        }
      }
    },
    async refreshStep1Data() {
      this.loading = true
      await this.refreshTeachingBuildingData()
      this.loading = false
    },
    async enterTeachingBuilding(scope) {
      this.nowTeachingBuildingIndex = scope.$index
      await this.refreshStep2Data()
      this.step = 2
    },
    backToStep1BtnClick() {
      this.step = 1
    },
    async refreshClassroomData() {
      try {
        const { data: response } = await getAllClassrooms({
          page: this.classroomPagination.currentPage,
          row: this.classroomPagination.pageSize,
          where: JSON.stringify({
            number: this.classroomFilterForm.number
              ? this.classroomFilterForm.number
              : undefined,
            teachingBuildingId: this.teachingBuildingData[
              this.nowTeachingBuildingIndex
            ].id,
          }),
          order: JSON.stringify([['number', 'ASC']]),
        })
        this.classroomData = response.data.rows
        this.classroomPagination.total = response.data.count
        this.$message.success('获取课室数据成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取课室数据失败，请重试！')
        }
      }
    },
    async refreshStep2Data() {
      this.loading = true
      await this.refreshClassroomData()
      this.loading = false
    },
    async searchClassroomBtnClick() {
      await this.refreshStep2Data()
    },
    async classroomHandleSizeChange(val) {
      this.classroomPagination.pageSize = val
      this.classroomPagination.currentPage = 1
      await this.refreshStep2Data()
    },
    async classroomHandleCurrentChange(val) {
      this.classroomPagination.currentPage = val
      await this.refreshStep2Data()
    },
    addClassroomBtnClick() {
      this.addClassroomDiag.visible = true
    },
    addClassroomDiagClosed() {
      this.$refs.addClassroomForm.resetFields()
      this.addClassroomDiag.form.seatCount = 50
      this.addClassroomDiag.form.isMultimedia = true
    },
    addClassroomDiagConfirm() {
      this.$refs.addClassroomForm.validate(async valid => {
        if (!valid) {
          return
        }
        this.addClassroomDiag.loading = true
        try {
          const form = this.addClassroomDiag.form
          const number = form.number
          const seatCount = form.seatCount
          const isMultimedia = Number(form.isMultimedia)
          const teachingBuildingId = this.teachingBuildingData[
            this.nowTeachingBuildingIndex
          ].id
          await postClassroom({
            number,
            seatCount,
            isMultimedia,
            teachingBuildingId,
          })
          this.addClassroomDiag.loading = false
          await this.refreshStep2Data()
          this.$message.success('添加课室成功！')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('添加课室失败，请重试！')
          }
        }
        this.addClassroomDiag.visible = false
      })
    },
    updateClassroomClick(scope) {
      this.nowClassroomIndex = scope.$index
      const row = scope.row
      const form = this.updateClassroomDiag.form
      form.number = row.number
      form.seatCount = row.seatCount
      form.isMultimedia = Boolean(row.isMultimedia)
      this.updateClassroomDiag.visible = true
    },
    updateClassroomDiagClosed() {
      this.$refs.updateClassroomForm.resetFields()
    },
    updateClassroomDiagConfirm() {
      this.$refs.updateClassroomForm.validate(async valid => {
        if (!valid) {
          return
        }
        this.updateClassroomDiag.loading = true
        try {
          const id = this.classroomData[this.nowClassroomIndex].id
          const form = this.updateClassroomDiag.form
          const value = JSON.stringify({
            number: form.number,
            seatCount: form.seatCount,
            isMultimedia: Number(form.isMultimedia),
          })

          await putClassroom({
            id,
            value,
          })
          this.updateClassroomDiag.loading = false
          await this.refreshStep2Data()
          this.$message.success('修改课室成功！')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('修改课室失败，请重试！')
          }
        }
        this.updateClassroomDiag.visible = false
      })
    },
    async deleteClassroomClick(scope) {
      const row = scope.row
      try {
        await this.$confirm(`确认删除课室：${this.teachingBuildingData[this.nowTeachingBuildingIndex].name}${row.number}？`, '确认删除', {
          type: 'warning',
        })
        this.loading = true
        try {
          await deleteClassroom({
            id: row.id,
          })
          this.$message.success('删除课室成功！')
          await this.refreshEventData()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('删除课室失败，请重试！')
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

.box > .el-container {
  animation: step-container-enter 0.2s ease-in;
}

@keyframes step-container-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.box .diag-form-box {
  max-width: 300px;
}

.box .el-pagination {
  display: flex;
  justify-content: center;
}
</style>
