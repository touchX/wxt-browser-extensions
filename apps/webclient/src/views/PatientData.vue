<template>
  <div class="patient-data">

    <!-- 加载骨架屏 -->
    <div v-if="isLoading" class="skeleton-wrap" aria-label="正在加载数据" aria-busy="true">
      <div class="skeleton-list">
        <div v-for="n in 3" :key="n" class="skeleton-card"></div>
      </div>
      <div class="skeleton-detail">
        <div class="skeleton-header"></div>
        <div class="skeleton-rows">
          <div v-for="n in 6" :key="n" class="skeleton-row"></div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-banner" role="alert">
      <span class="error-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </span>
      <span class="error-text">{{ error }}</span>
      <button class="error-retry" @click="fetchData" aria-label="重新加载数据">
        重试
      </button>
    </div>

    <!-- 主内容 -->
    <template v-else-if="records.length">
      <div class="master-detail">
        <!-- 左侧：就诊记录列表 -->
        <aside class="patient-list" role="region" aria-label="就诊记录列表">
          <div class="list-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            就诊记录
            <span class="record-count">{{ records.length }} 条</span>
          </div>
          <ul
            class="patient-cards"
            role="listbox"
            :aria-label="`共 ${records.length} 条就诊记录，选择一条查看详情`"
            tabindex="0"
            @keydown="handleListKeydown"
          >
            <li
              v-for="(row, i) in records"
              :key="i"
              :class="['patient-card', { active: selectedIndex === i }]"
              role="option"
              :aria-selected="selectedIndex === i"
              :tabindex="selectedIndex === i ? 0 : -1"
              @click="selectedIndex = i"
              @keydown.enter="selectedIndex = i"
              @keydown.space.prevent="selectedIndex = i"
            >
              <div class="card-main">
                <span class="card-name" :title="row.name">{{ row.name }}</span>
                <span class="card-gender">{{ getGender(row.idcard) }}</span>
                <span class="card-age">{{ getAge(row.idcard) }}岁</span>
              </div>
              <div class="card-meta">
                <span class="card-date">{{ formatDate(row.check_date) }}</span>
                <span class="card-id" :title="row.idcard">{{ maskIdcard(row.idcard) }}</span>
              </div>
            </li>
          </ul>
        </aside>

        <!-- 右侧：体检详情 -->
        <section class="detail-panel" aria-label="体检详情" :key="selectedIndex">
          <!-- 黄色信息头 -->
          <div class="detail-header" role="region" aria-label="患者基本信息">
            <div class="header-item">
              <span class="header-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                姓名
              </span>
              <span class="header-value" aria-label="姓名">{{ selected.name }}</span>
            </div>
            <div class="header-item">
              <span class="header-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
                性别 / 年龄
              </span>
              <span class="header-value">{{ gender }} / {{ age }}岁</span>
            </div>
            <div class="header-item">
              <span class="header-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                体检日期
              </span>
              <span class="header-value">{{ formatDate(selected.check_date) }}</span>
            </div>
            <div class="header-item">
              <span class="header-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                登记号
              </span>
              <span class="header-value card-id-display">{{ selected.idcard }}</span>
            </div>
          </div>

          <!-- 体检数据表 -->
          <div class="detail-body">
            <table class="exam-table" aria-label="体检数据">
              <caption class="sr-only">体检数据列表，项目、结果和单位</caption>
              <thead>
                <tr>
                  <th scope="col">项目</th>
                  <th scope="col">结果</th>
                  <th scope="col">单位</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">身高</th>
                  <td>
                    <label :for="`input-height`" class="sr-only">身高</label>
                    <input :id="`input-height`" v-model.number="selected.height" type="number" class="result-input" placeholder="-" min="50" max="250" aria-label="身高结果" />
                  </td>
                  <td class="unit">cm</td>
                </tr>
                <tr>
                  <th scope="row">体重</th>
                  <td>
                    <label :for="`input-weight`" class="sr-only">体重</label>
                    <input :id="`input-weight`" v-model.number="selected.weight" type="number" class="result-input" placeholder="-" min="20" max="300" step="0.1" aria-label="体重结果" />
                  </td>
                  <td class="unit">kg</td>
                </tr>
                <tr :class="['bmi-row', bmiLevel]">
                  <th scope="row">
                    体重指数
                    <span class="bmi-hint" :title="bmiHint">?</span>
                  </th>
                  <td class="bmi-value">{{ bmi }}</td>
                  <td class="unit">
                    <span class="bmi-tag" :class="bmiLevel">{{ bmiTag }}</span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">收缩压</th>
                  <td>
                    <label :for="`input-sbp`" class="sr-only">收缩压</label>
                    <input :id="`input-sbp`" v-model.number="selected.sbp" type="number" class="result-input" placeholder="-" min="60" max="250" aria-label="收缩压结果" />
                  </td>
                  <td class="unit">mmHg</td>
                </tr>
                <tr>
                  <th scope="row">舒张压</th>
                  <td>
                    <label :for="`input-dbp`" class="sr-only">舒张压</label>
                    <input :id="`input-dbp`" v-model.number="selected.dbp" type="number" class="result-input" placeholder="-" min="40" max="150" aria-label="舒张压结果" />
                  </td>
                  <td class="unit">mmHg</td>
                </tr>
                <tr>
                  <th scope="row">脉率</th>
                  <td>
                    <label :for="`input-pulse`" class="sr-only">脉率</label>
                    <input :id="`input-pulse`" v-model.number="selected.pulse" type="number" class="result-input" placeholder="-" min="30" max="200" aria-label="脉率结果" />
                  </td>
                  <td class="unit">次/分</td>
                </tr>
                <tr>
                  <th scope="row">腰围</th>
                  <td>
                    <label :for="`input-waist`" class="sr-only">腰围</label>
                    <input :id="`input-waist`" v-model.number="selected.waistline" type="number" class="result-input" placeholder="-" min="40" max="200" step="0.1" aria-label="腰围结果" />
                  </td>
                  <td class="unit">cm</td>
                </tr>
                <tr>
                  <th scope="row">空腹血糖</th>
                  <td>
                    <label :for="`input-fbs`" class="sr-only">空腹血糖</label>
                    <input :id="`input-fbs`" v-model.number="selected.fbs" type="number" class="result-input" placeholder="-" min="1" max="30" step="0.1" aria-label="空腹血糖结果" />
                  </td>
                  <td class="unit">mmol/L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </template>

    <!-- 空状态 -->
    <div v-else-if="loaded && !records.length" class="empty-state" role="status" aria-live="polite">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
      <p>未找到该居民的就诊数据</p>
      <button class="retry-btn" @click="fetchData" aria-label="重新查询数据">
        重新查询
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { API_BASE_URL } from '@wxt-ext/shared'

interface PatientRecord {
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

const idcard = ref('330101199001010016')
const isLoading = ref(false)
const loaded = ref(false)
const records = ref<PatientRecord[]>([])
const error = ref('')
const selectedIndex = ref(0)

const selected = computed(() => records.value[selectedIndex.value] ?? ({} as PatientRecord))

function getGender(idcard: string): string {
  if (!idcard) return '--'
  if (idcard.length === 15) return parseInt(idcard[13]) % 2 === 0 ? '女' : '男'
  if (idcard.length === 18) return parseInt(idcard[16]) % 2 === 0 ? '女' : '男'
  return '--'
}

function getAge(idcard: string): number {
  if (!idcard) return 0
  const birthYear = idcard.length === 15
    ? 1900 + parseInt(idcard.slice(6, 8))
    : idcard.length === 18 ? parseInt(idcard.slice(6, 10)) : 0
  return new Date().getFullYear() - birthYear
}

const gender = computed(() => getGender(selected.value.idcard))
const age = computed(() => getAge(selected.value.idcard))

const bmi = computed(() => {
  const h = selected.value.height
  const w = selected.value.weight
  if (!h || !w) return '--'
  return (w / (h / 100) ** 2).toFixed(1)
})

const bmiLevel = computed(() => {
  const v = parseFloat(bmi.value)
  if (isNaN(v)) return 'normal'
  if (v < 18.5) return 'low'
  if (v < 24) return 'normal'
  if (v < 28) return 'high'
  return 'obese'
})

const bmiTag = computed(() => {
  switch (bmiLevel.value) {
    case 'low': return '偏低'
    case 'normal': return '正常'
    case 'high': return '偏高'
    case 'obese': return '肥胖'
    default: return ''
  }
})

const bmiHint = computed(() => {
  switch (bmiLevel.value) {
    case 'low': return 'BMI < 18.5，体重过低'
    case 'normal': return 'BMI 18.5-23.9，正常范围'
    case 'high': return 'BMI 24-27.9，超重'
    case 'obese': return 'BMI ≥ 28，肥胖'
    default: return ''
  }
})

function maskIdcard(idcard: string): string {
  if (!idcard || idcard.length < 8) return idcard
  return idcard.slice(0, 3) + '****' + idcard.slice(-4)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function handleListKeydown(e: KeyboardEvent) {
  const len = records.value.length
  if (!len) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % len
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value - 1 + len) % len
  }
}

async function fetchData() {
  const trimmed = idcard.value.trim()
  if (!trimmed) return

  isLoading.value = true
  error.value = ''
  records.value = []
  selectedIndex.value = 0
  loaded.value = false

  try {
    const url = `${API_BASE_URL}/api/preVisit/getPatientData?idcard=${encodeURIComponent(trimmed)}`
    const res = await fetch(url)
    const json = await res.json()

    if (json.state === 'ok') {
      records.value = json.data ?? []
    } else {
      error.value = json.msg || '请求失败'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '网络请求失败，请检查服务是否启动'
  } finally {
    isLoading.value = false
    loaded.value = true
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ========== 设计令牌 ========== */
.patient-data {
  height: 100%;
  font-family: 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  color: var(--color-text, #111827);
}

/* ========== 骨架屏 ========== */
.skeleton-wrap {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton-list,
.skeleton-detail {
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-list {
  background: #f3f4f6;
  min-height: 400px;
}

.skeleton-detail {
  background: #f3f4f6;
  min-height: 400px;
}

.skeleton-card {
  height: 56px;
  margin: 8px;
  border-radius: 6px;
  background: #e5e7eb;
}

.skeleton-header {
  height: 48px;
  background: #fef9e7;
  border-bottom: 1px solid #f0d86e;
}

.skeleton-row {
  height: 44px;
  margin: 12px 16px;
  border-radius: 6px;
  background: #e5e7eb;
}

/* ========== 错误提示 ========== */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 14px;
  color: #991b1b;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.error-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
}

.error-retry,
.retry-btn {
  padding: 6px 16px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  white-space: nowrap;
}

.error-retry:hover,
.retry-btn:hover {
  background: #b91c1c;
}

.error-retry:active,
.retry-btn:active {
  transform: scale(0.97);
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: #9ca3af;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.empty-state svg {
  margin-bottom: 16px;
  color: #d1d5db;
}

.empty-state p {
  font-size: 14px;
  margin: 0 0 16px;
}

/* ========== 左右分栏 ========== */
.master-detail {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  min-height: 500px;
  animation: fadeIn 0.3s ease-out;
}

@media (max-width: 768px) {
  .master-detail {
    grid-template-columns: 1fr;
  }
  .patient-list {
    max-height: 240px;
    overflow-y: auto;
  }
}

/* ========== 左侧列表 ========== */
.patient-list {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.list-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  letter-spacing: 0.02em;
}

.list-header svg {
  color: #6b7280;
  flex-shrink: 0;
}

.record-count {
  margin-left: auto;
  padding: 1px 8px;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.patient-cards {
  list-style: none;
  margin: 0;
  padding: 0;
  outline: none;
}

.patient-cards:focus-within .patient-card.active {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}

.patient-card {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.15s ease, border-left-color 0.15s ease;
  border-left: 3px solid transparent;
}

.patient-card:last-child {
  border-bottom: none;
}

.patient-card:hover {
  background: #f8fafc;
}

.patient-card:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}

.patient-card.active {
  background: #eff6ff;
  border-left-color: #2563eb;
}

.card-main {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-gender,
.card-age {
  font-size: 12px;
  padding: 1px 6px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 4px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-date {
  font-size: 12px;
  color: #6b7280;
}

.card-id {
  font-size: 11px;
  color: #9ca3af;
}

/* ========== 右侧详情 ========== */
.detail-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: opacity 0.2s ease;
}

/* 黄色信息头 */
.detail-header {
  display: flex;
  flex-wrap: wrap;
  background: #fef9e7;
  border-bottom: 2px solid #f0d86e;
}

.header-item {
  display: flex;
  flex-direction: column;
  padding: 12px 18px;
  border-right: 1px solid #f0d86e;
  min-width: 110px;
  flex: 1;
}

.header-item:last-child {
  border-right: none;
}

.header-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.header-label svg {
  flex-shrink: 0;
  opacity: 0.6;
}

.header-value {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  font-variant-numeric: tabular-nums;
}

.card-id-display {
  font-size: 13px;
  font-weight: 500;
  font-family: 'Menlo', 'Consolas', monospace;
  letter-spacing: 0.02em;
}

/* 体检表格 */
.detail-body {
  padding: 20px;
}

.exam-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.exam-table th[scope="row"] {
  text-align: left;
  font-weight: 500;
  color: #374151;
  background: #fafafa;
}

.exam-table th {
  background: #f9fafb;
  text-align: center;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.exam-table td {
  text-align: center;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  color: #111827;
  font-variant-numeric: tabular-nums;
}

.exam-table tbody tr:hover {
  background: #f8fafc;
}

.exam-table tbody tr:focus-within {
  background: #eff6ff;
}

.unit {
  color: #9ca3af;
  font-size: 12px;
}

/* ========== 输入框 ========== */
.result-input {
  width: 100%;
  min-width: 80px;
  max-width: 120px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  color: #111827;
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-variant-numeric: tabular-nums;
}

.result-input::placeholder {
  color: #d1d5db;
}

.result-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.result-input:hover:not(:focus) {
  border-color: #9ca3af;
}

/* ========== BMI 指示 ========== */
.bmi-row td {
  background: #fafafa;
}

.bmi-hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 10px;
  background: #e5e7eb;
  color: #6b7280;
  border-radius: 50%;
  cursor: help;
  margin-left: 4px;
}

.bmi-value {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.bmi-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.bmi-tag.low { background: #fef3c7; color: #92400e; }
.bmi-tag.normal { background: #d1fae5; color: #065f46; }
.bmi-tag.high { background: #fee2e2; color: #991b1b; }
.bmi-tag.obese { background: #fecaca; color: #7f1d1d; }

/* ========== 无障碍 ========== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ========== 响应式 ========== */
@media (max-width: 1024px) {
  .header-item {
    min-width: 90px;
    padding: 10px 12px;
  }
}
</style>
