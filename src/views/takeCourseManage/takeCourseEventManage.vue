<template>
  <div class="box" v-loading="loading">
    <!-- 第一步开始 -->
    <el-container v-if="step === 1" :key="1">
      <el-header height="auto">
        <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        <el-button type="success" size="small" @click="addBtnClick">添加</el-button>
      </el-header>
      <el-main>
        <!-- 选课场次列表开始 -->
        <el-table size="small" :data="eventData">
          <el-table-column prop="name" label="名称"/>
          <el-table-column prop="term" label="学期">
            <template slot-scope="scope">
              <template
                v-if="scope.row.term && scope.row.term.schoolYear"
              >{{ `${scope.row.term.schoolYear.startYear}-${scope.row.term.schoolYear.endYear}学年第${scope.row.term.number}学期` }}</template>
              <template v-else>{{ `第${scope.row.term.number}学期` }}</template>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间">
            <template slot-scope="scope">{{ scope.row.startTime | parseTime }}</template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间">
            <template slot-scope="scope">{{ scope.row.endTime | parseTime }}</template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="small" @click="arrangeBtnClick(scope)">安排课程</el-button>
              <el-button type="danger" size="small" @click="deleteBtnClick(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 选课场次列表结束 -->
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
    <!-- 第一步结束 -->
    <!-- 第二步开始 -->
    <el-container v-else-if="step === 2" :key="2">
      <el-header height="auto">
        <el-form :inline="true" class="header-filter-form-inline">
          <el-form-item>
            <el-button size="small" icon="el-icon-arrow-left" @click="step2BackBtnClick">返回</el-button>
          </el-form-item>
          <el-form-item label="课程名">
            <el-input size="small" v-model="courseFilterForm.name"/>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-refresh"
              @click="step2RefreshData"
            >刷新</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-main>
        <!-- 课程列表开始 -->
        <el-table size="small" :data="courseData">
          <el-table-column prop="name" label="名称"/>
          <el-table-column prop="credit" label="学分"/>
          <el-table-column prop="action" label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="small" @click="checkArrangeBtnClick(scope)">管理安排</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 课程列表结束 -->
      </el-main>
      <el-footer>
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="step2PaginationData.currentPage"
          :page-size="10"
          :total="step2PaginationData.total"
          @size-change="step2HandleSizeChange"
          @current-change="step2HandleCurrentChange"
        />
      </el-footer>
    </el-container>
    <!-- 第二步结束 -->
    <!-- 添加选课场次对话框开始 -->
    <el-dialog
      title="添加选课场次"
      :visible.sync="addEventDiag.visible"
      v-loading="addEventDiag.loading"
      @closed="addEventDiagClosed"
    >
      <div class="diag-form-box">
        <el-form
          ref="addEventForm"
          label-width="80px"
          :model="addEventDiag.form"
          :rules="addEventDiag.rules"
        >
          <el-form-item label="场次名称" prop="name">
            <el-input v-model="addEventDiag.form.name"></el-input>
          </el-form-item>
          <el-form-item label="学期" prop="termId">
            <el-select v-model="addEventDiag.form.termId" filterable placeholder="请选择学期">
              <el-option
                v-for="(item, index) in formatedTermData"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="时间" prop="time">
            <el-date-picker
              v-model="addEventDiag.form.time"
              type="datetimerange"
              range-separator="至"
              start-placeholder="选课开始时间"
              end-placeholder="选课结束时间"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addEventDiag.visible = false">取 消</el-button>
        <el-button type="primary" @click="addEventDiagComfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加选课场次对话框结束 -->
    <!-- 课程安排对话框开始 -->
    <el-dialog
      v-if="nowEventIndex !== null && nowCourseIndex !== null && eventData[nowEventIndex] && courseData[nowCourseIndex]"
      :title="`${eventData[nowEventIndex].name} - ${courseData[nowCourseIndex].name} - 课程安排`"
      width="80%"
      :visible.sync="arrangeDiag.visible"
      v-loading="arrangeDiag.loading"
    >
      <!-- 安排列表开始 -->
      <el-table size="small" :data="arrangeData">
        <el-table-column prop="teacher.number" label="工号"/>
        <el-table-column prop="teacher.name" label="教师"/>
        <el-table-column prop="time" label="上课时间">
          <template
            slot-scope="scope"
          >{{ `星期${weekdayMap[scope.row.weekday]} 第${numberMap[scope.row.courseTime.number]}大节(${scope.row.courseTime.startTime}-${scope.row.courseTime.endTime})` }}</template>
        </el-table-column>
        <el-table-column prop="maxCount" label="容量"/>
        <el-table-column prop="freeCount" label="余量"/>
        <el-table-column prop="action" label="操作">
          <template slot-scope="scope">
            <el-button type="warning" size="small" @click="updateArrangeBtnClick(scope)">修改</el-button>
            <el-button
              v-if="scope.row.recordCount === 0"
              type="danger"
              size="small"
              @click="deleteArrange(scope)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 安排列表结束 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="addArrangeDiag.visible = true">添 加</el-button>
        <!-- <el-button @click="arrangeDiag.visible = false">取 消</el-button> -->
        <el-button type="primary" @click="arrangeDiagComfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 课程安排对话框结束 -->
    <!-- 添加安排对话框开始 -->
    <el-dialog
      v-if="nowEventIndex !== null && nowCourseIndex !== null && eventData[nowEventIndex] && courseData[nowCourseIndex]"
      :title="`${eventData[nowEventIndex].name} - ${courseData[nowCourseIndex].name} - 添加课程安排`"
      :visible.sync="addArrangeDiag.visible"
      v-loading="addArrangeDiag.loading"
      @closed="addArrangeDiagClosed"
    >
      <div class="diag-form-box">
        <el-form
          ref="addArrangeForm"
          label-width="80px"
          :model="addArrangeDiag.form"
          :rules="addArrangeDiag.rules"
        >
          <el-form-item label="教师" prop="teacherId">
            <el-select
              v-model="addArrangeDiag.form.teacherId"
              style="width: 100%"
              filterable
              placeholder="请选择授课教师"
            >
              <el-option
                v-for="(item, index) in teacherData"
                :key="index"
                :label="`${item.name} (${item.number})`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="容量含上限" prop="limitCount">
            <el-switch v-model="addArrangeDiag.form.limitCount"></el-switch>
          </el-form-item>-->
          <el-form-item v-if="addArrangeDiag.form.limitCount" label="容量" prop="maxCount">
            <el-input-number
              v-model="addArrangeDiag.form.maxCount"
              size="small"
              :precision="0"
              :min="1"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="星期" prop="weekday">
            <el-select
              v-model="addArrangeDiag.form.weekday"
              style="width: 100%"
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in weekdayMap"
                :key="index"
                :label="`星期${item}`"
                :value="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="时间" prop="courseTimeId">
            <el-select
              v-model="addArrangeDiag.form.courseTimeId"
              style="width: 100%"
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in courseTimeData"
                :key="index"
                :label="`第${numberMap[index + 1]}大节 (${item.startTime}-${item.endTime})`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addArrangeDiag.visible = false">取 消</el-button>
        <el-button type="primary" @click="addArrangeDiagConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加安排对话框结束 -->
    <!-- 修改安排对话框开始 -->
    <el-dialog
      v-if="nowArrangeIndex !== null && arrangeData[nowArrangeIndex]"
      title="修改课程安排"
      :visible.sync="updateArrangeDiag.visible"
      v-loading="updateArrangeDiag.loading"
      @closed="updateArrangeDiagClosed"
    >
      <div class="diag-form-box">
        <el-form
          ref="updateArrangeForm"
          label-width="80px"
          :model="updateArrangeDiag.form"
          :rules="updateArrangeDiag.rules"
        >
          <el-form-item label="容量" prop="maxCount">
            <el-input-number
              v-model="updateArrangeDiag.form.maxCount"
              size="small"
              :precision="0"
              :min="updateArrangeDiag.form.maxCountMin"
            ></el-input-number>
          </el-form-item>
          <!-- <el-form-item label="星期" prop="weekday">
            <el-select
              v-model="updateArrangeDiag.form.weekday"
              style="width: 100%"
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in weekdayMap"
                :key="index"
                :label="`星期${item}`"
                :value="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="时间" prop="courseTimeId">
            <el-select
              v-model="updateArrangeDiag.form.courseTimeId"
              style="width: 100%"
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in courseTimeData"
                :key="index"
                :label="`第${numberMap[index + 1]}大节 (${item.startTime}-${item.endTime})`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>-->
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateArrangeDiag.visible = false">取 消</el-button>
        <el-button type="primary" @click="updateArrangeDiagConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改安排对话框结束 -->
  </div>
</template>

<script>
import {
  getAllTakeCourseEvents,
  postTakeCourseEvent,
  putTakeCourseEvent,
  deleteTakeCourseEvent,
  getAllCourses,
  getAllTakeCourseArrangements,
  postTakeCourseArrangement,
  putTakeCourseArrangement,
  deleteTakeCourseArrangement,
} from '@/api/course'
import { getAllTerms } from '@/api/baseData'
import { getAllTeachers } from '@/api/allUsers'
import { parseTime } from '@/utils'
import { Promise } from 'q'

export default {
  name: 'takeCourseEventManage',
  filters: {
    parseTime,
  },
  data() {
    return {
      step: 1,
      loading: false,
      eventData: [],
      termData: [],
      courseData: [],
      nowEventIndex: null,
      addEventDiag: {
        visible: false,
        loading: false,
        form: {
          name: '',
          termId: '',
          time: [],
        },
        rules: {
          name: [
            {
              required: true,
              message: '请填写选课场次名',
              trigger: 'blur',
            },
          ],
          termId: [
            {
              required: true,
              message: '请选择学期',
              trigger: 'blur',
            },
          ],
          time: [
            {
              required: true,
              message: '请选择选课时间',
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
      courseFilterForm: {
        name: '',
      },
      step2PaginationData: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      nowCourseIndex: null,
      arrangeDiag: {
        visible: false,
        loading: false,
      },
      arrangeData: [],
      courseTimeData: [
        {
          id: '8659f2d5-8e75-11e9-955c-0242ac110002',
          startTime: '08:30:00',
          endTime: '10:05:00',
        },
        {
          id: '9ec2b376-8e75-11e9-955c-0242ac110002',
          startTime: '10:25:00',
          endTime: '12:00:00',
        },
        {
          id: 'ae3bf4a8-8e75-11e9-955c-0242ac110002',
          startTime: '13:50:00',
          endTime: '15:25:00',
        },
        {
          id: 'c57f7469-8e75-11e9-955c-0242ac110002',
          startTime: '15:45:00',
          endTime: '17:20:00',
        },
        {
          id: 'dd4dcc2d-8e75-11e9-955c-0242ac110002',
          startTime: '18:20:00',
          endTime: '20:45:00',
        },
      ],
      weekdayMap: {
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
        7: '天',
      },
      numberMap: {
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
        7: '七',
      },
      addArrangeDiag: {
        visible: false,
        loading: false,
        form: {
          teacherId: '',
          maxCount: '',
          weekday: '',
          courseTimeId: '',
          limitCount: true,
        },
        rules: {
          teacherId: [
            {
              required: true,
              message: '请选择授课教师',
              trigger: 'blur',
            },
          ],
          maxCount: [
            {
              required: true,
              message: '请填写容量',
              trigger: 'blur',
              // validator: (rule, value, callback) => {
              //   const limitCount = this.addArrangeDiag.form.limitCount
              //   if (limitCount) {
              //     if (value <= 0) {
              //       callback(new Error('容量必须大于0'))
              //     }
              //   } else {
              //     callback()
              //   }
              // },
            },
          ],
          weekday: [
            {
              required: true,
              message: '请选择星期',
              trigger: 'blur',
            },
          ],
          courseTimeId: [
            {
              required: true,
              message: '请选择时间',
              trigger: 'blur',
            },
          ],
        },
      },
      teacherData: [],
      nowArrangeIndex: null,
      updateArrangeDiag: {
        loading: false,
        visible: false,
        form: {
          maxCount: '',
          weekday: '',
          courseTimeId: '',
          maxCountMin: 1,
        },
        rules: {
          maxCount: [
            {
              required: true,
              message: '请填写容量',
              trigger: 'blur',
            },
          ],
          weekday: [
            {
              required: true,
              message: '请选择星期',
              trigger: 'blur',
            },
          ],
          courseTimeId: [
            {
              required: true,
              message: '请选择时间',
              trigger: 'blur',
            },
          ],
        },
      },
    }
  },
  computed: {
    getEventParams() {
      return {
        page: this.paginationData.currentPage,
        row: this.paginationData.pageSize,
      }
    },
    getCourseParams() {
      // debugger
      return {
        page: this.step2PaginationData.currentPage,
        row: this.step2PaginationData.pageSize,
        where: JSON.stringify({
          name:
            this.courseFilterForm.name === ''
              ? undefined
              : {
                  $like: `%${this.courseFilterForm.name}%`,
                },
        }),
        order: JSON.stringify([['name', 'ASC']]),
      }
    },
    formatedTermData() {
      return this.termData.reduce((prev, item) => {
        const schoolYear = item.schoolYear
        if (schoolYear) {
          prev.push({
            label: `${schoolYear.startYear}-${schoolYear.endYear}学年第${
              item.number
            }学期`,
            value: item.id,
          })
        } else {
          prev.push({
            label: `第${item.number}学期`,
            value: item.id,
          })
        }
        return prev
      }, [])
    },
  },
  async mounted() {
    this.loading = true
    await Promise.all([this.refreshEventData(), this.refreshTermData()])
    this.loading = false
  },
  methods: {
    async refreshEventData() {
      try {
        const { data: response } = await getAllTakeCourseEvents(
          this.getEventParams
        )
        this.eventData = response.data.rows
        this.paginationData.total = response.data.count
        this.$message.success('获取选课场次数据成功！')
      } catch (err) {
        this.eventData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取选课场次数据失败，请重试！')
        }
      }
    },
    async refreshTermData() {
      try {
        const { data: response } = await getAllTerms({
          disablePagination: 1,
        })
        this.termData = response.data.rows
        this.$message.success('获取学期数据成功！')
      } catch (err) {
        this.termData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取学期数据失败，请重试！')
        }
      }
    },
    async refreshCourseData() {
      try {
        const { data: response } = await getAllCourses(this.getCourseParams)
        this.courseData = response.data.rows
        this.step2PaginationData.total = response.data.count
        this.$message.success('获取课程数据成功！')
      } catch (err) {
        this.courseData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取课程数据失败，请重试！')
        }
      }
    },
    async refreshData() {
      this.loading = true
      await this.refreshEventData()
      this.loading = false
    },
    async addBtnClick() {
      this.addEventDiag.visible = true
    },
    async addEventDiagClosed() {
      this.$refs.addEventForm.resetFields()
    },
    async addEventDiagComfirm() {
      this.$refs.addEventForm.validate(async valid => {
        if (!valid) {
          return
        }
        this.addEventDiag.loading = true
        try {
          const name = this.addEventDiag.form.name
          const termId = this.addEventDiag.form.termId
          const startTime = this.addEventDiag.form.time[0]
          const endTime = this.addEventDiag.form.time[1]
          await postTakeCourseEvent({
            name,
            termId,
            startTime,
            endTime,
          })
          this.addEventDiag.visible = false
          await this.refreshEventData()
          this.$message.success('添加选课场次成功！')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('添加选课场次失败，请重试！')
          }
        }
        this.addEventDiag.loading = false
      })
    },
    async deleteBtnClick(row) {
      try {
        await this.$confirm(`确认删除选课场次：${row.name}？`, '确认删除', {
          type: 'warning',
        })
        this.loading = true
        try {
          await deleteTakeCourseEvent({
            id: row.id,
          })
          this.$message.success('删除选课场次成功！')
          await this.refreshEventData()
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('删除选课场次失败，请重试！')
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
    async arrangeBtnClick(scope) {
      this.courseFilterForm.name = ''
      this.step = 2
      this.nowEventIndex = scope.$index
      this.loading = true
      await Promise.all([this.refreshTeacherData(), this.refreshCourseData()])
      this.loading = false
    },
    async step2RefreshData() {
      this.loading = true
      this.step2PaginationData.currentPage = 1
      this.refreshCourseData()
      this.loading = false
    },
    step2BackBtnClick() {
      this.step = 1
    },
    step2HandleSizeChange(val) {
      this.step2PaginationData.pageSize = val
      this.step2RefreshData()
    },
    step2HandleCurrentChange(val) {
      this.step2PaginationData.currentPage = val
      this.step2RefreshData()
    },
    async checkArrangeBtnClick(scope) {
      this.nowCourseIndex = scope.$index
      this.loading = true
      await this.refreshArrangeData()
      this.loading = false
      this.arrangeDiag.visible = true
    },
    arrangeDiagComfirm() {
      this.arrangeDiag.visible = false
    },
    async refreshArrangeData() {
      try {
        const { data: response } = await getAllTakeCourseArrangements({
          where: {
            eventId: this.eventData[this.nowEventIndex].id,
            courseId: this.courseData[this.nowCourseIndex].id,
          },
        })
        this.arrangeData = response.data.rows
        this.$message.success('获取课程安排数据成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取课程安排数据失败，请重试！')
        }
      }
    },
    addEventDiagClosed() {
      this.$refs.addArrangeForm.resetFields()
    },
    async refreshTeacherData() {
      try {
        const { data: response } = await getAllTeachers({
          disablePagination: 1,
        })
        this.teacherData = response.data.rows
        this.$message.success('获取教师数据成功！')
      } catch (err) {
        this.teacherData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取教师数据失败，请重试！')
        }
      }
    },
    addArrangeDiagClosed() {
      this.$refs.addArrangeForm.resetFields()
      this.addArrangeDiag.form.limitCount = true
    },
    async addArrangeDiagConfirm() {
      this.$refs.addArrangeForm.validate(async valid => {
        if (!valid) {
          return
        }
        this.addArrangeDiag.loading = true
        try {
          const courseId = this.courseData[this.nowCourseIndex].id
          const eventId = this.eventData[this.nowEventIndex].id
          const teacherId = this.addArrangeDiag.form.teacherId
          const maxCount = this.addArrangeDiag.form.maxCount
          const weekday = this.addArrangeDiag.form.weekday
          const courseTimeId = this.addArrangeDiag.form.courseTimeId
          await postTakeCourseArrangement({
            courseId,
            eventId,
            teacherId,
            maxCount,
            weekday,
            courseTimeId,
          })
          this.addArrangeDiag.visible = false
          await this.refreshArrangeData()
          this.$message.success('添加选课安排成功')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('添加选课安排失败，请重试！')
          }
        }
        this.addArrangeDiag.loading = false
        return true
      })
    },
    updateArrangeBtnClick(scope) {
      const index = scope.$index
      const arrangeData = this.arrangeData[index]
      const form = this.updateArrangeDiag.form
      this.nowArrangeIndex = index
      this.updateArrangeDiag
      form.maxCountMin =
        arrangeData.recordCount === 0 ? 1 : arrangeData.recordCount
      form.maxCount = arrangeData.maxCount
      form.weekday = String(arrangeData.weekday)
      form.courseTimeId = arrangeData.courseTimeId
      this.updateArrangeDiag.visible = true
    },
    updateArrangeDiagClosed() {
      this.$refs.updateArrangeForm.resetFields()
      this.updateArrangeDiag.form.maxCountMin = 1
    },
    async updateArrangeDiagConfirm() {
      const valid = await this.$refs.updateArrangeForm.validate()
      if (!valid) {
        return false
      }
      this.updateArrangeDiag.loading = true
      try {
        const id = this.arrangeData[this.nowArrangeIndex].id
        const value = {
          maxCount: this.updateArrangeDiag.form.maxCount,
          weekday: this.updateArrangeDiag.form.weekday,
          courseTimeId: this.updateArrangeDiag.form.courseTimeId,
        }
        await putTakeCourseArrangement({
          id,
          value: JSON.stringify(value),
        })
        await this.refreshArrangeData()
        this.updateArrangeDiag.visible = false
        this.$message.success('修改选课安排成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('修改选课安排失败，请重试！')
        }
      }
      this.updateArrangeDiag.loading = false
    },
    async deleteArrange(scope) {
      try {
        const row = scope.row
        const teacher = row.teacher
        const courseTime = row.courseTime
        await this.$confirm(
          `确认将教师：${teacher.name}(${teacher.number})于：星期${
            this.weekdayMap[row.weekday]
          } 第${this.numberMap[courseTime.number]}大节(${
            courseTime.startTime
          }-${courseTime.endTime}) 的选课安排删除?`,
          '删除选课安排提示',
          {
            // confirmButtonText: '确定',
            // cancelButtonText: '取消',
            type: 'warning',
          }
        )
        this.arrangeDiag.loading = true
        try {
          await deleteTakeCourseArrangement({
            id: row.id,
          })
          await this.refreshArrangeData()
          this.$message.success('删除选课安排成功！')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('删除选课安排失败，请重试！')
          }
        }
        this.arrangeDiag.loading = false
      } catch (err) {
        this.$message.warning('取消删除操作')
      }
    },
  },
}
</script>

<style>
.box .el-pagination {
  display: flex;
  justify-content: center;
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
</style>

<style scoped>
.box {
  margin-top: 10px;
}

.box .diag-form-box {
  max-width: 350px;
}

.box .header-filter-form-inline {
  display: inline-block;
}
</style>
