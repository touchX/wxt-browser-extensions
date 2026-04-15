# get_patient_data API 接口文档

## 1. 概述

`get_patient_data` 是一个用于获取特定患者历史健康数据的 API 接口。该接口通过查询 `view_union` 视图来获取患者的体检、诊前检查和随访数据，并按时间倒序排列返回最多50条记录。

## 2. 接口详情

### 2.1 基本信息
- **接口地址**: `/api/preVisit/get_patient_data`
- **请求方法**: GET
- **功能描述**: 根据身份证号码获取患者的健康历史数据

### 2.2 请求参数

| 参数名   | 类型   | 必填 | 描述           |
| -------- | ------ | ---- | -------------- |
| idcard   | string | 是   | 患者身份证号码 |
| deviceSn | string | 是   | 设备序列号     |

### 2.3 请求示例

```javascript
// 获取特定患者的健康数据
GET /api/preVisit/get_patient_data?idcard=110101199001011234&deviceSn=DEV123456789
```

## 3. 响应格式

### 3.1 成功响应
```json
{
  "state": "ok",
  "data": [
    {
      "source": "体检",
      "date": "2023-05-15",
      "idcard": "110101199001011234",
      "name": "张三",
      "height": "175.0",
      "weight": "70.0",
      "waistline": "85.0",
      "fbs": "5.5",
      "lsbp": 120,
      "ldbp": 80,
      "rsbp": 122,
      "rdbp": 82,
      "heartRate": 75,
      "status": 1,
      "created": "2023-05-15 10:30:00",
      "region": "北京市"
    }
  ]
}
```

### 3.2 失败响应
```json
{
  "state": "fail",
  "msg": "未找到相关数据"
}
```

或

```json
{
  "state": "fail",
  "msg": "该设备没有权限！"
}
```

## 4. 数据字段说明

| 字段名     | 类型   | 描述                           |
| ---------- | ------ | ------------------------------ |
| source     | string | 数据来源（'体检'、'诊前'、'随访'） |
| date       | string | 检查日期                       |
| idcard     | string | 身份证号码                     |
| name       | string | 姓名                           |
| height     | string | 身高(cm)                       |
| weight     | string | 体重(kg)                       |
| waistline  | string | 腰围(cm)                       |
| fbs        | string | 空腹血糖(mmol/L)               |
| lsbp       | int    | 左臂收缩压(mmHg)               |
| ldbp       | int    | 左臂舒张压(mmHg)               |
| rsbp       | int    | 右臂收缩压(mmHg)               |
| rdbp       | int    | 右臂舒张压(mmHg)               |
| heartRate  | int    | 心率(次/分)                    |
| status     | int    | 状态                           |
| created    | string | 创建时间                       |
| region     | string | 地区                           |

## 5. 使用示例

### 5.1 JavaScript (使用 fetch)
```javascript
// 获取患者健康数据
async function getPatientData(idcard, deviceSn) {
  try {
    const response = await fetch(`/api/preVisit/get_patient_data?idcard=${idcard}&deviceSn=${deviceSn}`);
    const result = await response.json();
    
    if (result.state === 'ok') {
      console.log('患者数据:', result.data);
      return result.data;
    } else {
      console.error('获取数据失败:', result.msg);
      return null;
    }
  } catch (error) {
    console.error('请求异常:', error);
    return null;
  }
}

// 使用示例
getPatientData('110101199001011234', 'DEV123456789');
```

### 5.2 Python (使用 requests)
```python
import requests

def get_patient_data(idcard, deviceSn):
    url = f'/api/preVisit/get_patient_data?idcard={idcard}&deviceSn={deviceSn}'
    response = requests.get(url)
    
    if response.status_code == 200:
        result = response.json()
        if result['state'] == 'ok':
            print('患者数据:', result['data'])
            return result['data']
        else:
            print('获取数据失败:', result['msg'])
            return None
    else:
        print('请求失败:', response.status_code)
        return None

# 使用示例
get_patient_data('110101199001011234', 'DEV123456789')
```

## 6. 注意事项

1. **权限验证**：
   - 该接口需要有效的设备序列号(deviceSn)才能访问
   - 设备必须在系统中注册且状态为启用(status=1)

2. **数据来源**：
   - 该接口通过 `view_union` 视图获取数据，该视图整合了三个数据源：
     - 体检数据 (bu_physical_data)
     - 诊前检查数据 (bu_iot_data)
     - 随访数据 (bu_visit_data)

3. **数据限制**：
   - 接口最多返回50条记录
   - 数据按检查日期倒序排列

4. **字段说明**：
   - 不同数据源的字段完整性可能不同，例如随访数据中 waistline 字段可能为 NULL
   - 心率字段在诊前检查中通过 COALESCE(lhr, rhr) 获取，优先使用左臂心率

5. **错误处理**：
   - 当未找到相关数据时，接口返回失败状态和相应提示信息
   - 当设备没有权限时，接口返回权限错误信息
   - 调用方应正确处理成功和失败两种情况

## 7. 错误码说明

| 错误码 | 描述                     |
| ------ | ------------------------ |
| ok     | 请求成功，返回数据       |
| fail   | 请求失败，未找到相关数据或设备无权限 |

## 8. 版本信息

- **当前版本**: v1.0
- **更新时间**: 2025-08-26

# getPatientDataByCondition API 接口文档

## 1. 概述

`getPatientDataByCondition` 用于按条件查询患者在 `bu_outpatient_data` 表中的诊前检查数据，按 `checkDate` 倒序返回最多 20 条记录。

## 2. 接口详情

### 2.1 基本信息
- **接口地址**: `/api/preVisit/getPatientDataByCondition`
- **请求方法**: GET（支持 OPTIONS 预检）
- **功能描述**: 按姓名/性别/年龄/检查日期查询诊前检查数据（至少提供一个条件）

### 2.2 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| name | string | 否 | 姓名（模糊匹配，LIKE %name%） |
| sex | string | 否 | 性别（精确匹配） |
| age | int | 否 | 年龄（精确匹配） |
| checkDate | string | 否 | 检查日期，格式：yyyy-MM-dd（精确匹配） |
| date | string | 否 | 检查日期别名（当 checkDate 为空时使用） |

### 2.3 请求示例

```bash
curl -G "http://your-domain.com/api/preVisit/getPatientDataByCondition" ^
  --data-urlencode "name=张三" ^
  --data-urlencode "sex=男" ^
  --data-urlencode "age=30" ^
  --data-urlencode "checkDate=2026-01-15"
```

## 3. 响应格式

### 3.1 成功响应

```json
{
  "state": "ok",
  "data": [
    {
      "checkDate": "2026-01-15",
      "idcard": "440100199001010001",
      "name": "张三",
      "height": 175.0,
      "weight": 70.0,
      "waistline": 85.0,
      "sbp": 120,
      "dbp": 80,
      "pulse": 75,
      "fbs": 5.5
    }
  ]
}
```

### 3.2 失败响应

缺少查询条件：

```json
{
  "state": "fail",
  "msg": "缺少查询条件"
}
```

未找到相关数据：

```json
{
  "state": "fail",
  "msg": "未找到相关数据"
}
```

## 4. 返回字段说明

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| checkDate | string | 检查日期 |
| idcard | string | 身份证号码 |
| name | string | 姓名 |
| height | number | 身高 |
| weight | number | 体重 |
| waistline | number | 腰围 |
| sbp | int | 收缩压：优先取 lsbp，若 lsbp<=0 则取 rsbp |
| dbp | int | 舒张压：优先取 ldbp，若 ldbp<=0 则取 rdbp |
| pulse | int | 脉搏/心率 |
| fbs | number | 空腹血糖 |

## 5. 说明

1. **数据来源**：仅查询 `bu_outpatient_data`。
2. **返回条数**：按 `checkDate` 倒序，最多返回 20 条。
3. **跨域**：接口设置了 CORS 响应头并处理 OPTIONS 预检请求。
