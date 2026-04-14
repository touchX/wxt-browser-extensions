<template>
  <div class="api-test">
    <h2>接口测试</h2>

    <!-- getPatientData -->
    <section class="test-panel">
      <div class="panel-header">
        <span class="method-badge get">GET</span>
        <code class="endpoint">/api/preVisit/getPatientData</code>
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="idcard">身份证号</label>
          <input
            id="idcard"
            v-model="idcard"
            type="text"
            placeholder="如 330101199001010016"
            class="input"
          />
        </div>
        <button
          :disabled="isLoading1 || !idcard.trim()"
          class="btn-primary"
          @click="fetchByIdcard"
        >
          {{ isLoading1 ? '请求中...' : '发送请求' }}
        </button>
      </div>
      <div v-if="error1" class="error">{{ error1 }}</div>
      <div v-if="result1 !== null" class="result">
        <div class="result-meta">
          <span class="result-count">{{ result1.length }} 条记录</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>体检日期</th>
                <th>姓名</th>
                <th>身高</th>
                <th>体重</th>
                <th>腰围</th>
                <th>收缩压</th>
                <th>舒张压</th>
                <th>脉搏</th>
                <th>空腹血糖</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in result1" :key="i">
                <td>{{ r.check_date }}</td>
                <td>{{ r.name }}</td>
                <td>{{ r.height }}</td>
                <td>{{ r.weight }}</td>
                <td>{{ r.waistline || '-' }}</td>
                <td>{{ r.sbp ?? '-' }}</td>
                <td>{{ r.dbp ?? '-' }}</td>
                <td>{{ r.pulse }}</td>
                <td>{{ r.fbs }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- getPatientDataByCondition -->
    <section class="test-panel">
      <div class="panel-header">
        <span class="method-badge get">GET</span>
        <code class="endpoint">/api/preVisit/getPatientDataByCondition</code>
      </div>
      <p class="panel-desc">按条件查询患者体检数据（姓名/性别/年龄/日期），至少填写一个条件。</p>
      <div class="form-grid condition-grid">
        <div class="field">
          <label for="cond-name">姓名</label>
          <input
            id="cond-name"
            v-model="cond.name"
            type="text"
            placeholder="如 张三"
            class="input"
          />
        </div>
        <div class="field">
          <label for="cond-sex">性别</label>
          <select id="cond-sex" v-model="cond.sex" class="input select">
            <option value="">不限</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div class="field">
          <label for="cond-age">年龄</label>
          <input
            id="cond-age"
            v-model.number="cond.age"
            type="number"
            placeholder="如 36"
            class="input"
            min="0"
            max="120"
          />
        </div>
        <div class="field">
          <label for="cond-date">体检日期</label>
          <input
            id="cond-date"
            v-model="cond.checkDate"
            type="date"
            class="input"
          />
        </div>
      </div>
      <button
        :disabled="isLoading2 || !hasCondition"
        class="btn-primary"
        @click="fetchByCondition"
      >
        {{ isLoading2 ? '请求中...' : '发送请求' }}
      </button>
      <div v-if="error2" class="error">{{ error2 }}</div>
      <div v-if="result2 !== null" class="result">
        <div class="result-meta">
          <span class="result-count">{{ result2.length }} 条记录</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>体检日期</th>
                <th>姓名</th>
                <th>身份证号</th>
                <th>身高</th>
                <th>体重</th>
                <th>腰围</th>
                <th>收缩压</th>
                <th>舒张压</th>
                <th>脉搏</th>
                <th>空腹血糖</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in result2" :key="i">
                <td>{{ r.checkDate }}</td>
                <td>{{ r.name }}</td>
                <td class="mono">{{ r.idcard }}</td>
                <td>{{ r.height }}</td>
                <td>{{ r.weight }}</td>
                <td>{{ r.waistline || '-' }}</td>
                <td>{{ r.sbp ?? '-' }}</td>
                <td>{{ r.dbp ?? '-' }}</td>
                <td>{{ r.pulse }}</td>
                <td>{{ r.fbs }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { API_BASE_URL } from '@wxt-ext/shared'

// ========== getPatientData ==========
const idcard = ref('330101199001010016')
const isLoading1 = ref(false)
const result1 = ref<PatientDataItem[] | null>(null)
const error1 = ref('')

interface PatientDataItem {
  check_date: string
  idcard: string
  name: string
  height: number
  weight: number
  waistline: string
  sbp: number | null
  dbp: number | null
  pulse: number
  fbs: number
}

async function fetchByIdcard() {
  const trimmed = idcard.value.trim()
  if (!trimmed) return
  isLoading1.value = true
  error1.value = ''
  result1.value = null

  try {
    const url = `${API_BASE_URL}/api/preVisit/getPatientData?idcard=${encodeURIComponent(trimmed)}`
    const res = await fetch(url)
    const json = await res.json()
    if (json.state === 'ok') {
      result1.value = json.data
    } else {
      error1.value = json.msg || '请求失败'
    }
  } catch (e) {
    error1.value = e instanceof Error ? e.message : '网络请求失败'
  } finally {
    isLoading1.value = false
  }
}

// ========== getPatientDataByCondition ==========
const isLoading2 = ref(false)
const result2 = ref<PatientConditionItem[] | null>(null)
const error2 = ref('')
const cond = ref({
  name: '',
  sex: '',
  age: null as number | null,
  checkDate: '',
})

interface PatientConditionItem {
  checkDate: string
  idcard: string
  name: string
  height: number
  weight: number
  waistline: number
  sbp: number
  dbp: number
  pulse: number
  fbs: number
}

const hasCondition = computed(() =>
  cond.value.name.trim() ||
  cond.value.sex ||
  cond.value.age !== null ||
  cond.value.checkDate
)

async function fetchByCondition() {
  if (!hasCondition.value) return
  isLoading2.value = true
  error2.value = ''
  result2.value = null

  try {
    const params = new URLSearchParams()
    if (cond.value.name.trim()) params.set('name', cond.value.name.trim())
    if (cond.value.sex) params.set('sex', cond.value.sex)
    if (cond.value.age !== null) params.set('age', String(cond.value.age))
    if (cond.value.checkDate) params.set('checkDate', cond.value.checkDate)

    const url = `${API_BASE_URL}/api/preVisit/getPatientDataByCondition?${params}`
    const res = await fetch(url)
    const json = await res.json()

    if (json.state === 'ok') {
      result2.value = json.data
    } else {
      error2.value = json.msg || '请求失败'
    }
  } catch (e) {
    error2.value = e instanceof Error ? e.message : '网络请求失败'
  } finally {
    isLoading2.value = false
  }
}
</script>

<style scoped>
.api-test {
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
}

h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* ========== 测试面板 ========== */
.test-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.method-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Menlo', 'Consolas', monospace;
  letter-spacing: 0.05em;
}

.method-badge.get {
  background: #d1fae5;
  color: #065f46;
}

.endpoint {
  font-size: 13px;
  color: #374151;
  background: #f3f4f6;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'Menlo', 'Consolas', monospace;
}

.panel-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 14px;
  line-height: 1.5;
}

/* ========== 表单 ========== */
.form-grid {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 12px;
}

.condition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.input {
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #111827;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}

.input::placeholder {
  color: #d1d5db;
}

.input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input:hover:not(:focus) {
  border-color: #9ca3af;
}

.select {
  cursor: pointer;
  appearance: auto;
}

.btn-primary {
  padding: 8px 20px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  white-space: nowrap;
  height: 34px;
  align-self: flex-end;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========== 错误 ========== */
.error {
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 13px;
  color: #991b1b;
  margin-bottom: 12px;
}

/* ========== 结果 ========== */
.result {
  margin-top: 16px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.result-count {
  font-size: 12px;
  font-weight: 600;
  color: #065f46;
  background: #d1fae5;
  padding: 2px 8px;
  border-radius: 12px;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 700px;
}

th {
  background: #f9fafb;
  text-align: center;
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
}

td {
  text-align: center;
  padding: 8px 10px;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
  white-space: nowrap;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background: #f8fafc;
}

.mono {
  font-family: 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  color: #6b7280;
}
</style>
