// Popup main script - 健康体检数据展示

// getPatientDataByCondition 返回的记录结构
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

// 内存中的健康数据（popup关闭即清空）
let fetchedHealthData: PatientConditionItem | null = null

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ===== UI Helpers =====

function showToast(message: string, type: 'success' | 'error') {
  const toast = document.getElementById('toast')!
  toast.textContent = message
  toast.className = `toast visible ${type}`
  setTimeout(() => { toast.className = 'toast' }, 3000)
}

function setFieldValue(id: string, value: string | number | null | undefined) {
  const el = document.getElementById(id)
  if (el && value != null && value !== '') {
    el.textContent = String(value)
  }
}

// ===== Tab Switching =====

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn')
  const tabContents = document.querySelectorAll('.tab-content')

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab')
      tabBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      tabContents.forEach(content => {
        content.classList.remove('active')
        if (content.id === `panel-${tabId}`) {
          content.classList.add('active')
        }
      })
    })
  })
}

// ===== Button 1: 从页面提取患者信息 =====

async function extractIdCardFromPage() {
  const btn = document.getElementById('btnExtractId')!
  btn.classList.add('loading')
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) {
      showToast('无法获取当前标签页', 'error')
      return
    }

    // 批量提取：姓名/性别/年龄/登记号/体检日期
    const results = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        function findById(root: Document, targetId: string): string | null {
          const el = root.getElementById(targetId)
          if (el) return (el as HTMLInputElement).value || el.textContent?.trim() || el.innerText?.trim() || null

          const iframes = root.querySelectorAll('iframe')
          for (let i = 0; i < iframes.length; i++) {
            try {
              const doc = iframes[i].contentDocument || (iframes[i].contentWindow as any)?.document
              if (doc) {
                const found = findById(doc, targetId)
                if (found) return found
              }
            } catch {
              // 跨域 iframe 无法访问
            }
          }
          return null
        }

        return {
          name: findById(document, 'patName'),
          gender: findById(document, 'sexName'),
          age: findById(document, 'Age'),
          regNo: findById(document, 'PatNo'),
          checkDate: findById(document, 'PEDate'),
        }
      },
    })

    const data = results?.[0]?.result as {
      name?: string; gender?: string; age?: string
      regNo?: string; checkDate?: string
    } | undefined

    if (!data || !data.name) {
      showToast('未在页面找到患者信息，请确认已选中患者', 'error')
      return
    }

    // 更新全局患者信息（供后续保存到 storage 使用）
    extractedPatientInfo = {
      name: data.name,
      gender: data.gender,
      age: data.age,
      regNo: data.regNo,
    }

    // 填入 popup 表单
    setFieldValue('name', data.name)
    setFieldValue('gender', data.gender)
    setFieldValue('age', data.age)
    setFieldValue('regNo', data.regNo)
    setFieldValue('checkDate', data.checkDate)

    const filled = [data.name, data.gender, data.age, data.regNo, data.checkDate]
      .filter(Boolean).length
    showToast(`提取成功，已填入 ${filled} 个字段`, 'success')
  } catch (error) {
    showToast('提取失败：' + (error as Error).message, 'error')
  } finally {
    btn.classList.remove('loading')
  }
}

// ===== Button 2: 从后台获取用户数据 (按条件查询) =====

async function fetchUserDataFromServer() {
  const btn = document.getElementById('btnFetchData')!
  btn.classList.add('loading')
  try {
    // 从 popup 表单获取查询条件
    const name = document.getElementById('name')?.textContent?.trim()
    const gender = document.getElementById('gender')?.textContent?.trim()
    const ageEl = document.getElementById('age')?.textContent?.trim()
    const checkDate = document.getElementById('checkDate')?.textContent?.trim()

    if (!name && !gender && !ageEl && !checkDate) {
      showToast('请先点击"获取患者信息"提取患者数据', 'error')
      return
    }

    // 构建查询参数
    const params = new URLSearchParams()
    if (name) params.set('name', name)
    if (gender) params.set('sex', gender)
    if (ageEl) {
      const ageNum = parseInt(ageEl.replace('岁', '').trim(), 10)
      if (!isNaN(ageNum)) params.set('age', String(ageNum))
    }
    if (checkDate) params.set('date', checkDate)

    const res = await fetch(`${SERVER_URL}/api/preVisit/getPatientDataByCondition?${params}`)
    const json = await res.json() as {
      state: string
      data?: PatientConditionItem[]
      msg?: string
    }

    if (json.state !== 'ok' || !json.data?.length) {
      showToast(json.msg || '未找到相关数据', 'error')
      return
    }

    // 取最新一条数据，填入各 Tab 面板
    const latest = json.data[0]

    // 保存到内存（popup关闭即清空）
    fetchedHealthData = latest

    // 基础信息面板：身份证号 / 身高 / 体重 / 腰围
    setFieldValue('idCard', latest.idcard)
    setFieldValue('height', latest.height)
    setFieldValue('weight', latest.weight)
    setFieldValue('waist', latest.waistline)

    // 血压面板：sbp/dbp 为左侧值，右侧暂用相同值（服务端原始数据有 lsbp/rsbp/ldbp/rdbp，但返回结构只有 sbp/dbp）
    setFieldValue('leftSystolic', latest.sbp)
    setFieldValue('leftDiastolic', latest.dbp)
    setFieldValue('rightSystolic', '')
    setFieldValue('rightDiastolic', '')
    setFieldValue('pulseRate', latest.pulse)

    // 血糖面板
    setFieldValue('fastingGlucose', latest.fbs)

    showToast(`获取成功：${latest.checkDate}，血糖 ${latest.fbs} mmol/L`, 'success')
  } catch (error) {
    showToast('请求失败：' + (error as Error).message, 'error')
  } finally {
    btn.classList.remove('loading')
  }
}

// ===== Auto: 打开时自动提取患者信息 =====

// 当前页面提取的患者信息（供后续使用）
let extractedPatientInfo: { name?: string; gender?: string; age?: string; regNo?: string } = {}

// 从嵌套 iframe 中递归查找指定 ID 元素的文本值
async function autoExtractPatName() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    // 批量提取多个字段，减少脚本注入次数
    const results = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        function findById(root: Document, targetId: string): string | null {
          const el = root.getElementById(targetId)
          if (el) return (el as HTMLInputElement).value || el.textContent?.trim() || el.innerText?.trim() || null

          const iframes = root.querySelectorAll('iframe')
          for (let i = 0; i < iframes.length; i++) {
            try {
              const doc = iframes[i].contentDocument || (iframes[i].contentWindow as any)?.document
              if (doc) {
                const found = findById(doc, targetId)
                if (found) return found
              }
            } catch {
              // 跨域 iframe 无法访问
            }
          }
          return null
        }

        // 提取多个字段
        return {
          patName: findById(document, 'patName'),
          patSex: findById(document, 'sexName'),
          patAge: findById(document, 'Age'),
          regNo: findById(document, 'PatNo'),
        }
      },
    })

    const data = results?.[0]?.result as { patName?: string; patSex?: string; patAge?: string; regNo?: string } | undefined
    if (data) {
      extractedPatientInfo = {
        name: data.patName,
        gender: data.patSex,
        age: data.patAge,
        regNo: data.regNo,
      }

      setFieldValue('name', data.patName)
      setFieldValue('gender', data.patSex)
      setFieldValue('age', data.patAge)
      setFieldValue('regNo', data.regNo)
    }
  } catch {
    // 静默失败，不影响其他功能
  }
}

// ===== Init =====

initTabs()
autoExtractPatName()

document.getElementById('btnExtractId')?.addEventListener('click', extractIdCardFromPage)
document.getElementById('btnFetchData')?.addEventListener('click', fetchUserDataFromServer)

// ===== Button 3: 插入患者数据到 iMedical 一般检查表单 =====

async function insertDataToPage() {
  const btn = document.getElementById('btnShowData')!
  btn.classList.add('loading')
  try {
    // 检查是否有获取的患者数据
    if (!fetchedHealthData) {
      showToast('无患者数据，请先点击"获取患者数据"', 'error')
      return
    }

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) {
      showToast('无法获取当前标签页', 'error')
      return
    }

    // 先获取当前页面患者姓名，与获取的数据进行比对
    const pageInfo = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        function findById(root: Document, targetId: string): string | null {
          const el = root.getElementById(targetId)
          if (el) return (el as HTMLInputElement).value || el.textContent?.trim() || el.innerText?.trim() || null

          const iframes = root.querySelectorAll('iframe')
          for (let i = 0; i < iframes.length; i++) {
            try {
              const doc = iframes[i].contentDocument || (iframes[i].contentWindow as any)?.document
              if (doc) {
                const found = findById(doc, targetId)
                if (found) return found
              }
            } catch {
              // 跨域 iframe 无法访问
            }
          }
          return null
        }
        return {
          name: findById(document, 'patName'),
        }
      },
    })

    const pageData = pageInfo?.[0]?.result as { name?: string } | undefined
    const pageName = pageData?.name?.trim()

    if (!pageName) {
      showToast('无法获取页面患者姓名', 'error')
      return
    }

    // 比对姓名是否一致
    if (pageName !== fetchedHealthData.name) {
      showToast(`患者姓名不匹配：页面"${pageName}"，数据"${fetchedHealthData.name}"`, 'error')
      return
    }

    // 将数据注入到 iMedical 一般检查表单（身高/体重/收缩压/舒张压/脉率）
    const outcomes = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: (fields) => {
        // 在嵌套 iframe 中找到 StationID=1 的 frame
        function findTargetFrame(root: Document): Document | null {
          const iframes = root.querySelectorAll('iframe')
          for (let i = 0; i < iframes.length; i++) {
            try {
              const iframe = iframes[i]
              const src = iframe.src || ''
              // StationID=1 = 一般检查（包含身高/体重/血压/脉率）
              if (src.includes('StationID=1')) {
                const doc = iframe.contentDocument
                if (doc && doc.getElementById('IDStr')) return doc
              }
              // 递归进入嵌套 iframe
              const subIframes = iframe.contentDocument?.querySelectorAll('iframe')
              if (subIframes) {
                for (let j = 0; j < subIframes.length; j++) {
                  try {
                    const subSrc = subIframes[j].src || ''
                    if (subSrc.includes('StationID=1')) {
                      const subDoc = subIframes[j].contentDocument
                      if (subDoc && subDoc.getElementById('IDStr')) return subDoc
                    }
                  } catch { /* cross-origin */ }
                }
              }
            } catch { /* cross-origin */ }
          }
          return null
        }

        // 查找目标 frame
        const targetDoc = findTargetFrame(document)
        if (!targetDoc) {
          return { filled: 0, total: 5, error: 'frame_not_found' }
        }

        // 从 IDStr 获取患者 EpisodeID，动态构建 textarea ID
        // IDStr 格式: "EpisodeId||1^1||22&EpisodeId||1^1||21&..."
        const idStrEl = targetDoc.getElementById('IDStr') as HTMLInputElement | null
        if (!idStrEl) {
          return { filled: 0, total: 5, error: 'idstr_not_found' }
        }
        const idStrVal = idStrEl.value || ''
        const firstPart = idStrVal.split('&')[0] || ''
        const episodeId = firstPart.split('||')[0]

        if (!episodeId) {
          return { filled: 0, total: 5, error: 'episode_id_missing' }
        }

        // ItemCode → 字段值映射（ID = episodeId||1^1||ItemCode）
        const itemCodes: Record<string, number | undefined> = {
          '22': fields.height,    // 身高
          '21': fields.weight,    // 体重
          '24': fields.sbp,      // 收缩压
          '25': fields.dbp,      // 舒张压
          '32': fields.pulse,    // 脉率
        }

        let filled = 0
        for (const [itemCode, value] of Object.entries(itemCodes)) {
          if (value == null) continue
          const taId = episodeId + '||1^1||' + itemCode
          const ta = targetDoc.getElementById(taId) as HTMLTextAreaElement | null
          if (ta) {
            ta.value = String(value)
            ta.dispatchEvent(new Event('input', { bubbles: true }))
            ta.dispatchEvent(new Event('change', { bubbles: true }))
            // 高亮填充的字段
            ta.style.backgroundColor = '#fef08a'
            ta.style.borderColor = '#f59e0b'
            ta.style.transition = 'background-color 0.3s ease'
            // 2秒后消退高亮
            setTimeout(() => {
              ta.style.backgroundColor = ''
              ta.style.borderColor = ''
            }, 2000)
            filled++
          }
        }

        return { filled, total: 5 }
      },
      args: [fetchedHealthData],
    })

    const outcome = outcomes?.[0]?.result as { filled: number; total: number; error?: string } | undefined
    if (outcome?.error === 'frame_not_found') {
      showToast('未找到体格检查表单，请确认已打开体检工作站', 'error')
    } else if (outcome?.error === 'idstr_not_found' || outcome?.error === 'episode_id_missing') {
      showToast('无法获取患者登记号，请刷新体检页面', 'error')
    } else if (outcome && outcome.filled > 0) {
      showToast(`已插入 ${outcome.filled}/${outcome.total} 个字段`, 'success')
    } else {
      showToast('未找到目标表单，请确认页面已加载体检表单', 'error')
    }
  } catch (error) {
    showToast('插入失败：' + (error as Error).message, 'error')
  } finally {
    btn.classList.remove('loading')
  }
}

document.getElementById('btnShowData')?.addEventListener('click', insertDataToPage)
