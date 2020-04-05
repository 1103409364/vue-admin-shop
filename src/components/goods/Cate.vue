<template>
  <div class="cate">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">
            添加分类
          </el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="treetable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
      >
        <!-- 是否有效 tree-table 不支持 v-slot -->
        <template slot="isok" slot-scope="slotProps">
          <i
            class="el-icon-success"
            v-if="slotProps.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="slotProps">
          <el-tag size="mini" type="" v-if="slotProps.row.cat_level === 0"
            >一级</el-tag
          >
          <el-tag
            size="mini"
            type="success"
            v-else-if="slotProps.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="slotProps">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(slotProps.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="delCate(slotProps.row)"
          >
            删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加分类dialog -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        @close="addCateDialogClosed"
        width="50%"
      >
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：" prop="cat_name" v-show="!isEdit">
            <!-- options 数据 -->
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="{
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: true
              }"
              @change="parentCateChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmAddOrEdit">
            确 定
          </el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'cate',
  data() {
    return {
      cateList: [],
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 树形表格配置列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        // 使用作用域插槽
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 分类父 id，默认一级分类
        cat_pid: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      // 选中的父级分类id
      selectedKeys: [],
      isEdit: false,
      cat_id: ''
    };
  },
  props: {
    name: String
  },
  methods: {
    // 获取商品分类数据。get 需要 params 字段放参数
    async getCateList() {
      const res = await this.$http.get('categories', { params: this.querInfo });
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
        return;
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
      // this.$message.success(res.meta.msg);
    },
    // pageSize 改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    // pageNum 改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
    showAddCateDialog() {
      this.isEdit = false;
      this.addCateDialogVisible = true;
      this.getParentCateList();
    },
    // 获取父级分类数据
    async getParentCateList() {
      const res = await this.$http.get('categories', { params: { type: 2 } });
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
        return;
      }

      this.parentCateList = res.data;
    },
    // 选择项发生变化触发。分类名称输入框不确定是二级还是三级分类，待父级分类选中时确定
    parentCateChange() {
      // selectedKeys length > 0，选中了父级分类，设置父级分类的id和分类等级
      let len = this.selectedKeys.length;
      if (len > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[len - 1];
        this.addCateForm.cat_level = len;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    async addCate() {
      const res = await this.$http.post('categories', this.addCateForm);

      if (res.meta.status !== 201) {
        this.$message.error(res.meta.msg);
        return;
      }
      this.getCateList();
      this.addCateDialogVisible = false;
    },
    async editCate() {
      const res = await this.$http.put(`categories/${this.cat_id}`, {
        cat_name: this.addCateForm.cat_name
      });

      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
        return;
      }
      this.getCateList();
      this.addCateDialogVisible = false;
    },
    showEditDialog(row) {
      console.log(row);
      this.cat_id = row.cat_id;
      this.isEdit = true;
      this.addCateForm.cat_name = row.cat_name;
      this.addCateDialogVisible = true;
    },
    // 确定按钮
    confirmAddOrEdit() {
      this.$refs.addCateFormRef.validate(valid => {
        if (!valid) return;
        !this.isEdit && this.addCate();
        this.isEdit && this.editCate();
      });
    },
    delCate(row) {
      this.$confirm('此操将删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async res => {
          if (res === 'confirm') {
            // this.deleteUser(arg.id);
            const res = await this.$http.delete(`categories/${row.cat_id}`);
            if (res.meta.status !== 200) {
              this.$message.error(res.meta.msg);
              return;
            }
            this.$message.success(res.meta.msg);
            this.querInfo.pagenum = 1;
            this.getCateList();
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
    // 关闭dialog
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    }
  },
  created() {
    this.getCateList();
  }
};
</script>

<style lang="stylus" scoped>
.treetable
  margin-top 15px
.el-cascader
  width 100%
</style>
