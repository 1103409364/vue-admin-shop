<template>
  <div class="roles">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">
            添加角色
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <!-- expand 可展开的权限列表 -->
        <el-table-column label="#" type="expand">
          <template v-slot:default="slotProps">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '']"
              class="vcenter"
              v-for="(item1, i1) in slotProps.row.children"
              :key="item1.id"
            >
              <!-- 第一列 渲染一级权限 一行分为 24 单位-->
              <el-col :span="5">
                <el-tag closable @close="removeRight(slotProps.row, item1.id)">
                  {{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第二列 渲染二\三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop']"
                  class="vcenter"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRight(slotProps.row, item2.id)"
                    >
                      {{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRight(slotProps.row, item3.id)"
                    >
                      {{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ slotProps.row }}</pre> -->
          </template>
        </el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot:default="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoleDialog(slotProps.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoleDialog(slotProps.row)"
            >
              删除
            </el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(slotProps.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加/编辑角色的 dialog-->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="closeAddDialog"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addForm"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditOrAdd">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="30%"
    >
      <!-- 选中值，用 node-key 指定 default-expand-all 默认展开,default-checked-keys 默认选中-->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        :default-checked-keys="defkeys"
        show-checkbox
        node-key="id"
        default-expand-all
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'roles',
  data() {
    return {
      rolesList: [],
      rightsList: [],
      //树形控件绑定对象，定义数据格式
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中权限的 id 值数组
      defkeys: [],
      // 当前编辑/配置 id
      roleId: '',
      // 添加用户表单
      addForm: {},
      addFormRules: {
        roleName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
      },
      setRightDialogVisible: false,
      addDialogVisible: false,
      isEdit: false,
      dialogTitle: ''
    };
  },
  methods: {
    async getRolesList() {
      const res = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }

      this.rolesList = res.data;
    },
    removeRight(role, rightId) {
      this.$confirm('此操将删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          if (res === 'confirm') {
            this.removeRightById(role, rightId);
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      // console.log(arg);
    },
    async removeRightById(role, rightId) {
      // 删除成功后返回最新的权限
      const res = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }

      this.$message.success(res.meta.msg);

      // 重新获取列表会导致展开的权限又合上
      // this.getRolesList();

      // 改为只更新当前角色下的权限
      role.children = res.data;
    },
    // 显示设置权限 dialog
    async showSetRightDialog(role) {
      this.roleId = role.id;
      const res = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.rightsList = res.data;
      // 清除旧的数据，递归获取权限
      this.defkeys = [];
      this.getLeafKeys(role, this.defkeys);
      this.setRightDialogVisible = true;
    },
    // 显示编辑
    showEditRoleDialog(role) {
      this.dialogTitle = '编辑角色';
      this.isEdit = true;
      this.addDialogVisible = true;
      this.roleId = role.id;
      this.addForm = { ...role };
    },
    showAddDialog() {
      this.addDialogVisible = true;
    },
    confirmEditOrAdd() {
      this.isEdit && this.confirmEditRole();
      !this.isEdit && this.confirmAddRole();
    },
    async confirmEditRole() {
      const res = await this.$http.put(`roles/${this.roleId}`, this.addForm);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getRolesList();
      this.addDialogVisible = false;
    },
    // 删除角色
    deleteRoleDialog(role) {
      this.$confirm('此操将删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          if (res === 'confirm') {
            this.removeRoleById(role.id);
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    async removeRoleById(id) {
      const res = await this.$http.delete(`roles/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getRolesList();
    },
    // 递归获取已有权限 id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    // 分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr = keys.join(',');

      const res = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      });

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.setRightDialogVisible = false;
      this.getRolesList();
    },
    async confirmAddRole() {
      const res = await this.$http.post('roles', this.addForm);
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getRolesList();
      this.addDialogVisible = false;
    },
    closeAddDialog() {
      this.isEdit = false;
      this.addForm = {};
      this.$refs.addForm.resetFields();
    }
  },
  created() {
    this.getRolesList();
  }
};
</script>

<style lang="stylus" scoped>
.roles
  .el-tag
    margin: 7px
  .bdtop
    border-top: 1px solid #EBEEF5
  .bdbottom
    border-bottom: 1px solid #EBEEF5
  .vcenter
    display flex
    align-items center
</style>
