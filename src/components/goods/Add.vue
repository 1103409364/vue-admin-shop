<template>
  <div class="add">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-alert
        title="添加商品信息"
        center
        show-icon
        :closable="false"
      ></el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="+activeIndex"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 垂直tab栏 每个tab都有一部分表单 用 el-form 包裹-->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- before-leave 切换标签时触发 -->
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 options 数据， props 配置-->
              <el-cascader
                v-model="addForm.goods_cat"
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
            </el-form-item>
          </el-tab-pane>
          <!-- 动态参数表单列表 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyTableData"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(item2, index) in item.attr_vals"
                  :key="index"
                  :label="item2"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 静态属性表单列表-->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="fileList"
              :headers="headerObj"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce" />
            <el-button class="addbtn" type="primary" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 dialog -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="preview" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'add',
  data() {
    return {
      activeIndex: '0',
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      fileList: [],
      headerObj: { Authorization: window.sessionStorage.getItem('token') },
      // 添加商品表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        pics: [],
        goods_cat: [], //提交的是 , 分隔的字符串,
        goods_introduce: '',
        attrs: []
      },
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
          { required: true, message: '请输选择商品分类', trigger: 'blur' }
        ]
      },
      cateList: [],
      manyTableData: [], //动态参数列表数据
      onlyTableData: [],
      previewPath: '',
      previewVisible: false,
      isEdit: false,
      goods_id: ''
    };
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  },
  methods: {
    async getCateList() {
      const res = await this.$http.get('categories');
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
      }

      this.cateList = res.data;
    },
    // 级联选择器变化时触发
    cateChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // 离开tab事件
    beforeTabLeave(activeName, oldActiveName) {
      console.log(activeName, oldActiveName);
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类');
        return false;
      }
    },
    // tab 点击事件
    tabClick() {
      // tab 0 基本信息，tab 1 动态参数
      if (this.activeIndex === '1') {
        this.getGoodsCate('many');
      } else if (this.activeIndex === '2') {
        this.getGoodsCate('only');
      }
    },
    // 根据选中分类来获取动态参数列表/静态属性列表
    async getGoodsCate(sel) {
      if (this.isEdit) return;
      const res = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel
        }
      });
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
      }
      if (sel === 'many') {
        // attr_vals字符串转数组
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ');
        });

        this.manyTableData = res.data;
      }

      if (sel === 'only') {
        this.onlyTableData = res.data;
      }
    },
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex(item => item.pic === filePath);
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 图片上传成功
    handleSuccess(res) {
      // 拼接得到图片信息对象
      const picInfo = { pic: res.data.tmp_path };
      // 将图片 push 到 pics
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    add() {
      // this.addForm
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单填写不完整');
        }

        // 处理动态参数、静态属性
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          };
          this.addForm.attrs.push(newInfo);
        });
<<<<<<< HEAD

=======
>>>>>>> 038211263e4fb19b8583575be94616f13346633e
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals };
          this.addForm.attrs.push(newInfo);
        });

        // 提交表单，是否需要使用 loadsh 进行深拷贝？
        const addForm = { ...this.addForm };
        addForm.goods_cat = addForm.goods_cat.join(',');

        if (!this.isEdit) {
          const res = await this.$http.post('goods', addForm);
          if (res.meta.status !== 201) {
            this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.$router.push('/goods');
        } else {
          // TODO: 编辑功能 图片回填，分类回填 未完成
          const res = await this.$http.put(`goods/${this.goods_id}`, addForm);
          if (res.meta.status !== 201) {
            this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.$router.push('/goods');
        }

        // console.log(addForm);
      });
    },
    async getGoodsInfo() {
      const res = await this.$http.get(`goods/${this.goods_id}`);
      const data = res.data;
      data.goods_cat = data.goods_cat.split(',');
      console.log(data);

      let many = [];
      let only = [];
      data.attrs.forEach(item => {
        if (item.attr_sel === 'many') {
          item.attr_vals = item.attr_vals.split(' ');
          many.push(item);
        }

        if (item.attr_sel === 'only') {
          item.attr_vals = item.attr_value;
          only.push(item);
        }
      });

      this.manyTableData = [...many];
      this.onlyTableData = [...only];

      this.addForm = { ...res.data };
    },
    // 编辑回填表单
    backfillData() {
      if (this.$route.query.goods_id) {
        this.isEdit = true;
        this.goods_id = +this.$route.query.goods_id;
        this.getGoodsInfo();
      }
    }
  },
  created() {
    this.getCateList();
    this.backfillData();
  }
};
</script>

<style lang="stylus" scoped>
.el-checkbox
  margin 0 10px 0 0 !important
.previewImg
  width 100%
.addbtn
  margin-top 15px
</style>
