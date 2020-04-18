<template>
  <div class="report">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 100%;height:600px;"></div>
    </el-card>
  </div>
</template>

<script>
/*eslint-disable-next-line*/
import echarts from 'echarts';

export default {
  name: 'report',
  data() {
    return {
      options: {
        title: {
          text: '数据报表'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    };
  },
  methods: {},
  async mounted() {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));

    const res = await this.$http.get('reports/type/1');
    if (res.meta.status !== 200) {
      return this.$message.error(res.meta.msg);
    }
    // 指定图表的配置项和数据
    var option = {
      ...this.options,
      ...res.data
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
  }
};
</script>

<style lang="stylus" scoped>
// .report
</style>
