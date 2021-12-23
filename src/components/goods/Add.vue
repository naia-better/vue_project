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
      <!-- 消息提示 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false">
      </el-alert>
      <!-- 步骤条区域 -->
      <!-- 注意：:active="activeIndex" 只能接受数字类的数据，所以将字符串变成数字最简单的方法是 :active="activeIndex - 0" -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab 栏区域 -->
      <!-- 注意：v-model="activeIndex" 只能接受字符串类的数据 -->
      <!-- 要实现联动的效果，二者只需要使用同一个 activeIndex 就行了 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforTabLeave" @tab-click="tabCilcked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 选择商品分类的级联选择框 -->
          <!-- :options 指定数据源 -->
            <!-- :props 用来指定配置对象 -->
             <el-cascader
              v-model="addForm.goods_cat"
              :options="catelist"
              :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children'}"
              @change="handleChanged"
              clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 循环渲染商品的动态参数 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 多选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 循环渲染商品的静态属性 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片的组件 -->
            <!-- 注意:此处并未发起携带 token 的ajax请求,会导致"无效的token错误".需要在请求头中手动添加token -->
            <el-upload
              action='http://127.0.0.1:8888/api/private/v1/upload'
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess">
              <!-- handleSuccess 我们需要把服务器中存放的图片添加到前端表单中才算完事 -->
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 使用富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- dialog 预览图图片的对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%">
      <img :src="previewPath" alt="" style="width: 100%">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  created () {
    this.getCateList()
  },
  data () {
    return {
      // tab 栏和进度条联动效果
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_number: '',
        goods_price: 0,
        goods_weight: 0,
        // eslint-disable-next-line no-dupe-keys
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片信息数组
        pics: [],
        // 富文本编辑器区域的商品介绍
        goods_introduce: '',
        // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
        attrs: []
      },
      // 添加表单的表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      },
      // 将获取到的所有商品分类数据列表保存在这里
      catelist: [],
      // 获取到的动态参数列表信息
      manyTableData: [],
      // 获取到的静态属性列表信息
      onlyTableData: [],
      // 上传图片的URL
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 配置图片上传的请求头,解决无效的token错误
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 保存图片的url
      previewPath: '',
      // 控制图片预览对话框的显示与隐藏
      previewDialogVisible: false
    }
  },
  methods: {
    // 获取所有的商品分类数据列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据列表失败!')
      }
      this.catelist = res.data
      console.log(this.catelist)
      this.$message.success('获取商品分类数据列表成功!')
    },
    // 级联选择器选中项变化，会触发这个函数
    handleChanged () {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.info('只允许为第三级分类设置参数!')
      }
    },
    beforTabLeave (activeName, oldActiveName) {
      // console.log('即将离开的那个标签' + oldActiveName)
      // console.log('即将进入的那个标签' + activeName)
      if (activeName !== '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.info('请先选择商品分类')
        return false
      }
    },
    // 当点击切换 tab时,触发这个函数,同时发起动态参数的网络请求
    async tabCilcked () {
      // console.log(this.activeIndex)
      // 如果激活项等于一,则证明切换到了商品参数面板,可以发起请求
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数失败!')
        }
        // 将字符串转换成数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
        this.$message.success('获取参数成功!')
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数失败!')
        }
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
        this.$message.success('获取参数成功!')
      }
    },
    // 预览图片
    handlePreview (file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 删除图片
    handleRemove (file) {
      // console.log(file)
      // 1. 获取将要删除图片的额临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从pics数组中,找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组的 splice方法,把图片信息对象,从 pics 数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 图片上传成功时,将其保存在服务器的图片地址push到pics数组中
    handleSuccess (response) {
      // 1. 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2. 将图片信息对象,push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm.pics)
    },
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项!')
        }
        // 可以发起添加商品的网络请求
        // 注意：执行到下面这行代码会报错，原因是级联选择框中v-model必须绑定到数组身上，而下面的这行代码会将数组重新拼接为字符串，于是就产生了分歧。解决办法：利用深拷贝，复制出来一模一样的一个数组，对这个数组操作就行了，不会影响到原来的级联选择框。
        // 用到一个包：lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        // 将操作后的attrs数组赋值给拷贝对象form
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起添加商品的网络请求
        // 注意:商品的名称应该是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败!')
        }
        this.$message.success('添加商品成功!')
        this.$router.push('/goods')
      })
    }
  },
  // 保存当前选中的三级分类的id
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.btnAdd {
  margin-top: 15px;
}
</style>
