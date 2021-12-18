<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button icon="el-icon-plus" type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
        <el-table :data="roleList" border stripe>
          <!-- 给表格添加展开列 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <!-- 利用栅格系统进行布局 -->
              <!-- i1 === 0 ? 'bdtop' : '' 如果索引为0,则按需展示bdtop,否则展示空 -->
              <!-- 渲染一级权限 -->
              <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <el-col :span="5">
                  <el-tag closable @close="removeRightsById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级和三级权限 -->
                <el-col :span="19">
                  <!-- 用 v-for 循环渲染二级权限 -->
                  <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeRightsById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightsById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <!-- <pre>
                {{scope.row}}
              </pre> -->
            </template>
          </el-table-column>
          <!-- 给表格添加索引列 -->
          <el-table-column type="index"></el-table-column>
            <!-- prop属性来对应对象中的键名即可填入数据 -->
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="290px">
            <!-- 通过作用域插槽来获取当前行的信息 -->
            <template slot-scope="scope">
              <!-- 修改按钮 -->
                  <!-- @click="showEditDialog(scope.row.id) 实现点击修改按钮获取用户之前的表单数据 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">删除</el-button>
              <!-- 分配权限按钮 -->
                <!-- tooltip 添加文字提示功能 -->
              <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
              </el-tooltip>
            </template>
          </el-table-column>
      </el-table>

      <!-- dialog 添加角色对话框区域 -->
      <el-dialog
        title="提示"
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
        <!-- 表单内容主体区域 -->
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
        <!-- 表单底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addroles">确 定</el-button>
        </span>
      </el-dialog>

      <!-- dialog 修改角色对话框区域 -->
      <el-dialog
        title="提示"
        :visible.sync="editDialogVisible"
        width="50%">
        <!-- 修改角色信息表单的内容主体区域 -->
        <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editroles">确 定</el-button>
        </span>
      </el-dialog>

      <!-- dialog 分配角色权限对话框区域 -->
      <el-dialog
      title="提示"
      :visible.sync="SetRightDialogVisible"
      width="50%"
      @close="SetRightDialogClosed">
      <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 保存用户的列表信息
      roleList: [],

      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 添加角色表单的验证规则对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '角色名称的长度在1~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '角色描述的长度在1~10个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 添加角色的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },

      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的角色信息对象(必须将查询到的信息保存在这里)
      editRoleForm: [],
      // 修改角色表单的验证规则对象
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '角色名称的长度在1~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '角色描述的长度在1~10个字符之间',
            trigger: 'blur'
          }
        ]
      },

      // 控制分配权限对话框的显示与隐藏
      SetRightDialogVisible: false,
      // 查询到的角色权限信息对象(必须将查询到的信息保存在这里)
      rightList: [],
      // 树形控件属性
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配角色权限的id
      roleId: ''
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取用户的列表信息
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户的列表失败!')
      }
      this.roleList = res.data
      console.log(this.roleList)
    },
    // 监听表单关闭后，清空表单中填写的信息
    addDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 点击按钮，添加角色
    addroles () {
      // 发起提交操作之前先判断表单验证是否通过
      this.$refs.addRoleFormRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        // 可以发起添加角色的网络请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败!')
        // 关闭对话框
        this.addDialogVisible = false
        // 添加完成后要重新更新一下列表
        this.getRoleList()
        // 提示用户添加成功
        this.$message.success('添加角色成功!')
      })
    },

    // 点击修改按钮,展示编辑角色信息的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败!')
      }
      // 将数据存到 editRoleForm 中,方便表单用v-model读取原先的数据
      this.editRoleForm = res.data
      // 获取获取完毕后,打开对话框
      this.editDialogVisible = true
    },
    // 点击确定按钮,提交修改后的表单信息
    async editroles () {
      // 修改完成后，发起提交操作之前先判断表单验证是否通过
      this.$refs.editRoleFormRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        )
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('提交修改失败!')
        }
        // 修改成功后关闭对话框
        this.editDialogVisible = false
        // 修改成功后需要重新渲染一下列表
        this.getRoleList()
        this.$message.success('修改成功!')
      })
    },
    // 根据 id 删除对应的用户信息
    async removeUserById (id) {
      // 弹窗询问用户是否要删除 (MessageBox 组件)
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }
      this.$message.success('删除成功!')
      // 删除成功之后需要重新请求一遍列表
      this.getRoleList()
    },
    // 根据id删除对应的权限
    async removeRightsById (role, righstId) {
    // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${righstId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }
      // console.log(res)
      // 因为返回的data, 是当前角色下最新的权限数据,所以直接赋值即可
      role.children = res.data
      // 这种方法不可取,会重新渲染整个角色列表
      // this.getRoleList()
    },
    // 点击按钮,展示分配权限的对话框
    async showSetRightDialog (role) {
      // 把角色id先存进去
      this.roleId = role.id
      // 获取所有的权限列表
      const { data: res } = await this.$http.get('rights/tree ')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败!')
      }
      // console.log(res)
      this.rightList = res.data

      // (难点!!!)递归获取三级权限的id
      // role 这个形参可以接受到 scope.row这一行下面所有的分级菜单
      this.getLeafKeys(role, this.defKeys)
      // 数据请求完毕后,打开对话框
      this.SetRightDialogVisible = true
    },
    // (难点!!!)通过递归的形式,获取角色下所有三级权限的id,并保存到 defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果当前 node节点不包含 children 属性,则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果不是三级节点,就循环遍历直到找出所有的三级节点并添加到数组中
      node.children.forEach(item =>
        this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件,并清空保存到数组中的权限
    // 解决bug:关闭对话框之后,保存到数组中的权限没有清除,导致下一个用户会叠加出现所有的权限,这样权限就会越攒越多
    SetRightDialogClosed () {
      this.defKeys = []
    },
    // 点击确定按钮,提交分配的权限给服务器(调用tree组件中的两个方法,将获取到的全选中和半选中的节点id,存到数组中----请求参数：通过 `请求体rids` 发送给后端)
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      // 以 `,` 分割的权限 ID 列表（获取所有被选中、叶子节点的key和半选中节点的key, 包括 1，2，3级节点）
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败!')
      }
      this.getRoleList()
      // 更新完数据后关闭对话框
      this.SetRightDialogVisible = false
      this.$message.success('分配权限成功!')
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
