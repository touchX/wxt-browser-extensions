import type {
  OutpatientRecord,
  OutpatientConditionRecord,
  VisitRecord,
  PatientDataItem,
  PatientConditionItem,
} from '../types/patient'

// ---- 模拟数据：门诊条件查询 (bu_outpatient_data) ----
// ---- iMedical 体检数据 ----
const imedicalData: OutpatientConditionRecord[] = [
  {
    checkDate: '2026-04-07',
    idcard: '440106199801010012',
    name: '李壮壮',
    sex: '男',
    age: 25,
    height: 167,
    weight: 67.8,
    waistline: 80,
    lsbp: 102,
    rsbp: 105,
    ldbp: 65,
    rdbp: 68,
    pulse: 97,
    fbs: 5.1,
  },
  {
    checkDate: '2026-04-07',
    idcard: '440106198103010023',
    name: '文琼',
    sex: '女',
    age: 45,
    height: 158,
    weight: 55.0,
    waistline: 72,
    lsbp: 118,
    rsbp: 120,
    ldbp: 75,
    rdbp: 78,
    pulse: 72,
    fbs: 4.8,
  },
  {
    checkDate: '2026-04-07',
    idcard: '440106195302010047',
    name: '陈秀芳',
    sex: '女',
    age: 73,
    height: 155,
    weight: 62.0,
    waistline: 85,
    lsbp: 145,
    rsbp: 148,
    ldbp: 90,
    rdbp: 92,
    pulse: 68,
    fbs: 6.4,
  },
  {
    checkDate: '2026-04-07',
    idcard: '440106199912010015',
    name: '赵鲲鹏',
    sex: '男',
    age: 26,
    height: 175,
    weight: 72.0,
    waistline: 78,
    lsbp: 120,
    rsbp: 122,
    ldbp: 78,
    rdbp: 80,
    pulse: 75,
    fbs: 5.3,
  },
  {
    checkDate: '2026-04-07',
    idcard: '440106199809010018',
    name: '贺琨',
    sex: '男',
    age: 27,
    height: 170,
    weight: 68.5,
    waistline: 82,
    lsbp: 115,
    rsbp: 118,
    ldbp: 72,
    rdbp: 75,
    pulse: 80,
    fbs: 5.0,
  },
  {
    checkDate: '2026-04-07',
    idcard: '440106199709010021',
    name: '邱培杰',
    sex: '男',
    age: 29,
    height: 168,
    weight: 65.0,
    waistline: 76,
    lsbp: 110,
    rsbp: 112,
    ldbp: 70,
    rdbp: 72,
    pulse: 78,
    fbs: 4.9,
  },
  {
    checkDate: '2026-04-07',
    idcard: '440106200404010027',
    name: '罗莹',
    sex: '女',
    age: 22,
    height: 162,
    weight: 52.0,
    waistline: 68,
    lsbp: 108,
    rsbp: 110,
    ldbp: 68,
    rdbp: 70,
    pulse: 68,
    fbs: 4.7,
  },
  {
    checkDate: '2026-04-07',
    idcard: '440106199803010016',
    name: '麦国武',
    sex: '男',
    age: 23,
    height: 172,
    weight: 70.0,
    waistline: 80,
    lsbp: 118,
    rsbp: 120,
    ldbp: 76,
    rdbp: 78,
    pulse: 74,
    fbs: 5.2,
  },
  {
    checkDate: '2026-04-07',
    idcard: '440106199303010025',
    name: '江栖',
    sex: '女',
    age: 33,
    height: 160,
    weight: 56.0,
    waistline: 70,
    lsbp: 112,
    rsbp: 115,
    ldbp: 70,
    rdbp: 72,
    pulse: 70,
    fbs: 4.8,
  },
]

// ---- 原有门诊条件查询数据 ----
const outpatientConditionData: OutpatientConditionRecord[] = [
  {
    checkDate: '2026-01-15',
    idcard: '330101199001010016',
    name: '张三',
    sex: '男',
    age: 35,
    height: 172,
    weight: 75.5,
    waistline: 88,
    lsbp: 128,
    rsbp: 130,
    ldbp: 82,
    rdbp: 84,
    pulse: 72,
    fbs: 5.6,
  },
  {
    checkDate: '2025-12-10',
    idcard: '330101199001010016',
    name: '张三',
    sex: '男',
    age: 35,
    height: 172,
    weight: 76.0,
    waistline: 89,
    lsbp: 132,
    rsbp: 135,
    ldbp: 85,
    rdbp: 88,
    pulse: 76,
    fbs: 6.1,
  },
  {
    checkDate: '2025-11-05',
    idcard: '330101199001010016',
    name: '李四',
    sex: '女',
    age: 28,
    height: 165,
    weight: 58.0,
    waistline: 75,
    lsbp: 115,
    rsbp: 118,
    ldbp: 72,
    rdbp: 75,
    pulse: 68,
    fbs: 4.9,
  },
  {
    checkDate: '2025-09-18',
    idcard: '330101199001010017',
    name: '王五',
    sex: '男',
    age: 50,
    height: 170,
    weight: 82.0,
    waistline: 95,
    lsbp: 145,
    rsbp: 148,
    ldbp: 92,
    rdbp: 95,
    pulse: 82,
    fbs: 7.2,
  },
]

/** 转换门诊记录为标准化格式（sbp/dbp <=0 时取另一侧） */
function fromConditionRecord(record: OutpatientConditionRecord): PatientConditionItem {
  return {
    checkDate: record.checkDate,
    idcard: record.idcard,
    name: record.name,
    height: record.height,
    weight: record.weight,
    waistline: record.waistline,
    sbp: record.lsbp > 0 ? record.lsbp : record.rsbp,
    dbp: record.ldbp > 0 ? record.ldbp : record.rdbp,
    pulse: record.pulse,
    fbs: record.fbs,
  }
}

/**
 * 条件查询门诊数据
 * 至少提供一个条件（name/sex/age/checkDate）
 * 按 checkDate 倒序，最多返回 20 条
 */
export function getPatientDataByCondition(params: {
  name?: string
  sex?: string
  age?: number
  checkDate?: string
  date?: string
}): PatientConditionItem[] {
  const date = params.checkDate ?? params.date
  const allData = [...imedicalData, ...outpatientConditionData]

  const filtered = allData.filter((r) => {
    if (params.name && !r.name.includes(params.name)) return false
    if (params.sex && r.sex !== params.sex) return false
    if (params.age !== undefined && r.age !== params.age) return false
    if (date && !r.checkDate.startsWith(date)) return false
    return true
  })

  return filtered
    .sort(
      (a, b) =>
        new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime()
    )
    .slice(0, 20)
    .map(fromConditionRecord)
}

// ---- 模拟数据：门诊 (bu_outpatient_data) ----
const outpatientData: OutpatientRecord[] = [
  {
    checkDate: '2025-12-10 09:30:00',
    idcard: '330101199001010016',
    name: '张三',
    height: 172,
    weight: 75.5,
    waistline: '88',
    lsbp: 128,
    rsbp: 130,
    ldbp: 82,
    rdbp: 84,
    pulse: 72,
    fbs: 5.6,
  },
  {
    checkDate: '2025-11-05 14:20:00',
    idcard: '330101199001010016',
    name: '张三',
    height: 172,
    weight: 76.0,
    waistline: '89',
    lsbp: 132,
    rsbp: 135,
    ldbp: 85,
    rdbp: 88,
    pulse: 76,
    fbs: 6.1,
  },
  {
    checkDate: '2025-09-18 10:00:00',
    idcard: '330101199001010016',
    name: '张三',
    height: 172,
    weight: 77.2,
    waistline: '90',
    lsbp: null,
    rsbp: 138,
    ldbp: null,
    rdbp: 90,
    pulse: 78,
    fbs: 6.8,
  },
]

// ---- 模拟数据：随访 (bu_visit_data) ----
const visitData: VisitRecord[] = [
  {
    visitDate: '2026-01-15 08:45:00',
    idcard: '330101199001010016',
    name: '张三',
    height: 172,
    weight: 74.8,
    lsbp: 125,
    rsbp: 127,
    ldbp: 80,
    rdbp: 82,
    heartRate: 70,
    fbs: 5.3,
  },
  {
    visitDate: '2025-10-20 09:15:00',
    idcard: '330101199001010016',
    name: '张三',
    height: 172,
    weight: 76.5,
    lsbp: 130,
    rsbp: null,
    ldbp: 84,
    rdbp: null,
    heartRate: 74,
    fbs: 5.9,
  },
]

/** 将门诊记录转换为统一格式 */
function fromOutpatient(record: OutpatientRecord): PatientDataItem {
  return {
    check_date: record.checkDate,
    idcard: record.idcard,
    name: record.name,
    height: record.height,
    weight: record.weight,
    waistline: record.waistline,
    sbp: record.lsbp ?? record.rsbp,
    dbp: record.ldbp ?? record.rdbp,
    pulse: record.pulse,
    fbs: record.fbs,
  }
}

/** 将随访记录转换为统一格式 */
function fromVisit(record: VisitRecord): PatientDataItem {
  return {
    check_date: record.visitDate,
    idcard: record.idcard,
    name: record.name,
    height: record.height,
    weight: record.weight,
    waistline: '',
    sbp: record.lsbp ?? record.rsbp,
    dbp: record.ldbp ?? record.rdbp,
    pulse: record.heartRate,
    fbs: record.fbs,
  }
}

/**
 * 查询患者数据
 * 合并门诊 + 随访，按时间倒序返回最近 20 条
 */
export function getPatientData(idcard: string): PatientDataItem[] {
  const filteredOutpatient = outpatientData.filter(
    (r) => r.idcard === idcard
  )
  const filteredVisit = visitData.filter(
    (r) => r.idcard === idcard
  )

  const merged = [
    ...filteredOutpatient.map(fromOutpatient),
    ...filteredVisit.map(fromVisit),
  ]

  merged.sort(
    (a, b) =>
      new Date(b.check_date).getTime() - new Date(a.check_date).getTime()
  )

  return merged.slice(0, 20)
}
