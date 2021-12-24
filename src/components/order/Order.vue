<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
          <!-- 如果输入框的宽度太宽,可以使用栅格系统来约束宽度(el-row,el-col) -->
          <!-- 列于列之间的间距 gutter -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- table 表格区域 -->
      <el-table :data="orderslist" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column  label="订单编号" prop="order_number"></el-table-column>
        <el-table-column  label="订单价格" prop="order_price"></el-table-column>
        <el-table-column  label="是否付款" prop="pay_status">
          <template slot-scope="scope">
          <el-tag v-if="scope.row.pay_status === '1'" type="primary" effect="dark">已付款</el-tag>
          <el-tag v-else type="danger" effect="dark">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column  label="是否发货" prop="is_send">
        </el-table-column>
        <el-table-column label="下单时间">
          <!-- 在template 中使用格式化时间的全局过滤器 -->
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column  label="操作">
          <template slot-scope="">
            <el-tooltip class="item" effect="dark" content="修改订单地址" placement="top">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="物流信息" placement="top">
              <el-button size="mini" type="success" icon="el-icon-map-location" @click="showProgressDialog"></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- dialog 修改订单信息对话框 -->
      <el-dialog
        title="修改订单地址"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
          <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
              <el-cascader :options="cityDate" v-model="addressForm.address1"></el-cascader>
            </el-form-item>

            <el-form-item label="详细地址" prop="address2">
              <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
          </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- dialog 物流信息对话框 -->
      <el-dialog
        title="物流进度"
        :visible.sync="ProgressDialogVisible"
        width="50%">
        <!-- 物流信息的时间线 -->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
  </div>
</template>

<script>
import cityDate from './citydata.js'

export default {
  created () {
    this.getOrdersList()
  },
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
        user_id: '',
        pay_status: '',
        is_send: '',
        order_fapiao_title: '',
        order_fapiao_company: '',
        order_fapiao_content: '',
        consignee_addr: ''
      },
      // 查询到的订单数据列表
      orderslist: [],
      total: 0,
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      addressForm: {
        // 渲染到到级联选择框中的数据应该是一个数组
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请输入省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      cityDate,
      // 控制物流信息对话框的显示与隐藏
      ProgressDialogVisible: false,
      progressInfo: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },
  methods: {
    // 获取订单数据列表
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据列表失败!')
      }
      this.orderslist = res.data.goods
      this.total = res.data.total
      this.$message.success('获取订单数据列表成功!')
      console.log(this.orderslist)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    // 点击修改按钮,展示修改对话框
    showEditDialog () {
      this.editDialogVisible = true
    },
    // 监听dialog对话框的关闭事件
    editDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 点击物流信息按钮，展示物流信息对话框
    showProgressDialog () {
      // 接口有问题,先在data中写成假数据吧
      // const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流信息失败!')
      // }
      // this.progressInfo = res.data
      // console.log(this.progressInfo)
      // this.$message.success('获取物流信息成功!')
      this.ProgressDialogVisible = true
    }

  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';

.el-pagination {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
