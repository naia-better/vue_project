<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 添加角色按钮区域 -->
        <el-row>
          <el-col>
            <el-button icon="el-icon-plus" type="primary" @click="showAddCateDialog">添加分类</el-button>
          </el-col>
        </el-row>

        <!-- 商品分类表格区域 -->
        <!-- 在这里element-ui没有提供合适的组件,所以我们使用vue-table-with-tree-grid@0.2.4  -->
        <tree-table class="TreeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
          <!-- 使用作用域插槽实现自定义模板 -->
          <!-- 是否有效 -->
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
            <i class="el-icon-error" v-else style="color:red"></i>
          </template>
          <!-- 排序 -->
          <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
          </template>
          <!-- 操作 -->
          <template slot="opt" slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
          </template>
        </tree-table>

        <!-- 分页区域 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="TreeTable">
        </el-pagination>

      <!-- dialog添加分类的对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%" @close="addCateDialogClosed">
        <!-- 添加分类的表单 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称: " prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类: ">
            <!-- 选择商品分类的级联选择框 -->
            <!-- :options 指定数据源 -->
            <!-- :props 用来指定配置对象 -->
             <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: 'true'}"
              @change="parentCateChanged"
              clearable>
              </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>

      <!-- dialog修改分类的对话框 -->
      <el-dialog
        title="修改分类"
        :visible.sync="editCateDialogVisible"
        width="50%">
        <!-- 修改分类表单区域 -->
        <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类的数据列表,默认为空
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      },
      {
        label: '是否有效',
        // 表示,将当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用的模板名称
        template: 'isok'
      },
      {
        label: '排序',
        // 表示,将当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用的模板名称
        template: 'order'
      },
      {
        label: '操作',
        // 表示,将当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用的模板名称
        template: 'opt'
      }],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 默认添加的分类层级是 0
        cat_level: 0
      },
      // 添加分类的表单验证
      addCateFormRules: {
        // 验证分类名称是否合法
        cat_name: [
          { required: true, message: '请输入合法的分类名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 把请求回来的父级分类的数据列表保存在 data中,供后续使用
      parentCateList: [],
      // 指定级联选择器的配置对象(新版本不需要这个配置了！！！)
      // cascaderProps: {
      //   // 指定选项的值为选项对象的某个属性值
      //   value: 'cat_id',
      //   // 指定选项标签为选项对象的某个属性值
      //   label: 'cat_name',
      //   // 指定选项的子选项为选项对象的某个属性值
      //   children: 'children'
      // },
      // 选中的父级分类的id数组
      selectedKeys: [],

      // 控制修改分类的对话框的显示与隐藏
      editCateDialogVisible: false,
      // 保存修改分类的数据对象
      editCateForm: {},
      // 保存修改分类对话框的表单数据验证规则
      editCateFormRules: {
        // 验证分类名称是否合法
        cat_name: [
          { required: true, message: '请输入合法的分类名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 请求商品分类的数据列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类的数据列表获取失败!')
      }
      console.log(res)
      // 把数据列表,赋值给cateList
      this.cateList = res.data.result
      // 把总数据条数赋值给total
      this.total = res.data.total
      this.$message.success('商品分类的数据列表获取成功!')
    },
    // 监听 pagesize 改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮,展示添加分类对话框
    showAddCateDialog () {
      // 对话框刚一展示,就可以调用获取父级分类的数据列表的函数
      this.getParentCateList()
      // 再展示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据列表失败!')
      }
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      // console.log('-----------')
      // console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中 length 大于 0，证明我们选中了父级分类
      // 反之，就说明没有选择任何父级分类
      if (this.selectedKeys.length > 0) {
        // 说明选择了父级分类，需要更新一下父分类id（ cat_pid）
        // 我们永远取最后一个 id 作为父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 还需要更新一下分类层级，id有几个(length长度)，就证明是第几层分类
        this.addCateForm.cat_level = this.selectedKeys.length
        // eslint-disable-next-line no-useless-return
        return
      } else {
        // 如果没有选择任何的分类，就将 cat_pid、cat_level 都重置为0
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加分类
    addCate () {
      // console.log(this.addCateForm)
      // 提交添加信息之前，先对表单进行预验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          // eslint-disable-next-line no-useless-return
          return
        }
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!')
        }
        this.getCateList()
        this.addCateDialogVisible = false
        this.$message.success('添加分类成功!')
      })
    },
    // 监听对话框的关闭，然后将表单中的数据重置
    addCateDialogClosed () {
      // 清除表单
      this.$refs.addCateFormRef.resetFields()
      // 清除级联选择框
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 点击修改按钮，展示修改分类的对话框
    // 一点开修改分类对话框，就应该展示出原来的分类名字
    async showEditCateDialog (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询分类失败!')
      // console.log(res.data)
      this.editCateForm = res.data
      // console.log(this.editCateForm)
      this.editCateDialogVisible = true
    },
    // 点击确定按钮，重新提交修改后的表单
    async editCate () {
      const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
        cat_id: this.editCateForm.cat_id,
        cat_name: this.editCateForm.cat_name
      })
      if (res.meta.status !== 200) return this.$message.error('修改失败!')
      this.getCateList()
      this.editCateDialogVisible = false
      this.$message.success('修改成功!')
    },
    // 根据id，删除分类
    async removeCateById (id) {
      // 删除前先弹出确认是否删除对话框
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }
      this.getCateList()
      this.$message.success('删除成功!')
    }
  }
}
</script>

<style lang="less" scoped>
.TreeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}

</style>
