<script lang="ts" setup>
import {reactive, getCurrentInstance} from 'vue';

const {proxy} = getCurrentInstance()!;

const dataForm = reactive({
  roleName: null
});

const dataRule = reactive({
  roleName: [{required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$', message: '角色格式错误'}]
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
  systemic: true,
  dataForm: {
    id: null,
    roleName: null,
    permissions: [],
    desc: null,
    changed: false
  },
  permissionList: [],
  oldPermissions: [],
  dataRule: {
    roleName: [{required: true, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{2,10}$', message: '角色名称格式错误'}],
    permissions: [
      {required: true, trigger: 'blur', message: '角色没有关联权限'},
      {required: false, trigger: 'change', message: '角色没有关联权限'}
    ]
  }
});

function loadDataList() {
  data.loading = true;
  let json = {
    roleName: dataForm.roleName,
    page: data.pageIndex,
    length: data.pageSize
  };

  proxy.$http('/mis/role/searchByPage', 'POST', json, true, function (resp: any) {
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
      if (dataForm.roleName == '') {
        dataForm.roleName = null;
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
  dialog.visible = true;
  dialog.dataForm.id = null;
  dialog.systemic = false;
  proxy.$nextTick(() => {
    proxy.$refs['dialogForm'].resetFields();
    proxy.$http('/mis/permission/searchAllPermission', 'GET', null, true, function (resp: any) {
      let temp = [];
      for (let one of resp.list) {
        //因为新添加的角色，所有权限都是可以选择的，不需要禁用列表项
        let disabled = false;
        //穿梭框左侧列表项的数据要求必须有key、label和disabled属性
        temp.push({key: one.id, label: `${one.moduleName}（${one.actionName}）`, disabled: disabled});
      }
      dialog.permissionList = temp;
    });
  });
}

function dataFormSubmit() {
  proxy.$refs['dialogForm'].validate(valid => {
    if (valid) {
      /*
       * 为了能分别出有没有增减角色关联的权限，一个个核对数组元素太费劲了，
       * 我选择对数据元素排升序，后续在比较内容的做法。
       */
      dialog.dataForm.permissions.sort((a, b) => a - b);
      dialog.oldPermissions.sort((a, b) => a - b);
      //我们分别把两个数组的元素拼接成字符串，然后比较字符串的内容就知道数组内容是否相同了
      dialog.dataForm.changed = dialog.dataForm.permissions.join() !== dialog.oldPermissions.join();

      proxy.$http(
          `/mis/role/${dialog.dataForm.id === null ? 'insert' : 'update'}`,
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

function updateHandle(id, systemic) {
  dialog.visible = true;
  dialog.dataForm.id = id;
  dialog.systemic = systemic;
  proxy.$nextTick(() => {
    proxy.$refs['dialogForm'].resetFields();
    let defaultPermissions = [];
    let json = {id: id};
    //加载角色信息
    proxy.$http('/mis/role/searchById', 'POST', json, true, function (resp) {
      let result = resp.result;
      dialog.dataForm.roleName = result.roleName;
      dialog.dataForm.desc = result.desc;
      dialog.dataForm.permissions = JSON.parse(result.permissions);
      //保存原始权限数据，用于比对是否增减角色关联的权限
      dialog.oldPermissions = JSON.parse(result.permissions);
      //把角色默认的初始权限保存起来，该数据暂时没有用到
      defaultPermissions = result.defaultPermissions;
    });
    /*
     * 加载所有权限列表数据，用以显示在穿梭框的左侧。
     * 穿梭框控件会自动判断右侧有什么权限，然后把左侧相关权限列表项隐藏起来。
     */
    proxy.$http('/mis/permission/searchAllPermission', 'GET', null, true, function (resp) {
      let temp = [];
      for (let one of resp.list) {
        let disabled = false;
        temp.push({key: one.id, label: `${one.moduleName}（${one.actionName}）`, disabled: disabled});
      }
      dialog.permissionList = temp;
    });
  });
}

function selectable(row, index) {
  return !(row.systemic || row.users > 0);
}

function selectionChangeHandle(val) {
  data.selections = val;
}

function deleteHandle(id) {
  let ids = id ? [id] : data.selections.map(item => {
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
      proxy.$http('/mis/role/deleteByIds', 'POST', json, true, function (resp) {
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
  <div v-if="proxy.isAuth(['ROOT', 'ROLE:SELECT'])">
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
      <el-form-item prop="roleName">
        <el-input v-model="dataForm.roleName" placeholder="角色名称"
                  maxlength="10" class="input" clearable="clearable"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchHandle()">查询</el-button>
        <el-button type="success"
                   :disabled="!proxy.isAuth(['ROOT', 'ROLE:INSERT'])"
                   @click="addHandle()">
          新增
        </el-button>
        <el-button type="danger"
                   :disabled="!proxy.isAuth(['ROOT', 'ROLE:DELETE'])"
                   @click="deleteHandle()">
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table :data="data.dataList"
              :header-cell-style="{'background':'#f5f7fa'}" border
              v-loading="data.loading" @selection-change="selectionChangeHandle">
      <el-table-column type="selection" :selectable="selectable"
                       header-align="center" align="center" width="40"/>
      <el-table-column type="index" header-align="center" align="center"
                       width="70" label="序号">
        <template #default="scope">
          <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="roleName" header-align="center"
                       align="center" label="角色名称" min-width="150"/>
      <el-table-column header-align="center" align="center" label="权限数量"
                       min-width="120">
        <template #default="scope">
          <span>{{ scope.row.permissions }}个</span>
        </template>
      </el-table-column>
      <el-table-column prop="users" header-align="center" align="center"
                       label="关联用户" min-width="140">
        <template #default="scope">
          <span>{{ scope.row.users }}人</span>
        </template>
      </el-table-column>
      <el-table-column prop="desc" header-align="center" align="center"
                       label="备注" min-width="420"/>
      <el-table-column prop="systemic" header-align="center"
                       align="center" label="内置角色" min-width="100">
        <template #default="scope">
          <span>{{ scope.row.systemic ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" width="150" label="操作">
        <template #default="scope">
          <el-button link :type="scope.row.id === 0 ? 'info':'primary'"
                     :disabled="!proxy.isAuth(['ROOT', 'ROLE:UPDATE']) || scope.row.id == 0"
                     @click="updateHandle(scope.row.id, scope.row.systemic)">
            修改
          </el-button>
          <el-button link :type="(scope.row.systemic || scope.row.users > 0) ? 'info':'danger'"
                     :disabled="!proxy.isAuth(['ROOT', 'ROLE:DELETE']) || scope.row.systemic || scope.row.users > 0"
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
                   layout="total, sizes, prev, pager, next, jumper"></el-pagination>
  </div>
  <el-dialog :title="!dialog.dataForm.id ? '新增' : '修改'"
             v-if="proxy.isAuth(['ROOT', 'ROLE:INSERT', 'ROLE:UPDATE'])"
             :close-on-click-modal="false" v-model="dialog.visible"
             class="dialog" width="692px">
    <el-form :model="dialog.dataForm" ref="dialogForm"
             :rules="dialog.dataRule" label-width="60px">
      <el-form-item label="角色" prop="roleName">
        <el-input v-model="dialog.dataForm.roleName"
                  class="dialog-input" maxlength="10"
                  :readonly="dialog.systemic" clearable/>
        <span class="note">（ 角色名称必须是2~10个字符之间 ）</span>
      </el-form-item>
      <el-form-item label="备注" prop="desc">
        <el-input v-model="dialog.dataForm.desc" class="dialog-input" maxlength="20" clearable/>
        <span class="note">（ 备注信息必须是20个字符以内 ）</span>
      </el-form-item>
      <el-form-item label="权限" prop="permissions">
        <el-transfer v-model="dialog.dataForm.permissions"
                     :data="dialog.permissionList" :titles="['权限列表', '具备权限']"
                     filterable filter-placeholder="请输入权限"/>
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