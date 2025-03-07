<script lang="ts" setup>
import {reactive, getCurrentInstance} from 'vue';
import {ElMessageBox} from 'element-plus';
import router from '../../router/index';

const {proxy} = getCurrentInstance()!;

const dataForm = reactive({
  number: 1
});

const data = reactive({
  code: "117GWMN00",
  title: "新感恩敬老中级体检套餐",
  description: "「感恩季到检钜惠」适合人群：适用于中、老年人及血管疾病人群 （参加第二件0元活动 需加入购物车后数量选2）",
  image: "http://192.168.3.18:9000/his/front/goods/0a03844155794e92b45956a795c95608.jpg",
  initialPrice: 2249.00,
  currentPrice: 2142.00,
  ruleName: null,
  type: "父母体检",
  tag: ["中老年", "女性", "男性"],
  checkup_1: [
    {"title": "一般健康检查", "content": "身高、体重、血压、心、肺、肝、脾、神经系统 ；甲状腺、乳腺、肛门、直肠"}
  ],
  checkup_2: [
    {
      "title": "C反应蛋白",
      "content": "升高常见于：急性炎症、组织坏死、恶性肿瘤、风湿病等疾病"
    },
    {
      "title": "肝功十项",
      "content": "丙氨酸氨基转移酶(ALT)测定 ；天门冬氨酸氨基转移酶(AST)测定；总蛋白(TP)测定 ；白蛋白(Alb)测定 ；碱性磷酸酶(ALP)测定 ;γ-谷氨酰基转移酶(GGT)测定;总胆红素(T-Bil)测定;直接胆红素(D-Bil)测定 ；总胆汁酸(TBA)测定 ；胆碱脂酶(ChE)测定"
    },
    {
      "title": "甲功七项",
      "content": "三碘甲状腺原氨酸(T3)测定 ；甲状腺素(T4)测定 ；促甲状腺激素(TSH)测定 ；游离三碘甲状腺原氨酸(FT3)测定 ；游离甲状腺素(FT4)测定 ；抗甲状腺球蛋白抗体(TGAb)测定 ；抗甲状腺过氧化物酶抗体(TPOAb)测定"
    },
    {
      "title": "尿常规",
      "content": "尿常规化学分析；尿有形成分分析"
    },
    {
      "title": "肾功五项",
      "content": "尿素(Urea)测定 ；肌酐(Cr)测定 ；葡萄糖(Glu)测定 ；尿酸(UA)测定 ；β2微球蛋白(β2-MG)测定"
    },
    {
      "title": " 糖化血红蛋白",
      "content": "检测近2-3个月内的平均血糖水平、用于糖尿病疗效观察"
    },
    {
      "title": " 同型半胱氨酸",
      "content": "HCY升高是心血管疾病的重要危险因素"
    }
  ],
  checkup_3: [
    {
      "title": "泌尿系彩色多普勒超声检查",
      "content": "双肾、肾盂、输尿管、膀胱壁、[前列腺（男）]"
    },
    {
      "title": "肝胆胰脾彩色多普勒超声检查",
      "content": "肝胆胰脾彩色多普勒超声检查"
    },
    {
      "title": "数字化摄影（指CR/DR)",
      "content": "心、肺、膈等"
    },
    {
      "title": "超声骨密度检测",
      "content": "超声仪检查骨量情况，无骨质疏松、骨量减少"
    },
    {
      "title": "心电图",
      "content": "检查心脏有否器官功能性病变，如：窦性心动过速、过缓、不齐以及各种心脏病的筛查"
    }
  ],
  checkup_4: [
    {
      "title": "肿物标记物（男）",
      "content": " 男：甲胎蛋白(AFP)测定 ；癌胚抗原(CEA)测定 ;游离前列腺特异性抗原(FPSA)测定 ；总前列腺特异性抗原(TPSA)测定 ；糖类抗原CA-199测定"
    }
  ],
  count_1: 5,
  count_2: 10,
  count_3: 9,
  count_4: 1,
  checkupCount: 25
});

</script>


<template>
  <div class="goods-detail">
    <img :src="data.image" class="cover" alt=""/>
    <div class="property">
      <h3 class="title">{{ data.title }} {{ data.code }}</h3>
      <p class="desc">{{ data.description }}</p>
      <div class="row">
        <label>官网价格：</label>
        <div class="info">
          <span class="current-price">{{ data.currentPrice }}</span>
          <span class="initial-price">￥{{ data.initialPrice }}</span>
        </div>
      </div>
      <div class="row">
        <label>享有折扣：</label>
        <div class="info">
          <img src="../../assets/front/goods/discount.png" class="discount-img" alt=""/>
          <span class="discount">{{ data.ruleName || '无' }}</span>
        </div>
      </div>
      <div class="row">
        <label>商品类型：</label>
        <div class="info">虚拟卡（电子卡密）</div>
      </div>
      <div class="row">
        <label>适用人群：</label>
        <div class="info">{{ data.type }}</div>
      </div>
      <div class="row">
        <label>购买数量：</label>
        <div class="info">
          <el-input-number v-model="dataForm.number" size="small"
                           :min="1" :max="10" @change="handleChange"/>
        </div>
      </div>
      <div class="row">
        <label>服务承诺：</label>
        <div class="info">
          <img src="../../assets/front/goods/property-icon-1.png"
               class="property-icon"/>
          <span class="service-tag">专业品质</span>
          <img src="../../assets/front/goods/property-icon-2.png"
               class="property-icon"/>
          <span class="service-tag">官方直营</span>
          <img src="../../assets/front/goods/property-icon-3.png"
               class="property-icon"/>
          <span class="service-tag">随时改</span>
          <img src="../../assets/front/goods/property-icon-4.png"
               class="property-icon"/>
          <span class="service-tag">随时退</span>
        </div>
      </div>
      <div class="operate">
        <div class="consult-btn" @click="consultHandle">
          <img src="../../assets/front/goods/consult.png"
               class="consult-icon"/>
          <span>咨询客服</span>
        </div>
        <div class="buy-btn" @click="createPayment">立即付款</div>
      </div>
    </div>
  </div>
  <el-divider/>
  <div class="goods-content">
    <el-descriptions title="商品摘要信息" :column="3" size="large" border>
      <el-descriptions-item label="体检名称" label-align="center">
        {{ data.title }} {{ data.code }}
      </el-descriptions-item>
      <el-descriptions-item label="体检类型" label-align="center">
        {{ data.type }}
      </el-descriptions-item>
      <el-descriptions-item label="适用人群" label-align="center">
        <span class="tag" v-for="one in data.tag">{{ one }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="体检机构" label-align="center">
        北京市神州大健康体检中心（东直门外大街234号）
      </el-descriptions-item>
      <el-descriptions-item label="体检项目" label-align="center">
        {{ data.checkupCount }}个
      </el-descriptions-item>
      <el-descriptions-item label="有效期" label-align="center">
        一年
      </el-descriptions-item>
    </el-descriptions>
    <div class="detail">
      <fieldset>
        <legend>体检项目明细</legend>
        <div v-if="data.count_1 > 0">
          <h4 class="detail-title">科室检查({{ data.count_1 }}项目)</h4>
          <table class="detail-table">
            <tr v-for="one in data.checkup_1">
              <th>{{ one.title }}</th>
              <td>{{ one.content }}</td>
            </tr>
          </table>
        </div>
        <div v-if="data.count_2 > 0">
          <h4 class="detail-title">实验室检查({{ data.count_2 }}项目)</h4>
          <table class="detail-table">
            <tr v-for="one in data.checkup_2">
              <th>{{ one.title }}</th>
              <td>{{ one.content }}</td>
            </tr>
          </table>
        </div>
        <div v-if="data.count_3 > 0">
          <h4 class="detail-title">医技检查({{ data.count_3 }}项目)</h4>
          <table class="detail-table">
            <tr v-for="one in data.checkup_3">
              <th>{{ one.title }}</th>
              <td>{{ one.content }}</td>
            </tr>
          </table>
        </div>
        <div v-if="data.count_4 > 0">
          <h4 class="detail-title">其他检查({{ data.count_4 }}项目)</h4>
          <table class="detail-table">
            <tr v-for="one in data.checkup_4">
              <th>{{ one.title }}</th>
              <td>{{ one.content }}</td>
            </tr>
          </table>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<style scoped lang="less">
@import url('goods.less');
</style>