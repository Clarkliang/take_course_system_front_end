<template>
  <div class="box" v-loading="loading">
    <el-container>
      <el-header height="auto">
        <div class="filter-form-box">
          <el-form :inline="true">
            <el-form-item label="学年">
              <el-select
                v-model="filterForm.schoolYearId"
                filterable
                clearable
                size="small"
                @change="schoolYearSelectChange"
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
                v-model="filterForm.termId"
                filterable
                clearable
                size="small"
                :disabled="!filterForm.schoolYearId"
                @change="termSelectChange"
              >
                <el-option
                  v-for="(item, index) in termData"
                  :key="index"
                  :label="`${item.number}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" icon="el-icon-search" @click="searchData">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-header>
      <el-main>
        <!-- 课程表开始 -->
        <div class="syllabus-box">
          <el-table
            border
            style="width: 1041px; margin: 0 auto;"
            align="center"
            size="small"
            row-class-name="syllabus-row"
            cell-class-name="syllabus-cell"
            header-row-class-name="syllabus-header-row"
            header-cell-class-name="syllabus-header-cell"
            :fit="false"
            :show-header="!!filterForm.termId"
            :data="syllabusData"
          >
            <el-table-column prop="courseTimeName" width="130px" :resizable="false"/>
            <el-table-column prop="weekday1" label="星期一" width="130px" :resizable="false"/>
            <el-table-column prop="weekday2" label="星期二" width="130px" :resizable="false"/>
            <el-table-column prop="weekday3" label="星期三" width="130px" :resizable="false"/>
            <el-table-column prop="weekday4" label="星期四" width="130px" :resizable="false"/>
            <el-table-column prop="weekday5" label="星期五" width="130px" :resizable="false"/>
            <el-table-column prop="weekday6" label="星期六" width="130px" :resizable="false"/>
            <el-table-column prop="weekday7" label="星期日" width="130px" :resizable="false"/>
          </el-table>
        </div>
        <!-- 课程表结束 -->
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import { getAllSchoolYears, getAllTerms } from '@/api/baseData'
import { getPersonalTakeCourseRecords } from '@/api/course'

export default {
  name: 'MyStudentSyllabus',
  data() {
    return {
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
      loading: false,
      filterForm: {
        schoolYearId: '',
        termId: '',
      },
      schoolYearData: [],
      termData: [],
      recordData: [],
    }
  },
  computed: {
    syllabusData() {
      if (!this.filterForm.termId) {
        return []
      }

      const h = this.$createElement
      const data = this.maps.courseTimeData.reduce((prev, item, index) => {
        prev.push({
          courseTimeName: h('div', [
            h(
              'div',
              {
                style: {
                  fontWeight: 'blod',
                },
              },
              `第${this.maps.numberMap[index + 1]}大节`
            ),
            h('div', `(${item.startTime}-${item.endTime})`),
          ]),
        })
        return prev
      }, [])
      this.recordData.forEach(item => {
        const arrangement = item.takeCourseArrangement
        const name = arrangement.course.name
        const weekday = arrangement.weekday
        const courseTimeNumber = arrangement.courseTime.number
        const teacherName = arrangement.teacher.name
        const courseNameStyle = {
          fontSize: '14px',
          fontWeight: 'bold',
        }
        const teacherNameStyle = {
          fontSize: '14px',
        }

        if (arrangement.arrangeCourse) {
          const classroom = arrangement.arrangeCourse.classroom
          const classroomNumber = classroom.number
          const teachingBuildingName = classroom.teachingBuilding.name

          data[courseTimeNumber - 1][`weekday${weekday}`] = h('div', [
            h('div', { style: courseNameStyle }, name),
            h('div', { style: teacherNameStyle }, teacherName),
            h(
              'div',
              {
                style: {
                  // marginTop: '6px',
                },
              },
              `${teachingBuildingName}${classroomNumber}`
            ),
          ])
        } else {
          data[courseTimeNumber - 1][`weekday${weekday}`] = h('div', [
            h('div', { style: courseNameStyle }, name),
            h('div', { style: teacherNameStyle }, teacherName),
          ])
        }
      })
      return data
    },
  },
  async mounted() {
    this.loading = true
    await this.refreshSchoolYearData()
    this.loading = false
  },
  methods: {
    async refreshSchoolYearData() {
      try {
        const { data: response } = await getAllSchoolYears({
          order: JSON.stringify([['startYear', 'DESC'], ['endYear', 'DESC']]),
          disablePagination: 1,
        })
        this.schoolYearData = response.data.rows
        this.$message.success('刷新学年数据成功！')
      } catch (err) {
        this.schoolYearData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('刷新学年数据失败，请重试！')
        }
      }
    },
    async refershTermData() {
      try {
        const { data: response } = await getAllTerms({
          where: JSON.stringify({
            schoolYearId: this.filterForm.schoolYearId,
          }),
          order: JSON.stringify([['number', 'ASC']]),
          disablePagination: 1,
        })
        this.termData = response.data.rows
        // this.$message.success('刷新学期数据成功！')
      } catch (err) {
        this.termData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('刷新学期数据失败，请重试！')
        }
      }
    },
    async schoolYearSelectChange() {
      this.filterForm.termId = ''
      this.loading = true
      await this.refershTermData()
      this.loading = false
    },
    async refreshRecordData() {
      try {
        const { data: response } = await getPersonalTakeCourseRecords({
          takeCourseWhere: JSON.stringify({
            termId: this.filterForm.termId,
          }),
        })
        this.recordData = response.data.rows
        this.$message.success('刷新选课数据成功！')
      } catch (err) {
        this.recordData = []
        if (err.data && err.data.errorMessage) {
          this.$message.error(err.data.errorMessage)
        } else {
          this.$message.error('刷新选课数据失败，请重试！')
        }
      }
    },
    async termSelectChange() {
      this.loading = true
      await this.refreshRecordData()
      this.loading = false
    },
    async searchData() {
      this.loading = true
      await this.refreshRecordData()
      this.loading = false
    },
  },
}
</script>

<style>
.filter-form-box .el-form.el-form--inline {
  display: flex;
  justify-content: center;
}

.syllabus-box .syllabus-header-cell {
  text-align: center;
}

.syllabus-row {
  height: 100px;
}

.syllabus-box .syllabus-cell {
  text-align: center;
}
</style>

<style scoped>
.box {
  margin-top: 10px;
}
</style>
