import { Hono } from 'hono'
import { getPatientData, getPatientDataByCondition } from '../services/patientData'

const preVisit = new Hono()

preVisit.get('/getPatientData', (c) => {
  const idcard = c.req.query('idcard')

  if (!idcard) {
    return c.json({ state: 'fail', msg: 'idcard 参数必填' })
  }

  const data = getPatientData(idcard)

  if (data.length === 0) {
    return c.json({ state: 'fail', msg: '未找到相关数据' })
  }

  return c.json({ state: 'ok', data })
})

preVisit.get('/getPatientDataByCondition', (c) => {
  const name = c.req.query('name') ?? undefined
  const sex = c.req.query('sex') ?? undefined
  const ageStr = c.req.query('age')
  const checkDate = c.req.query('checkDate') ?? undefined
  const date = c.req.query('date') ?? undefined

  if (!name && !sex && !ageStr && !checkDate && !date) {
    return c.json({ state: 'fail', msg: '缺少查询条件' })
  }

  const age = ageStr ? parseInt(ageStr, 10) : undefined
  const data = getPatientDataByCondition({ name, sex, age, checkDate, date })

  if (data.length === 0) {
    return c.json({ state: 'fail', msg: '未找到相关数据' })
  }

  return c.json({ state: 'ok', data })
})

export default preVisit
