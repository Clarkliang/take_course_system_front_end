<template>
  <div class="box" v-loading="loading">
    <!-- 第一步开始 -->
    <el-container v-if="step === 1" :key="1">
      <el-header height="auto">
        <el-form class="header-filter-form-inline" :inline="true">
          <el-form-item label="学年">
            <el-select
              v-model="arrangementFilterForm.schoolYearId"
              filterable
              clearable
              size="small"
              @change="arrangementFilterSchoolYearSelectChange"
            >
              <el-option
                v-for="(item, index) in schoolYearData"
                :key="index"
                :label="`${item.startYear}-${item.endYear}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="学期">
            <el-select
              v-model="arrangementFilterForm.termId"
              filterable
              clearable
              size="small"
              :disabled="!arrangementFilterForm.schoolYearId"
            >
              <el-option
                v-for="(item, index) in termData"
                :key="index"
                :label="`${item.number}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="课程名">
            <el-input size="small" v-model="arrangementFilterForm.courseName"/>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="arrangementSearchBtnClick"
            >查询</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-main>
        <el-table size="small" :data="arrangementData">
          <el-table-column prop="course.name" label="课程名"/>
          <el-table-column label="所属学期">
            <template
              slot-scope="scope"
            >{{ `${scope.row.takeCourseEvent.term.schoolYear.startYear}-${scope.row.takeCourseEvent.term.schoolYear.endYear}学年第${scope.row.takeCourseEvent.term.number}学期` }}</template>
          </el-table-column>
          <el-table-column prop="teacher" label="上课时间">
            <template
              slot-scope="scope"
            >{{ `星期${maps.weekdayMap[scope.row.weekday]} 第${maps.numberMap[scope.row.courseTime.number]}大节` }}</template>
          </el-table-column>
          <el-table-column prop="recordCount" label="学生人数"/>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="enterScoreManage(scope)">成绩录入</el-button>
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
    <!-- 第一步结束 -->
    <!-- 第二步开始 -->
    <el-container v-if="step === 2" :key="2">
      <el-header height="auto">
        <el-form class="header-filter-form-inline" :inline="true">
          <el-form-item>
            <el-button size="small" icon="el-icon-arrow-left" @click="step2BackBtnClick">返回</el-button>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input size="small" v-model="recordFilterForm.name"/>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="recordSearchBtnClick"
            >查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="success" size="small" @click="enterScoreBtnClick">成绩录入</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="enterStaticsBtnClick">成绩分析</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-main>
        <el-table size="small" :data="recordData">
          <el-table-column prop="student.number" label="学号"/>
          <el-table-column prop="student.name" label="姓名"/>
          <el-table-column label="性别">
            <template slot-scope="scope">{{ scope.row.student.sex === 0 ? '男' : '女' }}</template>
          </el-table-column>
          <el-table-column prop="student.grade" label="年级"/>
          <el-table-column prop="takeCourseScore.finallyScore" label="成绩"/>
        </el-table>
      </el-main>
      <el-footer>
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="recordPagination.currentPage"
          :page-size="10"
          :total="recordPagination.total"
          @size-change="handleRecordListSizeChange"
          @current-change="handleRecordListCurrentChange"
        />
      </el-footer>
    </el-container>
    <!-- 第二步结束 -->
    <!-- 成绩录入开始 -->
    <el-container v-if="step === 3" :key="3">
      <el-header height="auto">
        <el-form class="header-filter-form-inline" :inline="true">
          <el-form-item>
            <el-button size="small" icon="el-icon-arrow-left" @click="step3BackBtnClick">返回</el-button>
          </el-form-item>
          <!-- <el-form-item label="姓名">
            <el-input size="small" v-model="scoreFilterForm.name"/>
          </el-form-item>-->
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-refresh"
              @click="refreshScoreBtnClick"
            >刷新</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-main>
        <el-table size="small" :data="scoreData">
          <el-table-column prop="student.number" label="学号"/>
          <el-table-column prop="student.name" label="姓名"/>
          <el-table-column prop="ordinaryScore" label="平时成绩">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.score.ordinaryScore"
                size="small"
                controls-position="right"
                :min="0"
                :max="100"
                :precision="0"
              ></el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="examScore" label="考试成绩">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.score.examScore"
                size="mini"
                controls-position="right"
                :min="0"
                :max="100"
                :precision="0"
              ></el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="finallyScore" label="总成绩">
            <template slot-scope="scope">
              <template
                v-if="scope.row.score.ordinaryScore !== void 0 && scope.row.score.examScore !== void 0"
              >{{ Math.round(scope.row.score.ordinaryScore * 0.3 + scope.row.score.examScore * 0.7) }}</template>
              <template v-else>-</template>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer>
        <el-form class="header-filter-form-inline" :inline="true">
          <el-form-item label="平均分">{{ scoreStaticsData.avg.toFixed(2) }}</el-form-item>
          <el-form-item label="最高分">{{ scoreStaticsData.max }}</el-form-item>
          <el-form-item label="最低分">{{ scoreStaticsData.min }}</el-form-item>
        </el-form>
        <el-row type="flex" justify="end">
          <el-button type="success" @click="saveScoreBtnClick">保存</el-button>
        </el-row>
      </el-footer>
    </el-container>
    <!-- 成绩录入结束 -->
    <!-- 数据分析开始 -->
    <el-container v-show="step === 4" :key="4">
      <el-header height="auto">
        <el-form class="header-filter-form-inline" :inline="true">
          <el-form-item>
            <el-button size="small" icon="el-icon-arrow-left" @click="step4BackBtnClick">返回</el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-refresh"
              @click="refreshStep4DataBtnClick"
            >刷新</el-button>
          </el-form-item>
        </el-form>
        <el-menu
          :default-active="staticsMenuActiveIndex"
          class="el-menu-demo"
          mode="horizontal"
          @select="handleStaticsMenuSelect"
        >
          <el-menu-item index="1">各分数段人数</el-menu-item>
          <el-menu-item index="2">各分数段占比</el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <div id="statics-chart" class="statics-chart"></div>
      </el-main>
    </el-container>
    <!-- 数据分析结束 -->
  </div>
</template>

<script>
import { getAllSchoolYears, getAllTerms } from '@/api/baseData'
import {
  getAllTakeCourseArrangements,
  getStudentTakeCourseRecords,
  putAllStudentTakeCourseScores,
} from '@/api/course'
import echarts from 'echarts'
// import echarts from 'echarts/lib/echarts'
// import 'echarts/lib/component/tooltip'
// import 'echarts/lib/component/title'
// import 'echarts/lib/chart/bar'
// import 'echarts/lib/chart/pie'
// import 'echarts/lib/component/legend'
// import 'echarts/lib/component/?'

export default {
  name: 'ScoreManage',
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
      arrangementPagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      arrangementData: [],
      schoolYearData: [],
      termData: [],
      arrangementFilterForm: {
        schoolYearId: '',
        termId: '',
        courseName: '',
      },
      nowArrangementIndex: -1,
      recordFilterForm: {
        name: '',
      },
      recordData: [],
      recordPagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      scoreData: [],
      // scoreFilterForm: {
      //   name: '',
      // },
      staticsMenuActiveIndex: '2',
      staticsChart: null,
    }
  },
  computed: {
    scoreStaticsData() {
      const data = this.scoreData

      if (!data || data.length === 0) {
        return {
          max: 0,
          min: 0,
          avg: 0,
        }
      }

      const scores = data.reduce((prev, item) => {
        const score = item.score
        prev.push(Math.round(score.examScore * 0.7 + score.ordinaryScore * 0.3))
        return prev
      }, [])
      return {
        max: Math.max(...scores),
        min: Math.min(...scores),
        avg: scores.reduce((prev, item) => prev + item) / scores.length,
      }
    },
    stageStaticsCount() {
      const data = this.scoreData
      const result = new Array(5).fill(0)
      data.forEach(item => {
        const score = item.score.finallyScore
        if (score < 60) {
          result[0]++
        } else if (score < 70) {
          result[1]++
        } else if (score < 80) {
          result[2]++
        } else if (score < 90) {
          result[3]++
        } else {
          result[4]++
        }
      })
      return result
    },
  },
  async mounted() {
    this.loading = true
    await Promise.all([
      this.refreshSchoolYearData(),
      this.refreshArrangementData(),
    ])
    this.staticsChart = echarts.init(document.getElementById('statics-chart'))
    this.loading = false
  },
  methods: {
    async refreshSchoolYearData() {
      try {
        const { data: response } = await getAllSchoolYears({
          disablePagination: 1,
        })
        this.schoolYearData = response.data.rows
        this.$message.success('获取学年数据成功！')
      } catch (err) {
        this.arrangementData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取学年数据失败，请重试！')
        }
      }
    },
    async refreshTermData() {
      try {
        const { data: response } = await getAllTerms({
          where: JSON.stringify({
            schoolYearId: this.arrangementFilterForm.schoolYearId,
          }),
          order: JSON.stringify([['number', 'ASC']]),
          disablePagination: 1,
        })
        this.termData = response.data.rows
        this.$message.success('获取学期数据成功！')
      } catch (err) {
        this.arrangementData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取学期数据失败，请重试！')
        }
      }
    },
    async refreshArrangementData() {
      try {
        const teacherId = this.$store.state.user.userInfo.teacherInfo.id
        const { data: response } = await getAllTakeCourseArrangements({
          courseWhere: JSON.stringify({
            name: this.arrangementFilterForm.courseName
              ? {
                  $like: `%${this.arrangementFilterForm.courseName}%`,
                }
              : undefined,
          }),
          takeCourseEventWhere: JSON.stringify({
            termId: this.arrangementFilterForm.termId
              ? this.arrangementFilterForm.termId
              : undefined,
          }),
          page: this.arrangementPagination.currentPage,
          row: this.arrangementPagination.pageSize,
          where: JSON.stringify({
            teacherId,
          }),
        })
        this.arrangementData = response.data.rows
        this.arrangementPagination.total = response.data.count
        this.$message.success('获取选课安排数据成功！')
      } catch (err) {
        this.arrangementData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取选课安排数据失败，请重试！')
        }
      }
    },
    async arrangementFilterSchoolYearSelectChange() {
      this.arrangementFilterForm.termId = ''
      this.loading = true
      await this.refreshTermData()
      this.loading = false
    },
    async refreshStep1Data() {
      this.loading = true
      await this.refreshArrangementData()
      this.loading = false
    },
    async arrangementSearchBtnClick() {
      await this.refreshStep1Data()
    },
    async handleArrangementListSizeChange(val) {
      this.arrangementPagination.pageSize = val
      this.arrangementPagination.currentPage = 1
      await this.refreshStep1Data()
    },
    async handleArrangementListCurrentChange(val) {
      this.arrangementPagination.currentPage = val
      await this.refreshStep1Data()
    },
    async enterScoreManage(scope) {
      this.nowArrangementIndex = scope.$index
      this.step = 2
      await this.refreshStep2Data()
    },
    async step2BackBtnClick() {
      this.step = 1
    },
    async refreshRecordData() {
      try {
        const { data: response } = await getStudentTakeCourseRecords({
          page: this.recordPagination.currentPage,
          row: this.recordPagination.pageSize,
          where: JSON.stringify({
            arrangementId: this.arrangementData[this.nowArrangementIndex].id,
          }),
          studentWhere: JSON.stringify({
            name: this.recordFilterForm.name
              ? {
                  $like: `%${this.recordFilterForm.name}%`,
                }
              : undefined,
          }),
          order: JSON.stringify([['student', 'number', 'ASC']]),
        })
        this.recordData = response.data.rows
        this.recordPagination.total = response.data.count
        this.$message.success('获取学生选课数据成功！')
      } catch (err) {
        this.recordData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取学生选课数据失败，请重试！')
        }
      }
    },
    async refreshStep2Data() {
      this.loading = true
      await this.refreshRecordData()
      this.loading = false
    },
    async recordSearchBtnClick() {
      await this.refreshStep2Data()
    },
    async handleRecordListSizeChange(val) {
      this.recordPagination.pageSize = val
      this.recordPagination.currentPage = 1
      await this.refreshStep2Data()
    },
    async handleRecordListCurrentChange(val) {
      this.recordPagination.currentPage = val
      await this.refreshStep2Data()
    },
    async enterScoreBtnClick() {
      this.step = 3
      await this.refreshStep3Data()
    },
    async refreshScoreData() {
      try {
        const { data: response } = await getStudentTakeCourseRecords({
          where: JSON.stringify({
            arrangementId: this.arrangementData[this.nowArrangementIndex].id,
          }),
          studentWhere: JSON.stringify({
            name: this.recordFilterForm.name
              ? {
                  $like: `%${this.recordFilterForm.name}%`,
                }
              : undefined,
          }),
          order: JSON.stringify([['student', 'number', 'ASC']]),
          disablePagination: 1,
        })
        const rows = response.data.rows
        this.scoreData = rows.reduce((prev, item) => {
          prev.push({
            recordId: item.id,
            student: item.student,
            score: item.takeCourseScore
              ? item.takeCourseScore
              : {
                  ordinaryScore: '',
                  examScore: '',
                },
          })
          return prev
        }, [])
        this.$message.success('获取学生选课数据成功！')
      } catch (err) {
        this.scoreData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('获取学生选课数据失败，请重试！')
        }
      }
    },
    async refreshStep3Data() {
      this.loading = true
      await this.refreshScoreData()
      this.loading = false
    },
    async step3BackBtnClick() {
      this.step = 2
      await this.refreshStep2Data()
    },
    async refreshScoreBtnClick() {
      await this.refreshStep3Data()
    },
    async saveScoreBtnClick() {
      this.loading = true
      try {
        const values = this.scoreData.reduce((prev, item) => {
          prev.push({
            recordId: item.recordId,
            scoreData: {
              ordinaryScore: item.score.ordinaryScore,
              examScore: item.score.examScore,
            },
          })
          return prev
        }, [])
        const { data: response } = await putAllStudentTakeCourseScores({
          values: JSON.stringify(values),
        })
        await this.refreshScoreData()
        this.$message.success('保存数据成功！')
      } catch (err) {
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('保存数据失败，请重试！')
        }
      }
      this.loading = false
    },
    async enterStaticsBtnClick() {
      this.step = 4
      await this.refreshStep4Data()
      this.handleStaticsMenuSelect('2')
    },
    async refreshStep4Data() {
      this.loading = true
      await this.refreshScoreData()
      this.loading = false
    },
    async step4BackBtnClick() {
      this.step = 2
    },
    async refreshStep4DataBtnClick() {
      await this.refreshStep4Data()
      this.staticsMenuActiveIndex = '2'
      this.handleStaticsMenuSelect('2')
    },
    handleStaticsMenuSelect(key) {
      this.staticsChart = echarts.init(document.getElementById('statics-chart'))
      if (key === '1') {
        this.staticsChart.setOption({
          title: {
            text: '各分数段人数',
            x: 'center',
          },
          color: ['#3398DB'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
            },
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: [
            {
              type: 'category',
              data: ['小于60分', '60-70分', '70-80分', '80-90分', '90-100分'],
              axisTick: {
                alignWithLabel: true,
              },
            },
          ],
          yAxis: [
            {
              type: 'value',
            },
          ],
          series: [
            {
              name: '人数',
              type: 'bar',
              barWidth: '60%',
              data: this.stageStaticsCount,
            },
          ],
        })
      } else if (key === '2') {
        this.staticsChart.setOption({
          title: {
            text: '各分数段占比',
            x: 'center',
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)',
          },
          legend: {
            // type: 'scroll',
            orient: 'vertical',
            left: 'left',
            // right: 10,
            // top: 20,
            // bottom: 20,
            data: ['小于60分', '60-70分', '70-80分', '80-90分', '90-100分'],
          },
          series: [
            {
              name: '学生',
              type: 'pie',
              radius: '55%',
              center: ['50%', '50%'],
              data: [
                {
                  name: '小于60分',
                  value: this.stageStaticsCount[0],
                },
                {
                  name: '60-70分',
                  value: this.stageStaticsCount[1],
                },
                {
                  name: '70-80分',
                  value: this.stageStaticsCount[2],
                },
                {
                  name: '80-90分',
                  value: this.stageStaticsCount[3],
                },
                {
                  name: '90-100分',
                  value: this.stageStaticsCount[4],
                },
              ],
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
        })
      } else {
        this.staticsChart.setOption({})
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

.box .el-pagination {
  display: flex;
  justify-content: center;
}

.statics-chart {
  width: 1000px;
  height: 600px;
  margin: 0 auto;
}
</style>
