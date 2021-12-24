<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 2. 为 ECharts 准备一个定义了宽高的 DOM -->
      <div id="main" style="width: 1000px;height:600px;"></div>
    </el-card>
  </div>
</template>

<script>
// 1. 导入 echarts
import * as echarts from 'echarts'
// 可以进行对象的合并
import _ from 'lodash'

export default {
  created () {

  },
  // 此时页面上的元素以及渲染完毕了
  async mounted () {
    // 3. 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    // 发起获取echarts 数据的网络请求
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('数据获取失败!')
    }

    // myChart.setOption({
    //   title: {
    //     text: 'ECharts 入门示例'
    //   },
    //   tooltip: {},
    //   xAxis: {
    //     data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
    //   },
    //   yAxis: {},
    //   series: [
    //     {
    //       name: '销量',
    //       type: 'bar',
    //       data: [5, 20, 36, 10, 10, 20]
    //     }
    //   ]
    // })
    // 将两个不完整的对象合并
    const result = _.merge(res.data, this.options)
    // 4. 准备数据和配置项,绘制图表
    myChart.setOption(result)
  },
  data () {
    return {
      options: {
        title: {
          text: '用户来源'
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
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
