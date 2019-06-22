<template>
  <div class="box" v-loading="loading">
    <!-- 第一步开始 -->
    <el-container v-if="step === 1" :key="1">
      <el-header height="auto">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-refresh"
          @click="refreshEventDataBtnClick"
        >刷新</el-button>
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
              <el-button type="primary" size="small" @click="arrangeBtnClick(scope)">进入排课</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 选课场次列表结束 -->
      </el-main>
      <el-footer>
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="eventPaginationData.currentPage"
          :page-size="10"
          :total="eventPaginationData.total"
          @size-change="handleEventListSizeChange"
          @current-change="handleEventListCurrentChange"
        />
      </el-footer>
    </el-container>
    <!-- 第一步结束 -->
    <!-- 第二步开始 -->
    <el-container v-else-if="step === 2" :key="2">
      <el-header height="auto">
        <el-form class="header-filter-form-inline" :inline="true">
          <el-form-item>
            <el-button size="small" icon="el-icon-arrow-left" @click="step2BackBtnClick">返回</el-button>
          </el-form-item>
          <el-form-item label="课程名">
            <el-input size="small" v-model="arrangementFilterForm.courseName"/>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="step2SearchBtnClick"
            >查询</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-main>
        <el-table size="small" :data="arrangementData">
          <el-table-column prop="course.name" label="课程名"/>
          <el-table-column prop="teacher" label="教师">
            <template
              slot-scope="scope"
            >{{ `${scope.row.teacher.name}(${scope.row.teacher.number})` }}</template>
          </el-table-column>
          <el-table-column prop="teacher" label="上课时间">
            <template
              slot-scope="scope"
            >{{ `星期${maps.weekdayMap[scope.row.weekday]} 第${maps.numberMap[scope.row.courseTime.number]}大节` }}</template>
          </el-table-column>
          <el-table-column prop="action" label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="arrangeCourseBtnClick(scope)">排课</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer>
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="arrangementPagination.currentPage"
          :page-size="10"
          :total="arrangementPagination.total"
          @size-change="handleArrangementListSizeChange"
          @current-change="handleArrangementListCurrentChange"
        />
      </el-footer>
    </el-container>
    <!-- 第二步结束 -->
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import {
  getAllTakeCourseEvents,
  // postTakeCourseEvent,
  // putTakeCourseEvent,
  // deleteTakeCourseEvent,
  // getAllCourses,
  getAllTakeCourseArrangements,
} from '@/api/course'

export default {
  name: 'ArrangeCourse',
  filters: {
    parseTime,
  },
  data() {
    return {
      loading: false,
      step: 1,
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
      eventData: [],
      eventPaginationData: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      nowEventIndex: -1,
      arrangementData: [],
      arrangementPagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      arrangementFilterForm: {
        courseName: '',
      },
    }
  },
  async mounted() {
    this.loading = true
    await this.refreshEventData()
    this.loading = false
  },
  methods: {
    async refreshEventData() {
      try {
        const { data: response } = await getAllTakeCourseEvents({
          page: this.eventPaginationData.currentPage,
          row: this.eventPaginationData.pageSize,
          where: {
            endTime: {
              $lt: new Date(),
            },
          },
        })
        this.eventData = response.data.rows
        this.eventPaginationData.total = response.data.count
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
    async refreshEventDataBtnClick() {
      await this.refreshStep1Data()
    },
    async refreshStep1Data() {
      this.loading = true
      await this.refreshEventData()
      this.loading = false
    },
    async handleEventListSizeChange(val) {
      this.eventPaginationData.pageSize = val
      this.eventPaginationData.currentPage = 1
      await this.refreshStep1Data()
    },
    async handleEventListCurrentChange(val) {
      this.eventPaginationData.currentPage = val
      await this.refreshStep1Data()
    },
    async arrangeBtnClick(scope) {
      this.nowEventIndex = scope.$index
      await this.refreshStep2Data()
      this.step = 2
    },
    async refreshArrangementData() {
      try {
        const { data: response } = await getAllTakeCourseArrangements({
          page: this.arrangementPagination.currentPage,
          row: this.arrangementPagination.pageSize,
          where: {
            eventId: this.eventData[this.nowEventIndex].id,
          },
        })
        this.arrangementData = response.data.rows
        this.arrangementPagination.total = response.data.count
        this.$message.success('获取选课安排数据成功！')
      } catch (err) {
        this.eventData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取选课安排数据失败，请重试！')
        }
      }
    },
    async refreshStep2Data() {
      this.loading = true
      await this.refreshArrangementData()
      this.loading = false
    },
    async step2BackBtnClick() {
      this.step = 1
    },
    async step2SearchBtnClick() {},
    async handleArrangementListSizeChange(val) {
      this.arrangementPagination.pageSize = val
      this.arrangementPagination.currentPage = 1
      await this.refreshStep2Data()
    },
    async handleArrangementListCurrentChange(val) {
      this.arrangementPagination.currentPage = val
      await this.refreshStep2Data()
    },
    async arrangeCourseBtnClick(scope) {},
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

.box .el-pagination {
  display: flex;
  justify-content: center;
}
</style>
