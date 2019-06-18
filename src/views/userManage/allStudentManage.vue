<template>
  <div class="box">
    <el-container>
      <el-header>
        <div class="filter-item">
          <el-select size="small" width="100" v-model="filterForm.baseOption" placeholder="请选择">
            <el-option
              v-for="(item, index) in filterBaseItemOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div class="ipt-box">
            <el-input size="small" v-model="filterForm.number"/>
          </div>
        </div>
        <el-button type="primary" size="small">查找</el-button>
      </el-header>
      <el-main>
        <el-table style="max-width: 100%" size="small" :data="students">
          <el-table-column prop="number" label="学号"/>
          <el-table-column prop="name" label="姓名"/>
          <el-table-column prop="sex" label="性别"/>
          <el-table-column prop="birthday" label="生日"/>
          <el-table-column prop="grade" label="年级"/>
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
  </div>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'AllStudentManage',
  filters: {
    parseTime,
  },
  data() {
    return {
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
      },
      students: [],
      paginationData: {
        total: 0,
        currentPage: 1,
      },
    }
  },
}
</script>

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

.el-footer > .el-pagination {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
