<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        effect="dark"
        :closable="false"
        show-icon>
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <!-- :options 指定数据源 -->
            <!-- :props 用来指定配置对象 -->
             <el-cascader
              v-model="selectedCateKeys"
              :options="catelist"
              :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children'}"
              @change="handleChanged"
              clearable>
              </el-cascader>

        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">动态参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableDate" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 添加按钮 -->
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- {{scope.row}} -->
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParamsById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态参数面板 -->
        <el-tab-pane label="静态属性" name="only">
           <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">静态属性</el-button>
           <!-- 静态属性表格 -->
           <el-table :data="onlyTableDate" border stripe>
             <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 添加按钮 -->
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParamsById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
           </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- dialog添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- dialog修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created () {
    // 获取商品分类数据列表
    this.getCateList()
  },
  data () {
    return {
      // 获取到的商品分类数据列表
      catelist: [],
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 保存动态参数
      manyTableDate: [],
      // 保存静态属性
      onlyTableDate: [],

      // 控制添加参数的对话框的显示与隐藏
      addDialogVisible: false,

      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数的表单验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入合法的参数名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {},
      // 修改参数的表单验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入合法的参数名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      }
      // 不能在data这里定义这两个属性,因为会造成输入框的联动效果（每一行的数据共用了同一个布尔值和value值）
      // 控制按钮与文本框的切换显示
      // inputVisible: false,
      // 文本框中输入的内容
      // inputValue: ''

    }
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据列表失败!')
      }
      this.catelist = res.data
      // console.log(res.data)
      this.$message.success('获取商品分类数据列表成功!')
    },
    // 级联选择框中项发生变化,会触发这个函数
    async handleChanged () {
      // 证明选中的不是三级分类(注意:以下代码在新版element-ui中不生效.因为新版默认只能选中三级分类)
      // if (this.selectedCateKeys.length !== 3) {
      //   this.selectedCateKeys = []
      //   return
      // }
      // 证明选中的是三级分类
      this.getParamsDate()
    },
    // Tab 页签点击事件的处理函数
    handleTabClick () {
      // console.log(this.activeName)
      // console.log(this.cateId)
      this.getParamsDate()
    },
    // 获取参数的列表数据(将获取参数的请求封装成一个独立的函数,调用就可以)
    async getParamsDate () {
      // console.log(this.selectedCateKeys)
      // 根据所选分类的id,和当前所处的面板,获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.info('只允许为第三级分类设置参数!')
      }
      // console.log(res.data)
      // 循环遍历 res.data ,将其中的 attr_vals 字符串用空格分割,返回一个字符串数组
      res.data.forEach(item => {
        // item.attr_vals ? item.attr_vals.split(' ') : [] 解决分割一个空字符串,也会返回一个包含空格的数组bug
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每一行都添加一个自己的inputVisible 和 inputValue,防止共用同一个布尔值和value值，然后在循环的时候，分别绑定到自己这一行的布尔值和value值上面就行了
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      // console.log(res.data)

      // 做一下判断,将动态参数和静态属性分别存入不同的data中
      if (this.activeName === 'many') {
        this.manyTableDate = res.data
      } else {
        this.onlyTableDate = res.data
      }
      // this.$message.success('获取参数成功!')
    },
    // 监听添加参数的dialog对话框关闭事件,并清空表单中的数据
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮,提交添加的参数信息到服务器
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          // eslint-disable-next-line no-useless-return
          return
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败!')
        }
        this.getParamsDate()
        this.addDialogVisible = false
        this.$message.success('添加参数成功!')
      })
    },
    // 点击编辑按钮,展示修改对话框,并获取表单原先的数据
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数失败!')
      }
      this.editForm = res.data
      // this.$message.success('查询参数成功!')
      this.editDialogVisible = true
    },
    // 监听添加参数的dialog对话框关闭事件,并清空表单中的数据
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定按钮,提交修改的参数信息到服务器
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          // eslint-disable-next-line no-useless-return
          return
        }
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.editForm.attr_sel
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败!')
        }
        this.getParamsDate()
        this.editDialogVisible = false
        this.$message.success('修改成功!')
      })
    },
    // 点击删除按钮,根据id删除对应的参数
    async removeParamsById (id) {
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
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }
      this.getParamsDate()
      this.$message.success('删除成功!')
    },
    // 文本框失去焦点或按下了 enter 键都会触发
    async handleInputConfirm (row) {
      // 首先要判断用户输入的内容是否合法
      if (row.inputValue.trim().length === 0) {
        // 不合法将输入框中的内容清空
        row.inputValue = ''
        // 失去焦点之后，让其重新显示出tag框
        row.inputVisible = false
        // 不合法不需要再做任何操作,就return出去
        return
      }
      // 否则则说明用户输入的内容是合法的,此时需要提交到 attr_vals 这个数组中
      row.attr_vals.push(row.inputValue.trim())
      // 再重置inputValue
      row.inputValue = ''
      // 最后再关闭tag输入框
      row.inputVisible = false

      // 最终将数据提交到服务器中
      this.saveAttrVals(row)
    },
    // 将提交新参数到服务器的代码抽离出来
    async saveAttrVals (row) {
      // attr_vals: row.attr_vals.join(' ') 此时前端展示的是一个数组,需要用join方法重新将其拼接为字符串,传回后端
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('添加参数失败!')
      }
      this.$message.success('添加参数成功!')
    },
    // 删除对应参数的可选项
    handleClose (i, row) {
      // i 代表索引 row代表这行数码,因为要从attr_vals里删
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    // 点击按钮,展示文本输入框,
    showInput (row) {
      // 拿到该行的数据进行操作就行了，不需要this
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上的元素被重新渲染之后，才会指定回调函数中的代码（等待一个时机！！！）
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }

  },
  // 计算属性
  computed: {
    // 如果按钮需要被禁用,则返回true,否则返回 false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 保存当前选中的三级分类的id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态展示dialog标题
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 20px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>
