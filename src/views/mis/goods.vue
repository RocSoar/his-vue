<script lang="ts" setup>
import {reactive, getCurrentInstance} from 'vue';
import {Delete, Download, Upload} from '@element-plus/icons-vue';

const {proxy} = getCurrentInstance()!;

const dataForm = reactive({
  keyword: null,
  code: null,
  type: null,
  partId: null,
  statusLabel: '全部',
  status: null
});

const dataRule = reactive({
  keyword: [{pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,50}$', message: '关键字内容不正确'}],
  code: [{min: 6, message: '编号不能少于6个字符'}, {pattern: '^[a-zA-Z0-9]{6,20}$', message: '编号格式错误'}]
});

const data = reactive({
  dataList: [],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  loading: false,
  selections: []
});

const goodsDialog = reactive({
  visible: false,
  newTag: null,
  item: [{}],
  imageUrl: null,
  checkup: null,
  ruleList: [],
  dataForm: {
    id: null,
    title: null,
    code: null,
    description: null,
    initialPrice: null,
    currentPrice: null,
    ruleId: null,
    image: null,
    type: null,
    tag: [],
    partId: null
  },
  upload: {
    action: `${proxy.$baseUrl}/mis/goods/uploadImage`,
    headers: {
      token: localStorage.getItem('token')
    },
    data: {
      id: null
    },
  },
  dataRule: {
    title: [
      {required: true, message: '名称不能为空'},
      {min: 2, message: '名称不能少于2个字符'},
      {pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{2,50}$', message: '名称格式错误'}
    ],
    code: [
      {required: true, message: '编号不能为空'},
      {min: 6, message: '编号不能少于6个字符'},
      {pattern: '^[a-zA-Z0-9]{6,20}$', message: '编号格式错误'}
    ],
    description: [{required: true, message: '简介信息不能为空'}],
    initialPrice: [
      {
        required: true,
        message: '价格不能为空'
      },
      {
        pattern: '(^[1-9]([0-9]+)?(\\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)',
        message: '价格不正确'
      }
    ],
    currentPrice: [
      {
        required: true,
        message: '价格不能为空'
      },
      {
        pattern: '(^[1-9]([0-9]+)?(\\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)',
        message: '价格不正确'
      }
    ],
    image: [
      {
        required: true,
        message: '没有上传封面图片'
      }
    ],
    type: [
      {
        required: true,
        message: '没有选择套餐类别'
      }
    ]
  }
});

const documentDialog = reactive({
  visible: false,
  upload: {
    action: `${proxy.$baseUrl}/mis/goods/uploadCheckupExcel`,
    headers: {
      token: localStorage.getItem('token')
    }
  },
  data: {
    id: null,
    hasCheckup: null
  }
});

function enterTag() {
}
</script>


<template>
  <div v-if="proxy.isAuth(['ROOT', 'GOODS:SELECT'])">
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
      <el-form-item prop="keyword">
        <el-input v-model="dataForm.keyword" placeholder="套餐名称"
                  maxlength="50" class="input" clearable="clearable"/>
      </el-form-item>
      <el-form-item prop="code">
        <el-input v-model="dataForm.code" placeholder="套餐编号"
                  class="input" maxlength="20" clearable="clearable"/>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.type" class="input" placeholder="类别" clearable="clearable">
          <el-option label="父母体检" value="父母体检"/>
          <el-option label="入职体检" value="入职体检"/>
          <el-option label="职场白领" value="职场白领"/>
          <el-option label="个人高端" value="个人高端"/>
          <el-option label="中青年体检" value="中青年体检"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.partId" class="input" placeholder="展示区" clearable="clearable">
          <el-option label="活动专区" value="1"/>
          <el-option label="热卖套餐" value="2"/>
          <el-option label="新品推荐" value="3"/>
          <el-option label="孝敬父母" value="4"/>
          <el-option label="白领精英" value="5"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchHandle()">查询</el-button>
        <el-button type="success"
                   :disabled="!proxy.isAuth(['ROOT', 'GOODS:INSERT'])"
                   @click="addHandle()">
          新增
        </el-button>
        <el-button type="danger"
                   :disabled="!proxy.isAuth(['ROOT', 'GOODS:DELETE'])"
                   @click="deleteHandle()">
          批量删除
        </el-button>
      </el-form-item>
      <el-form-item class="mold">
        <el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
          <el-radio-button label="全部"></el-radio-button>
          <el-radio-button label="已上架"></el-radio-button>
          <el-radio-button label="已下架"></el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <el-table :data="data.dataList"
              :header-cell-style="{'background':'#f5f7fa'}" border
              v-loading="data.loading" @selection-change="selectionChangeHandle">
      <el-table-column type="selection" header-align="center"
                       align="center" width="40" :selectable="selectable"/>
      <el-table-column type="index" header-align="center" align="center"
                       width="70" label="序号">
        <template #default="scope">
          <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" header-align="center" align="left" min-width="220" label="套餐名称"/>
      <el-table-column prop="code" header-align="center" align="left" min-width="120" label="套餐编号"/>
      <el-table-column header-align="center" align="center" min-width="80" label="现价">
        <template #default="scope">
          <span>￥{{ scope.row.currentPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" min-width="80" label="原价">
        <template #default="scope">
          <span>￥{{ scope.row.initialPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ruleName" header-align="center" align="center" min-width="100" label="促销方案"/>
      <el-table-column prop="salesVolume" header-align="center" align="center" min-width="90" label="销量"/>
      <el-table-column prop="type" header-align="center" align="center" min-width="100" label="类型"/>
      <el-table-column header-align="center" align="center" min-width="90" label="体检内容">
        <template #default="scope">
                <span
                    :class="scope.row.hasCheckup ? 'link-blue' : 'link-red'"
                    @click="documentHandle(scope.row.id, scope.row.hasCheckup)">
                    {{ scope.row.hasCheckup ? '有文档' : '无文档' }}
                </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" header-align="center" align="center"
                       min-width="80" label="状态">
        <template #default="scope">
          <el-switch v-model="scope.row.status" inline-prompt
                     style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;"
                     active-text="上架" inactive-text="下架"
                     :disabled="!scope.row.hasCheckup"
                     @change="changeSwitchHandle(scope.row.id, scope.row.status)"/>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" width="140"
                       label="操作">
        <template #default="scope">
          <el-button link type="primary" :disabled="!scope.row.status"
                     @click="viewHandle(scope.row.id)">
            预览
          </el-button>
          <el-button link :type="scope.row.status ? 'info' : 'success'"
                     v-if="proxy.isAuth(['ROOT', 'GOODS:UPDATE'])"
                     :disabled="scope.row.status"
                     @click="updateHandle(scope.row.id)">
            修改
          </el-button>
          <el-button link :type="(scope.row.salesVolume > 0 || scope.row.status) ? 'info' : 'danger'"
                     v-if="proxy.isAuth(['ROOT', 'GOODS:DELETE'])"
                     :disabled="scope.row.salesVolume > 0 || scope.row.status"
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
  <el-dialog :title="!goodsDialog.dataForm.id ? '新增' : '修改'" align-center
             v-if="proxy.isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])"
             :close-on-click-modal="false" v-model="goodsDialog.visible" width="750px">
    <el-form :model="goodsDialog.dataForm" ref="dialogForm"
             :rules="goodsDialog.dataRule" label-width="85px">
      <el-form-item label="套餐名称" prop="title">
        <el-input v-model="goodsDialog.dataForm.title" maxlength="50" clearable/>
      </el-form-item>
      <el-form-item label="套餐编号" prop="code">
        <el-input v-model="goodsDialog.dataForm.code" maxlength="20" clearable/>
      </el-form-item>
      <el-form-item label="简介信息" prop="description">
        <el-input type="textarea" v-model="goodsDialog.dataForm.description" :rows="4"
                  maxlength="200" clearable/>
      </el-form-item>
      <el-form-item label="套餐原价" prop="initialPrice">
        <el-input v-model="goodsDialog.dataForm.initialPrice"
                  placeholder="输入原价" class="price" maxlength="20" clearable>
          <template #append>
            元
          </template>
        </el-input>
        <span class="desc">提示：价格精确到分（小数点后两位）</span>
      </el-form-item>
      <el-form-item label="套餐现价" prop="currentPrice">
        <el-input v-model="goodsDialog.dataForm.currentPrice"
                  placeholder="输入现价" class="price" maxlength="20" clearable>
          <template #append>
            元
          </template>
        </el-input>
        <span class="desc">提示：价格精确到分（小数点后两位）</span>
      </el-form-item>
      <el-form-item label="折扣列表">
        <el-select v-model="goodsDialog.dataForm.ruleId" placeholder="选择折扣信息" clearable="clearable">
          <el-option :label="one.name" :value="one.id" v-for="one in goodsDialog.ruleList"/>
        </el-select>
      </el-form-item>
      <el-form-item label="封面图片" prop="image">
        <el-upload class="image-uploader"
                   :action="goodsDialog.upload.action"
                   :headers="goodsDialog.upload.headers"
                   :data="goodsDialog.upload.data" :show-file-list="false"
                   accept=".jpg,.jpeg,.png" :on-success="imageUploadSuccess"
                   :before-upload="imageBeforeUpload"
                   :on-error="imageUploadError">
          <img v-if="goodsDialog.imageUrl" :src="goodsDialog.imageUrl" class="image" alt=""/>
          <el-icon v-else class="image-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="套餐类别" prop="type">
        <el-select v-model="goodsDialog.dataForm.type" placeholder="检查类别" clearable="clearable">
          <el-option label="父母体检" value="父母体检"/>
          <el-option label="入职体检" value="入职体检"/>
          <el-option label="职场白领" value="职场白领"/>
          <el-option label="个人高端" value="个人高端"/>
          <el-option label="中青年体检" value="中青年体检"/>
        </el-select>
      </el-form-item>
      <el-form-item label="特征标签">
        <div class="tag-row">
          <el-input class="tag-input" v-model="goodsDialog.newTag" @keyup.enter="enterTag" clearable/>
          <span class="desc">提示：输入标签后按回车键</span>
        </div>
        <div class="tags">
          <el-tag v-for="one in goodsDialog.dataForm.tag" closable
                  :disable-transitions="false" @close="closeTag(one)">
            {{ one }}
          </el-tag>
        </div>
      </el-form-item>
      <el-form-item label="展示区" prop="partId">
        <el-select v-model="goodsDialog.dataForm.partId" placeholder="选择展示区" clearable="clearable">
          <el-option label="活动专区" value="1"/>
          <el-option label="热卖套餐" value="2"/>
          <el-option label="新品推荐" value="3"/>
          <el-option label="孝敬父母" value="4"/>
          <el-option label="白领精英" value="5"/>
        </el-select>
      </el-form-item>
      <el-form-item label="体检内容">
        <el-row :gutter="10" class="item-row" v-for="(one, $index) in goodsDialog.item" :key="$index">
          {{ i }}
          <el-col :span="6">
            <el-select v-model="one.type" placeholder="检查类别" clearable="clearable">
              <el-option label="科室检查" value="科室检查"/>
              <el-option label="实验室检查" value="实验室检查"/>
              <el-option label="医技检查" value="医技检查"/>
              <el-option label="其他检查" value="其他检查"/>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input v-model="one.title" placeholder="体检项目" maxlength="50" clearable/>
          </el-col>
          <el-col :span="11">
            <el-input v-model="one.content" placeholder="体检内容" maxlength="500" clearable/>
          </el-col>
          <el-col :span="1">
            <el-button type="primary" :icon="Delete" @click="deleteItem($index)"/>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <template #footer>
        <span class="dialog-footer">
            <el-button type="success" @click="addItem">添加项目</el-button>
            <el-button @click="goodsDialog.visible=false">取消</el-button>
            <el-button type="primary" @click="dataFormSubmit">确定</el-button>
        </span>
    </template>
  </el-dialog>
  <el-dialog title="提示信息"
             v-if="proxy.isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])"
             v-model="documentDialog.visible" width="350px">
    <div class="message-content">
      <el-icon :size="18" class="icon">
        <WarningFilled/>
      </el-icon>
      <p>请您选择【上传】或者【下载】体检内容文档？如果未上传体检内容文档，则体检套餐将无法上架。</p>
    </div>
    <template #footer>
       <span class="document-dialog-footer">
           <el-upload :action="documentDialog.upload.action"
                      :data="documentDialog.data" :show-file-list="false"
                      :headers="documentDialog.upload.headers" accept=".xlsx"
                      :before-upload="documentBeforeUpload"
                      :on-success="documentUploadSuccess"
                      :on-error="documentUploadError">
               <el-button type="success" :icon="Upload"
                          class="uploadBtn">上传</el-button>
           </el-upload>
           <el-button type="primary" :icon="Download"
                      class="downloadBtn"
                      :disabled="!documentDialog.data.hasCheckup"
                      @click="documentDownloadHandle">
               下载
           </el-button>
       </span>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
@import url('goods.less');
</style>