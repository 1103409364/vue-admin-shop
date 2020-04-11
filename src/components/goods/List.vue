<template>
  <div class="list">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="queryGoods"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="queryGoods"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">
            添加商品
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量(kg)"
          prop="goods_weight"
          width="95px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template v-slot="slotProps">
            {{ (slotProps.row.add_time * 1000) | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="185px">
          <template v-slot="slotProps">
            <el-button type="primary" icon="el-icon-edit" size="mini">
              修改
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteGoods(slotProps.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'list',
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0 //总数,分页用
    };
  },
  methods: {
    async getGoodsList() {
      const res = await this.$http.get('goods', {
        params: this.queryInfo
      });

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      // this.$message.success(res.meta.msg);
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    // 查找商品
    queryGoods() {
      this.queryInfo.pagenum = 1;
      this.getGoodsList();
    },
    deleteGoods(row) {
      this.$confirm('此操将删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async res => {
          if (res === 'confirm') {
            const res = await this.$http.delete(`goods/${row.goods_id}`);
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg);
            }
            this.$message.success(res.meta.msg);
            this.getGoodsList();
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    goAddPage() {
      this.$router.push({ path: '/goods/add' });
    }
  },
  created() {
    this.getGoodsList();
  }
};
</script>

<style lang="stylus" scoped></style>
