<template>
  <div class="params">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cate-row">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器 options 数据， props 配置-->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children'
            }"
            @change="cateChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页标签 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            @click="showAddDialog"
            :disabled="isBtnDisable"
          >
            添加参数
          </el-button>
          <!-- 动态参数table -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column label="+" type="expand">
              <template v-slot="slotProps">
                <el-tag
                  v-for="(item, index) in slotProps.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleTagClose(index, slotProps.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 添加 tag -->
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column label="#" type="index"> </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
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
                  @click="deleteParams(slotProps.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            @click="showAddDialog"
            :disabled="isBtnDisable"
          >
            添加属性
          </el-button>
          <!-- 静态属性table -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开效果 -->
            <el-table-column label="+" type="expand">
              <template v-slot="slotProps">
                <el-tag
                  v-for="(item, index) in slotProps.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleTagClose(index, slotProps.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 添加 tag -->
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column label="#" type="index"> </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
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
                  @click="deleteParams(slotProps.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数/添加属性 dialog -->
    <el-dialog
      :title="`${this.isEdit ? '修改' : '添加'}${titleText}`"
      :visible.sync="dialogVisible"
      @close="handleDialogClose"
      width="50%"
    >
      <el-form
        :model="dialogForm"
        :rules="dialogFormRules"
        ref="dialogFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="dialogForm.attr_name"></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirm">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'params',
  data() {
    return {
      cateList: [],
      // 级联选择器选中的分类
      selectedCateKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      dialogVisible: false,
      dialogForm: {
        attr_name: ''
      },
      dialogFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      isEdit: false
      // new-tag 文本框的状态,改为加到 item 上
      // inputVisible: false,
      // inputValue: ''
    };
  },
  computed: {
    isBtnDisable() {
      return this.selectedCateKeys.length !== 3;
    },
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性';
    }
  },
  methods: {
    // 获取所有分类，不传type默认获取所有分类
    async getCateList() {
      const res = await this.$http.get('categories');
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.cateList = res.data;
    },
    //分类改变
    cateChange() {
      this.getParams();
    },
    // 切换面板
    handleTabClick() {
      if (this.isBtnDisable) return;
      this.getParams();
    },
    // 获取动态属性或者静态参数
    async getParams() {
      if (this.selectedCateKeys.length !== 3) {
        // 选中非三级分类,清空数据
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      const res = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
        // 控制 new-tag 文本框的显示与隐藏, 解决 v-for 绑定同一个变量引起的 bug
        item.inputVisible = false;
        item.inputValue = '';
      });

      if (this.activeName === 'many') {
        this.manyTableData = res.data;
        return;
      }
      this.onlyTableData = res.data;
    },
    showAddDialog() {
      this.dialogVisible = true;
      this.isEdit = false;
    },
    handleDialogClose() {
      this.$refs.dialogFormRef.resetFields();
    },
    // dialog 确定按钮
    confirm() {
      this.$refs.dialogFormRef.validate(valid => {
        if (!valid) return;
        !this.isEdit && this.addParams();
        this.isEdit && this.editParams();
      });
    },
    async addParams() {
      const res = await this.$http.post(
        `categories/${this.cateId}/attributes`,
        {
          attr_name: this.dialogForm.attr_name,
          attr_sel: this.activeName
        }
      );
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getParams();
      this.dialogVisible = false;
    },

    showEditDialog(row) {
      this.dialogVisible = true;
      this.isEdit = true;
      this.dialogForm.attr_name = row.attr_name;
      this.dialogForm.attr_id = row.attr_id;
      // console.log(row);
    },
    // 编辑属性/参数 名称
    async editParams() {
      const res = await this.$http.put(
        `categories/${this.cateId}/attributes/${this.dialogForm.attr_id}`,
        {
          attr_name: this.dialogForm.attr_name,
          attr_sel: this.activeName
          // attr_vals: this.attr_vals
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getParams();
      this.dialogVisible = false;
    },
    // 编辑/新增属性值
    async saveAttrVals(row, item, i, isDel) {
      const res = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' ')
        }
      );
      if (res.meta.status !== 200) {
        // 添加失败,去除这个 tag
        !isDel && row.attr_vals.pop();
        // 删除失败,加回这个 tag
        isDel && row.attr_vals.splice(i, 0, item);
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
    },
    // row 通过作用域插槽获取的当前行数据
    async deleteParams(row) {
      this.$confirm('此操将删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async res => {
          if (res === 'confirm') {
            const res = await this.$http.delete(
              `categories/${this.cateId}/attributes/${row.attr_id}`
            );
            if (res.meta.status !== 200) {
              this.$message.error(res.meta.msg);
              return;
            }
            this.$message.success(res.meta.msg);
            this.getParams();
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    // new-tag 相关事件
    // 文本框 blur 或者按下 enter
    async handleInputConfirm(row) {
      row.inputVisible = false;
      row.inputValue = row.inputValue.trim();
      if (row.inputValue.length === 0) {
        row.inputValue = '';
        return;
      }
      row.attr_vals.push(row.inputValue);
      row.inputValue = '';
      this.saveAttrVals(row);
    },
    // 显示 new-tag 输入框
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick(() => {
        // 输入框自动获得焦点,在 dom 更新完成时获取 input
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除tag
    handleTagClose(i, row) {
      let item = row.attr_vals.splice(i, 1);
      // 传 item 过去,删除失败添加回来
      this.saveAttrVals(row, item[0], i, true);
    }
  },
  created() {
    this.getCateList();
  }
};
</script>

<style lang="stylus" scoped>
.cate-row
  margin-top 15px
.el-tag
  margin-right 10px
.input-new-tag
  width 150px
</style>
