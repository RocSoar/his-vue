<script setup lang="ts">
import {reactive, getCurrentInstance} from 'vue';

const {proxy} = getCurrentInstance()!;

const dataForm = reactive({
  deptName: null
});

const dataRule = reactive({
  deptName: [{required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$', message: '部门名称格式错误'}]
});

const data = reactive({
  dataList: [],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  loading: false,
  selections: []
});

const dialog = reactive({
  visible: false,
  dataForm: {
    id: null,
    deptName: null,
    tel: null,
    email: null,
    desc: null
  },
  dataRule: {
    deptName: [{required: true, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{2,10}$', message: '部门名称格式错误'}],
    tel: [
      {
        required: false,
        pattern: '^1[1-9]\\d{9}$|^(0\\d{2,3}\-){0,1}[1-9]\\d{6,7}$',
        message: '电话格式错误'
      }
    ],
    email: [
      {
        required: false,
        pattern: '^([a-zA-Z]|[0-9])(\\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$',
        message: '邮箱格式错误'
      }
    ]
  }
});

function loadDataList() {
  data.loading = true;
  let json = {
    deptName: dataForm.deptName,
    page: data.pageIndex,
    length: data.pageSize
  };

  proxy.$http('/mis/dept/searchByPage', 'POST', json, true, function (resp: any) {
    let page = resp.page;
    data.dataList = page.list;
    data.totalCount = page.totalCount;
    data.loading = false;
  });
}

loadDataList();

function searchHandle() {
  proxy.$refs['form'].validate(valid => {
    if (valid) {
      proxy.$refs['form'].clearValidate();
      if (dataForm.deptName == '') {
        dataForm.deptName = null;
      }
      if (data.pageIndex != 1) {
        data.pageIndex = 1;
      }
      loadDataList();
    } else {
      return false;
    }
  });
}

function sizeChangeHandle(val) {
  data.pageSize = val;
  data.pageIndex = 1;
  loadDataList();
}

function currentChangeHandle(val) {
  data.pageIndex = val;
  loadDataList();
}

function addHandle() {
  dialog.dataForm.id = null;
  dialog.visible = true;
  proxy.$nextTick(() => {
    proxy.$refs['dialogForm'].resetFields();
  });
}

function dataFormSubmit() {
  proxy.$refs['dialogForm'].validate(valid => {
    if (valid) {
      proxy.$http(
          `/mis/dept/${dialog.dataForm.id == null ? 'insert' : 'update'}`,
          'POST',
          dialog.dataForm,
          true,
          function (resp) {
            if (resp.rows == 1) {
              proxy.$message({
                message: '操作成功',
                type: 'success',
                duration: 1200,
                onClose: () => {
                  dialog.visible = false;
                  loadDataList();
                }
              });
            } else {
              proxy.$message({
                message: '操作失败',
                type: 'error',
                duration: 1200
              });
            }
          }
      );
    }
  });
}

function updateHandle(id) {
  dialog.visible = true;
  dialog.dataForm.id = id;
  proxy.$nextTick(() => {
    proxy.$refs['dialogForm'].resetFields();
    let json = {id: id};
    proxy.$http('/mis/dept/searchById', 'POST', json, true, function (resp) {
      let result = resp.result;
      dialog.dataForm.deptName = result.deptName;
      dialog.dataForm.tel = result.tel;
      dialog.dataForm.email = result.email;
      dialog.dataForm.desc = result.desc;
    });
  });
}

function selectable(row, index) {
  if (row.emps > 0) {
    return false;
  }
  return true;
}

function selectionChangeHandle(val) {
  data.selections = val;
}

function deleteHandle(id) {
  let ids = id
      ? [id]
      : data.selections.map(item => {
        return item.id;
      });
  if (ids.length == 0) {
    proxy.$message({
      message: '没有选中记录',
      type: 'warning',
      duration: 1200
    });
  } else {
    proxy.$confirm(`确定要删除选中的记录？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      let json = {ids: ids};
      proxy.$http('/mis/dept/deleteByIds', 'POST', json, true, function (resp) {
        if (resp.rows > 0) {
          proxy.$message({
            message: '操作成功',
            type: 'success',
            duration: 1200,
            onClose: () => {
              loadDataList();
            }
          });
        } else {
          proxy.$message({
            message: '未能删除记录',
            type: 'warning',
            duration: 1200
          });
        }
      });
    });
  }
}

</script>

<template>
  <div v-if="proxy.isAuth(['ROOT', 'DEPT:SELECT'])">
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
      <el-form-item prop="deptName">
        <el-input v-model="dataForm.deptName" placeholder="部门名称"
                  maxlength="10" class="input" clearable="clearable"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchHandle()">查询</el-button>
        <el-button type="success"
                   :disabled="!proxy.isAuth(['ROOT', 'DEPT:INSERT'])"
                   @click="addHandle()">
          新增
        </el-button>
        <el-button type="danger"
                   :disabled="!proxy.isAuth(['ROOT', 'DEPT:DELETE'])"
                   @click="deleteHandle()">
          批量删除
        </el-button>
      </el-form-item>
    </el-form>

    <el-table :data="data.dataList"
              :header-cell-style="{'background':'#f5f7fa'}" border
              v-loading="data.loading" @selection-change="selectionChangeHandle">
      <el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="40" fixed/>
      <el-table-column type="index" header-align="center" align="center" width="70" label="序号" fixed>
        <template #default="scope">
          <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deptName" header-align="center"
                       align="center" label="部门名称" min-width="150" fixed/>
      <el-table-column prop="tel" header-align="center" align="center"
                       label="联系电话" width="160"/>
      <el-table-column prop="email" header-align="center" align="center"
                       label="邮箱" width="240"/>
      <el-table-column header-align="center" align="center" label="员工数量"
                       width="100">
        <template #default="scope">
          <span>{{ scope.row.emps }}人</span>
        </template>
      </el-table-column>
      <el-table-column prop="desc" header-align="center" align="center"
                       label="备注" min-width="300"/>
      <el-table-column fixed="right" header-align="center" align="center"
                       width="150" label="操作">
        <template #default="scope">
          <el-button link type="primary"
                     :disabled="!proxy.isAuth(['ROOT', 'DEPT:UPDATE'])"
                     @click="updateHandle(scope.row.id)">
            修改
          </el-button>
          <el-button link :type="scope.row.emps > 0 ? 'info':'danger'"
                     :disabled="!proxy.isAuth(['ROOT', 'DEPT:DELETE']) || scope.row.emps > 0"
                     @click="deleteHandle(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle"
                   @current-change="currentChangeHandle" :current-page="data.pageIndex"
                   :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
                   :total="data.totalCount"
                   layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
  <el-dialog :title="!dialog.dataForm.id ? '新增' : '修改'"
             v-if="proxy.isAuth(['ROOT', 'DEPT:INSERT', 'DEPT:UPDATE'])"
             :close-on-click-modal="false" v-model="dialog.visible" width="360px">
    <el-form :model="dialog.dataForm" ref="dialogForm"
             :rules="dialog.dataRule" label-width="60px">
      <el-form-item label="部门" prop="deptName">
        <el-input v-model="dialog.dataForm.deptName" maxlength="10" clearable/>
      </el-form-item>
      <el-form-item label="电话" prop="tel">
        <el-input v-model="dialog.dataForm.tel" maxlength="11" clearable/>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dialog.dataForm.email" maxlength="200" clearable/>
      </el-form-item>
      <el-form-item label="备注" prop="desc">
        <el-input v-model="dialog.dataForm.desc" maxlength="20" clearable/>
      </el-form-item>
    </el-form>
    <template #footer>
        <span class="dialog-footer">
            <el-button @click="dialog.visible = false">取消</el-button>
            <el-button type="primary" @click="dataFormSubmit">确定</el-button>
        </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>