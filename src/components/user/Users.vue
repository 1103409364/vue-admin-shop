<template>
  <div class="users">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 可清空输入框 clearable，点击触发 clear-->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">
            添加用户
          </el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userList" width="100%" border stripe>
        <el-table-column label="#" type="index" />
        <el-table-column label="姓名" prop="username" />
        <el-table-column label="邮箱" prop="email" />
        <el-table-column label="电话" prop="mobile" />
        <el-table-column label="角色" prop="role_name" />
        <el-table-column label="状态">
          <!-- 作用域插槽覆盖 prop -->
          <template v-slot:default="slotProps">
            <el-switch
              @change="userStatechange(slotProps.row)"
              v-model="slotProps.row.mg_state"
              active-color="#13ce66"
              inactive-color="#eee"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="slotProps">
            <el-tooltip
              class="item"
              effect="dark"
              content="编辑"
              placement="top"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="edit(slotProps.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除"
              placement="top"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="del(slotProps.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(slotProps.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户的 dialog-->
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
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色 dialog-->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p class="setrole-item">当前的用户：{{ userInfo.username }}</p>
        <p class="setrole-item">当前的角色：{{ userInfo.role_name }}</p>
        <p class="setrole-item">
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <!-- label显示的选项，value 真正选中的值id -->
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSetRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义验证规则
    // 验证邮箱
    let checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error('请输入合法的邮箱'));
    };
    // 验证手机号
    let checkMobile = (rule, value, cb) => {
      const regMobile = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error('请输入合法的手机号'));
    };
    return {
      queryInfo: {
        query: '',
        // 当前页
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      dialogTitle: '',
      // 添加用户表单
      addForm: {},
      // 添加表单验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      isEdit: false,
      setRoleDialogVisible: false,
      // 当前编辑用户
      userInfo: {},
      // 所有角色列表
      rolesList: [],
      selectedRoleId: ''
    };
  },
  methods: {
    async getUserList() {
      const res = await this.$http.get('users', { params: this.queryInfo });
      if (res.data) {
        this.userList = res.data.users;
        this.total = res.data.total;
      }
    },
    async userStatechange(userinfo) {
      const res = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
        userinfo.mg_state = !userinfo.mg_state;
        return;
      }
      this.$message.success(res.meta.msg);
    },
    // 编辑用户信息
    edit(arg) {
      this.addDialogVisible = true;
      this.addForm = { ...arg };
      this.isEdit = true;
      // console.log(arg);
    },
    del(arg) {
      this.$confirm('此操将删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          if (res === 'confirm') {
            this.deleteUser(arg.id);
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
    async setRole(arg) {
      this.userInfo = arg;
      // 获取角色列表
      const res = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
        return;
      }
      this.rolesList = res.data;
      this.setRoleDialogVisible = true;
    },
    // 确定分配角色
    async confirmSetRole() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！');
      }

      const res = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      });

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    // 关闭对话框，重置数据
    setRoleDialogClosed() {
      this.selectedRoleId = '';
      this.userInfo = {};
    },
    // 监听 pageSize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.queryInfo.pagenum = 1;
      this.getUserList();
    },
    // 监听页码改变事件
    handleCurrentChange(page) {
      this.queryInfo.pagenum = page;
      this.getUserList();
    },
    // 添加用户对话框关闭时触发
    closeAddDialog() {
      this.isEdit = false;
      this.addForm = {};
      this.$refs.addForm.resetFields();
    },
    confirm() {
      this.$refs.addForm.validate(async valid => {
        if (!valid) return;

        !this.isEdit && this.addUser();
        this.isEdit && this.editUser();
      });
    },
    async addUser() {
      const res = await this.$http.post('users', this.addForm);
      if (res.meta.status !== 201) {
        this.$message.error(res.meta.msg);
        return;
      }

      this.$message.success(res.meta.msg);
      this.addDialogVisible = false;
      // 回第一页
      this.queryInfo.pagenum = 1;
      this.getUserList();
    },
    async deleteUser(id) {
      const res = await this.$http.delete('users/' + id);
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
        return;
      }
      this.$message.success(res.meta.msg);
      this.queryInfo.pagenum = 1;
      this.getUserList();
    },
    async editUser() {
      const res = await this.$http.put('users/' + this.addForm.id, {
        email: this.addForm.email,
        mobile: this.addForm.mobile
      });
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
        return;
      }

      this.$message.success(res.meta.msg);
      this.addDialogVisible = false;
      // 回第一页
      this.queryInfo.pagenum = 1;
      this.getUserList();
    }
  },
  created() {
    this.getUserList();
  }
};
</script>

<style lang="stylus" scope>
// .text
//   font-size: 14px
// .item
//   padding: 18px 0
// .box-card
//   width: 98%
.setrole-item
  margin-bottom 20px
</style>
