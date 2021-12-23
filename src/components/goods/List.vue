<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
          <!-- 如果输入框的宽度太宽,可以使用栅格系统来约束宽度(el-row,el-col) -->
          <!-- 列于列之间的间距 gutter -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button icon="el-icon-plus" type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table 表格区域 -->
      <el-table :data="goodslist" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column  label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column  label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column  label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column  label="创建时间" prop="add_time" width="140px">
          <!-- 在template 中使用格式化时间的全局过滤器 -->
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column  label="操作" width="130px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeGoodsById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 25]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total" background>
        </el-pagination>

      <!-- 商品列表区域 -->
    </el-card>
  </div>
</template>

<script>
export default {
  created () {
    this.getGoodsList()
  },
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取到的商品列表数据
      goodslist: [],
      // 总条数
      total: 0
    }
  },
  methods: {
    // 获取商品的数据列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败!')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
      console.log(this.goodslist)
      this.$message.success('获取商品列表成功!')
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 点击删除按钮，根据id删除对应的商品
    async removeGoodsById (id) {
      // 删除前先弹出确认是否删除对话框
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认要删除，则返回值为字符串 confirm
      // 如果用户取消了删除，返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }
      this.getGoodsList()
      this.$message.success('删除成功!')
    },
    // 点击添加商品按钮，跳转到添加商品的界面
    goAddpage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
