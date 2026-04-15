/** 门诊数据 (bu_outpatient_data) */
export interface OutpatientRecord {
  checkDate: string
  idcard: string
  name: string
  height: number
  weight: number
  waistline: string
  lsbp: number | null
  rsbp: number | null
  ldbp: number | null
  rdbp: number | null
  pulse: number
  fbs: number
}

/** 随访数据 (bu_visit_data) */
export interface VisitRecord {
  visitDate: string
  idcard: string
  name: string
  height: number
  weight: number
  lsbp: number | null
  rsbp: number | null
  ldbp: number | null
  rdbp: number | null
  heartRate: number
  fbs: number
}

/** 门诊数据（含 sex 字段，用于条件查询） */
export interface OutpatientConditionRecord {
  checkDate: string
  idcard: string
  name: string
  sex: string
  age: number
  height: number
  weight: number
  waistline: number
  lsbp: number
  rsbp: number
  ldbp: number
  rdbp: number
  pulse: number
  fbs: number
}

/** getPatientDataByCondition 返回的标准化记录 */
export interface PatientConditionItem {
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

/** 合并后的统一患者记录 */
export interface PatientDataItem {
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

/** API 标准响应 */
export interface ApiResponse<T = unknown> {
  state: 'ok' | 'fail'
  data?: T
  msg?: string
}
