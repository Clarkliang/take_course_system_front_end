<template>
  <div class="box" v-loading="loading">
    <!-- 第一步开始 -->
    <el-container v-if="step === 1" :key="1">
      <el-header height="auto">
        <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshStep1Data">刷新</el-button>
      </el-header>
      <el-main>
        <!-- 选课场次列表开始 -->
        <el-table size="small" :data="eventData">
          <el-table-column prop="name" label="场次名称"/>
          <el-table-column prop="term" label="所属学期">
            <template
              slot-scope="scope"
            >{{ `${scope.row.term.schoolYear.startYear}-${scope.row.term.schoolYear.endYear}学年第${scope.row.term.number}学期` }}</template>
          </el-table-column>
          <el-table-column prop="time" label="选课时间">
            <template
              slot-scope="scope"
            >{{ scope.row.startTime | parseTime }}{{' 至 '}}{{ scope.row.endTime | parseTime }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag v-if="new Date(scope.row.endTime) < Date.now()" type="info" size="small">已结束</el-tag>
              <el-tag
                v-else-if="new Date(scope.row.startTime) < Date.now() && new Date(scope.row.endTime) > Date.now()"
                type="success"
                size="small"
              >正在进行</el-tag>
              <el-tag
                v-else-if="new Date(scope.row.startTime) > Date.now()"
                type="warning"
                size="small"
              >未开始</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="enterEventBtnClick(scope)">进入</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 选课场次列表结束 -->
      </el-main>
    </el-container>
    <!-- 第一步结束 -->
    <!-- 第二步开始 -->
    <el-container v-if="step === 2" :key="2">
      <el-header height="auto">
        <el-form :inline="true">
          <el-form-item>
            <el-button size="small" icon="el-icon-arrow-left" @click="backToStep1BtnClick">返回</el-button>
          </el-form-item>
          <el-form-item label="课程名">
            <el-input size="small" v-model="step2FilterForm.courseName"/>
          </el-form-item>
          <el-form-item label="星期">
            <el-select
              v-model="step2FilterForm.weekday"
              filterable
              clearable
              size="small"
              style="width: 100px"
            >
              <el-option
                v-for="(item, index) in maps.weekdayMap"
                :key="index"
                :label="`星期${item}`"
                :value="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="时间">
            <el-select
              v-model="step2FilterForm.courseTimeId"
              filterable
              clearable
              size="small"
              style="width: 230px"
            >
              <el-option
                v-for="(item, index) in maps.courseTimeData"
                :key="index"
                :label="`第${maps.numberMap[index + 1]}大节 (${item.startTime}-${item.endTime})`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="searchArrangementBtnClick"
            >查询</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-main>
        <div class="main-section">
          <span>已选课程</span>
          <!-- 已选课程列表开始 -->
          <el-table size="small" :data="recordData">
            <el-table-column prop="takeCourseArrangement.course.name" label="课程名"/>
            <el-table-column prop="takeCourseArrangement.course.credit" label="学分" width="50px"/>
            <el-table-column prop="takeCourseArrangement.teacher.name" label="授课教师" width="80px"/>
            <el-table-column prop="time" label="上课时间" width="220px">
              <template
                slot-scope="scope"
              >{{ `星期${maps.weekdayMap[scope.row.takeCourseArrangement.weekday]} 第${maps.numberMap[scope.row.takeCourseArrangement.courseTime.number]}节(${scope.row.takeCourseArrangement.courseTime.startTime}-${scope.row.takeCourseArrangement.courseTime.endTime})` }}</template>
            </el-table-column>
            <el-table-column prop="action" label="操作">
              <template
                slot-scope="scope"
              >
                <el-button type="danger" size="mini" @click="deleteTakeCourseBtnClick(scope)">退选</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 已选课程列表结束 -->
        </div>
        <div class="main-section">
          <span>课程安排列表</span>
          <!-- 课程安排列表开始 -->
          <el-table size="small" :data="arrangementData">
            <el-table-column prop="course.name" label="课程名"/>
            <el-table-column prop="course.credit" label="学分" width="50px"/>
            <el-table-column prop="teacher.name" label="授课教师" width="80px"/>
            <el-table-column prop="time" label="上课时间" width="220px">
              <template
                slot-scope="scope"
              >{{ `星期${maps.weekdayMap[scope.row.weekday]} 第${maps.numberMap[scope.row.courseTime.number]}节(${scope.row.courseTime.startTime}-${scope.row.courseTime.endTime})` }}</template>
            </el-table-column>
            <el-table-column prop="count" label="容量/已选/余量" width="100px">
              <template
                slot-scope="scope"
              >{{ `${scope.row.maxCount}/${scope.row.recordCount}/${scope.row.freeCount}` }}</template>
            </el-table-column>
            <el-table-column prop="action" label="操作">
              <template slot-scope="scope">
                <el-button
                  type="success"
                  size="mini"
                  :disabled="!step2PageRenderData.isTakingCourse"
                  @click="takeCourseBtnClick(scope)"
                >选课</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 课程安排列表结束 -->
        </div>
      </el-main>
      <el-footer>
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="arrangementPaginationData.currentPage"
          :page-size="arrangementPaginationData.pageSize"
          :total="arrangementPaginationData.total"
          @size-change="arrangementHandleSizeChange"
          @current-change="arrangement2HandleCurrentChange"
        ></el-pagination>
      </el-footer>
    </el-container>
    <!-- 第二步结束 -->
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import {
  getAllTakeCourseEvents,
  getAllTakeCourseArrangements,
  getPersonalTakeCourseRecords,
  postPersonalTakeCourseRecords,
  putPersonalTakeCourseRecords,
  deletePersonalTakeCourseRecords,
} from '@/api/course'

export default {
  name: 'TakeCourse',
  filters: {
    parseTime,
  },
  data() {
    return {
      step: 1,
      loading: false,
      eventData: [],
      step2FilterForm: {
        courseName: '',
        weekday: '',
        courseTimeId: '',
      },
      arrangementData: [],
      arrangementPaginationData: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      maps: {
        weekdayMap: {
          1: '一',
          2: '二',
          3: '三',
          4: '四',
          5: '五',
          6: '六',
          7: '日',
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
      },
      nowEventIndex: -1,
      recordData: [],
    }
  },
  computed: {
    getEventParams() {
      return {
        order: JSON.stringify([['startTime', 'ASC'], ['endTime', 'ASC']]),
        disablePagination: 1,
      }
    },
    getArrangementParams() {
      const paginationData = this.arrangementPaginationData
      return {
        page: paginationData.currentPage,
        row: paginationData.pageSize,
        where: JSON.stringify({
          eventId: this.eventData[this.nowEventIndex].id,
          weekday: this.step2FilterForm.weekday
            ? this.step2FilterForm.weekday
            : undefined,
          courseTimeId: this.step2FilterForm.courseTimeId
            ? this.step2FilterForm.courseTimeId
            : undefined,
        }),
        courseWhere: JSON.stringify({
          name:
            this.step2FilterForm.courseName === ''
              ? undefined
              : {
                  $like: `%${this.step2FilterForm.courseName}%`,
                },
        }),
        order: JSON.stringify([['createTime', 'DESC']]),
      }
    },
    getPersonalTakeCourseRecordsParams() {
      return {
        where: JSON.stringify({}),
        arrangementWhere: JSON.stringify({
          eventId: this.eventData[this.nowEventIndex].id,
        }),
        disablePagination: 1,
      }
    },
    step2PageRenderData() {
      const event = this.eventData[this.nowEventIndex]
      if (!event) {
        return {}
      }
      return {
        // 选课进行中
        isTakingCourse:
          new Date(event.startTime) < Date.now() &&
          new Date(event.endTime) > Date.now(),
      }
    },
  },
  async mounted() {
    this.refreshStep1Data()
  },
  methods: {
    async refreshEventData() {
      try {
        const { data: response } = await getAllTakeCourseEvents(
          this.getEventParams
        )
        this.eventData = response.data.rows
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
    async refreshStep1Data() {
      this.loading = true
      await this.refreshEventData()
      this.loading = false
    },
    async enterEventBtnClick(scope) {
      this.nowEventIndex = scope.$index
      this.step = 2
      this.arrangementPaginationData.currentPage = 1
      await this.refreshStep2Data()
    },
    async backToStep1BtnClick() {
      this.step = 1
      await this.refreshStep1Data()
    },
    async refreshArrangementData() {
      try {
        const { data: response } = await getAllTakeCourseArrangements(
          this.getArrangementParams
        )
        this.arrangementPaginationData.total = response.data.count
        this.arrangementData = response.data.rows
        this.$message.success('刷新课程安排数据成功！')
      } catch (err) {
        this.arrangementPaginationData.total = 0
        this.arrangementData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('刷新课程安排数据失败，请重试！')
        }
      }
    },
    async refreshRecordData() {
      try {
        const { data: response } = await getPersonalTakeCourseRecords(
          this.getPersonalTakeCourseRecordsParams
        )
        this.recordData = response.data.rows
        this.$message.success('刷新已选课程数据成功！')
      } catch (err) {
        this.recordData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('刷新已选课程数据失败，请重试！')
        }
      }
    },
    async refreshStep2Data() {
      this.loading = true
      await Promise.all([
        this.refreshArrangementData(),
        this.refreshRecordData(),
      ])
      this.loading = false
    },
    async searchArrangementBtnClick() {
      this.arrangementPaginationData.currentPage = 1
      await this.refreshStep2Data()
    },
    async arrangementHandleSizeChange(val) {
      this.arrangementPaginationData.pageSize = val
      this.arrangementPaginationData.currentPage = 1
      await this.refreshStep2Data()
    },
    async arrangement2HandleCurrentChange(val) {
      this.arrangementPaginationData.currentPage = val
      await this.refreshStep2Data()
    },
    async takeCourseBtnClick(scope) {
      this.loading = true
      try {
        const { data: response } = await postPersonalTakeCourseRecords({
          arrangementId: scope.row.id,
        })
        await this.refreshStep2Data()
        this.$message.success('选课成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('选课失败，请重试！')
        }
      }
      this.loading = false
    },
    async deleteTakeCourseBtnClick(scope) {
      try {
        const row = scope.row
        const arrangement = row.takeCourseArrangement
        await this.$confirm(
          `确定退选教师：${arrangement.teacher.name}，课程：${arrangement.course.name}？`,
          '退选提示'
        )
        this.loading = true
        try {
          await deletePersonalTakeCourseRecords({
            id: row.id,
          })
          await this.refreshStep2Data()
          this.$message.success('退选成功！')
        } catch (err) {
          if (err.data && err.data.errorMessage) {
            this.$message.error(err.data.errorMessage)
          } else {
            this.$message.error('退选失败，请重试！')
          }
        }
        this.loading = false
      } catch (err) {
        this.$message.warning('取消退选操作')
      }
    },
  },
}
</script>

<style>
.el-container.is-vertical > .el-header > .el-form.el-form--inline {
  margin-bottom: 0;
}
</style>

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

.box .el-pagination {
  display: flex;
  justify-content: center;
}

.main-section {
  margin-top: 30px;
}

.main-section:first-child {
  margin-top: 0;
}
</style>
