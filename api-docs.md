# EcommerceAPI — 前端 API 文档

> 基于 Gin Gateway 的所有 RESTful 接口，用于前端页面开发。

## 基本信息

| 项目 | 内容 |
|------|------|
| **Base URL** | `http://localhost:8080` |
| **数据格式** | 所有请求和响应均为 `application/json` |
| **认证方式** | `Authorization: Bearer <token>`（部分接口需要） |

### 统一响应格式

**成功：**
```json
{
  "data": { ... },
  "pagination": { "skip": 0, "take": 20 }  // 仅列表接口
}
```

**错误：**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

### 获取 Token

调用 `POST /api/v1/auth/register` 或 `POST /api/v1/auth/login` 后会返回：
```json
{ "data": { "token": "eyJhbGciOiJIUzI1NiIs..." } }
```

前端需将 token 存储在 `localStorage` 中，并在后续请求的 Header 中添加：
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 一、认证 (Auth)

### POST /api/v1/auth/register — 用户注册

🔓 无需认证

**请求体：**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 2~100 字符 |
| email | string | ✅ | 合法邮箱格式 |
| password | string | ✅ | 最少 6 位 |

**响应 `200 OK`：**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**错误：** `409` — 账号已存在 / `400` — 参数校验失败

---

### POST /api/v1/auth/login — 用户登录

🔓 无需认证

**请求体：**
```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

**响应 `200 OK`：**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**错误：** `401` — 登录失败（账号不存在或密码错误）

---

## 二、商品 (Products)

### GET /api/v1/products — 商品列表（含库存状态）

🔓 无需认证

**查询参数：**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| skip | int | 否 | 0 | 分页偏移 |
| take | int | 否 | 100 | 每页数量（最大 100） |
| query | string | 否 | - | 搜索关键词（全文搜索） |

**响应 `200 OK`：**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Camera",
      "description": "A digital camera",
      "price": 99.99,
      "account_id": 1,
      "stock": {
        "status": "in_stock",
        "available_qty": 25,
        "display_text": "有货"
      }
    }
  ],
  "pagination": { "skip": 0, "take": 20 }
}
```

**库存状态说明：**

| stock.status | stock.display_text | 含义 |
|-------------|-------------------|------|
| `in_stock` | `有货` | 库存充足 |
| `low_stock` | `仅剩 X 件` | 库存不足，剩 X 件 |
| `out_of_stock` | `暂时缺货` | 无库存 |
| `unknown` | `未知` | 库存服务异常 |

---

### GET /api/v1/products/:id — 商品详情

🔓 无需认证

**响应 `200 OK`：**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Camera",
    "description": "A digital camera",
    "price": 99.99,
    "account_id": 1,
    "stock": {
      "status": "in_stock",
      "available_qty": 25,
      "display_text": "有货"
    }
  }
}
```

**错误：** `404` — 商品不存在

---

### POST /api/v1/products — 创建商品

🔒 需要 JWT

**请求体：**
```json
{
  "name": "Camera",
  "description": "A digital camera",
  "price": 99.99
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 最多 200 字符 |
| description | string | ✅ | 最多 2000 字符 |
| price | float | ✅ | 必须大于 0 |

**响应 `201 Created`：** 创建的 Product 对象（同上）

---

### PUT /api/v1/products/:id — 更新商品

🔒 需要 JWT

**请求体：** 同创建商品

**响应 `200 OK`：** 更新后的 Product 对象

**错误：** `403` — 无权操作（非本人商品）

---

### DELETE /api/v1/products/:id — 删除商品

🔒 需要 JWT

**响应 `200 OK`：**
```json
{ "data": { "success": true } }
```

**错误：** `403` — 无权操作

---

### GET /api/v1/products/:id/stock — 查询商品库存

🔓 无需认证

**响应 `200 OK`：**
```json
{
  "data": {
    "product_id": "550e8400-e29b-41d4-a716-446655440000",
    "total_qty": 100,
    "reserved": 10,
    "sold": 30,
    "available_qty": 60,
    "stock_status": "in_stock",
    "low_stock_threshold": 10
  }
}
```

---

## 三、商品推荐 (Recommendations)

### GET /api/v1/products/recommendations — 基于浏览记录推荐

🔓 无需认证

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| viewedIds | string[] | 否 | 浏览过的商品 ID 数组 |
| skip | int | 否 | 分页偏移 |
| take | int | 否 | 每页数量 |

**响应 `200 OK`：**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "...",
      "price": 99.99
    }
  ],
  "pagination": { "skip": 0, "take": 10 }
}
```

---

### GET /api/v1/products/recommendations/me — 个性化推荐

🔒 需要 JWT

**查询参数：** 同 `skip` / `take`

**响应：** 同上，基于当前登录用户的浏览/购买历史

---

## 四、评论 (Reviews)

### GET /api/v1/products/:id/reviews — 商品评论列表

🔓 无需认证（但传入 JWT 时可识别"我是否点过赞"）

**查询参数：**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| skip | int | 否 | 0 | 分页偏移 |
| take | int | 否 | 10 | 每页数量（最大 50） |
| sort | string | 否 | newest | 排序: `newest` / `oldest` / `highest` / `lowest` / `most_liked` |
| rating | int | 否 | 0 | 按评分筛选（1~5，0 为全部） |
| has_content | bool | 否 | false | 只看有文字内容的评论 |

**响应 `200 OK`：**
```json
{
  "data": [
    {
      "id": 1,
      "product_id": "uuid",
      "user_id": 123,
      "rating": 5,
      "title": "非常好用！",
      "content": "画质清晰，操作简单，非常推荐。",
      "is_verified": true,
      "status": "approved",
      "likes": 3,
      "liked_by_me": false,
      "created_at": "2024-07-18T10:00:00Z",
      "updated_at": "2024-07-18T10:00:00Z"
    }
  ],
  "total": 50,
  "pagination": { "skip": 0, "take": 10 }
}
```

---

### POST /api/v1/products/:id/reviews — 创建评论

🔒 需要 JWT

⚠️ 一个用户对一个商品只能创建一条评论。

**请求体：**
```json
{
  "rating": 5,
  "title": "非常好用！",
  "content": "画质清晰，操作简单，非常推荐。"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| rating | int | ✅ | 1~5 |
| title | string | 否 | 最多 200 字符 |
| content | string | ✅ | 评论正文 |

**响应 `201 Created`：** 创建的 Review 对象

**错误：** `409` — 已评论过该商品

---

### GET /api/v1/products/:id/reviews/stats — 商品评分统计

🔓 无需认证

**响应 `200 OK`：**
```json
{
  "data": {
    "product_id": "uuid",
    "average_rating": 4.2,
    "total_reviews": 50,
    "rating_distribution": {
      "1": 2,
      "2": 3,
      "3": 10,
      "4": 15,
      "5": 20
    }
  }
}
```

---

### GET /api/v1/products/:id/reviews/:reviewId — 评论详情

🔓 无需认证

**响应 `200 OK`：** Review 对象

---

### PUT /api/v1/products/:id/reviews/:reviewId — 编辑评论

🔒 需要 JWT

⚠️ 只能编辑自己的评论。

**请求体：** 同创建评论

---

### DELETE /api/v1/products/:id/reviews/:reviewId — 删除评论

🔒 需要 JWT

⚠️ 只能删除自己的评论（软删除）。

**响应 `200 OK`：**
```json
{ "data": { "success": true } }
```

---

### GET /api/v1/me/reviews — 我的评论列表

🔒 需要 JWT

**查询参数：** `skip` / `take`

**响应：** 当前用户的 Review 数组 + total

---

### POST /api/v1/reviews/:reviewId/like — 点赞评论

🔒 需要 JWT

**响应 `200 OK`：**
```json
{ "data": { "success": true } }
```

**错误：** `409` — 已经点过赞了

---

### DELETE /api/v1/reviews/:reviewId/like — 取消点赞

🔒 需要 JWT

**响应 `200 OK`：**
```json
{ "data": { "success": true } }
```

---

### POST /api/v1/reviews/:reviewId/replies — 回复评论

🔒 需要 JWT

**请求体：**
```json
{
  "content": "谢谢你的评价！"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | ✅ | 回复内容 |

**响应 `201 Created`：**
```json
{
  "data": {
    "id": 1,
    "review_id": 1,
    "user_id": 123,
    "content": "谢谢你的评价！",
    "created_at": "2024-07-18T10:00:00Z"
  }
}
```

---

### GET /api/v1/reviews/:reviewId/replies — 查看评论回复

🔓 无需认证

**响应 `200 OK`：**
```json
{
  "data": [
    {
      "id": 1,
      "review_id": 1,
      "user_id": 123,
      "content": "谢谢你的评价！",
      "created_at": "2024-07-18T10:00:00Z"
    }
  ]
}
```

---

## 五、库存管理 (Inventory)

### POST /api/v1/inventory/restock — 补货入库

🔒 需要 JWT

**请求体：**
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 50,
  "remark": "采购入库"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| product_id | string | ✅ | 商品 UUID |
| quantity | int | ✅ | 补货数量，必须 > 0 |
| remark | string | 否 | 备注说明 |

**响应 `200 OK`：**
```json
{
  "data": {
    "product_id": "uuid",
    "total_qty": 150,
    "available_qty": 110
  }
}
```

---

### GET /api/v1/inventory/low-stock — 低库存商品列表

🔒 需要 JWT

**查询参数：** `skip` / `take`

**响应 `200 OK`：**
```json
{
  "data": [
    {
      "product_id": "uuid",
      "total_qty": 15,
      "reserved": 2,
      "sold": 10,
      "available_qty": 3,
      "stock_status": "low_stock",
      "low_stock_threshold": 10
    }
  ],
  "total": 5
}
```

---

### GET /api/v1/inventory/movements/:id — 库存变动流水

🔒 需要 JWT

**查询参数：** `skip` / `take`

**响应 `200 OK`：**
```json
{
  "data": [
    {
      "id": 1,
      "product_id": "uuid",
      "order_id": "ORDER-001",
      "change_qty": -1,
      "movement_type": "reservation",
      "reference_no": "ORDER-001",
      "remark": "",
      "created_at": "2024-07-18T10:00:00Z"
    }
  ],
  "total": 10
}
```

**movement_type 枚举：**

| 类型 | 含义 |
|------|------|
| `reservation` | 预扣库存（下单） |
| `deduction` | 正式扣减（支付成功） |
| `release` | 释放预扣（取消订单） |
| `restock` | 补货入库 |
| `adjustment` | 盘点调整 |

---

## 六、订单 (Orders)

### POST /api/v1/orders — 创建订单

🔒 需要 JWT

⚠️ 创建订单时会自动调用库存服务预扣库存，库存不足时订单会被拒绝。

**请求体：**
```json
{
  "products": [
    { "id": "PRODUCT_ID", "quantity": 2 }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| products | array | ✅ | 至少 1 项 |
| products[].id | string | ✅ | 商品 ID |
| products[].quantity | int | ✅ | 数量，必须 > 0 |

**响应 `201 Created`：**
```json
{
  "data": {
    "id": 1,
    "account_id": 123,
    "total_price": 199.98,
    "products": [
      { "id": "PRODUCT_ID", "name": "Camera", "price": 99.99, "quantity": 2 }
    ],
    "created_at": "..."
  }
}
```

**错误：** `400` — 库存不足

---

### GET /api/v1/orders — 我的订单列表

🔒 需要 JWT

**响应 `200 OK`：** 当前用户的 Order 数组

---

## 七、支付 (Payment)

### POST /api/v1/checkout/session — 创建支付会话

🔒 需要 JWT

**请求体：**
```json
{
  "accountId": 1,
  "email": "alice@example.com",
  "name": "Alice",
  "redirectUrl": "https://example.com",
  "orderId": 1,
  "products": [
    { "id": "PRODUCT_ID", "quantity": 1 }
  ],
  "paymentMethod": "alipay"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| accountId | int | ✅ | 用户 ID |
| email | string | ✅ | 邮箱 |
| name | string | ✅ | 用户名 |
| redirectUrl | string | ✅ | 支付完成后跳转 URL |
| orderId | int | ✅ | 订单 ID |
| products | array | ✅ | 商品列表 |
| paymentMethod | string | ✅ | `alipay` 或 `wechat_pay` |
| currency | string | 否 | 默认 `CNY` |

**响应 `200 OK`：**

根据 paymentMethod 不同，返回字段不同：

```json
{
  "data": {
    "paymentUrl": "https://openapi.alipay.com/gateway.do?xxx",  // 网页跳转支付
    "transactionNo": "TXN202407180001"
  }
}
```

| 返回字段 | 场景 |
|---------|------|
| `paymentUrl` | 支付宝网页支付 / 微信 H5 |
| `qrCode` | 扫码支付（支付宝 / 微信 native） |
| `payInfo` | APP 调起参数字符串 |
| `transactionNo` | 内部交易单号（所有方式都有） |

---

### POST /api/v1/customer-portal/session — 客户门户会话

🔒 需要 JWT

**请求体：**
```json
{
  "accountId": 1,
  "email": "alice@example.com",
  "name": "Alice"
}
```

---

## 八、账号 (Accounts)

### GET /api/v1/accounts — 账号列表

🔓 无需认证

**查询参数：** `skip` / `take`

**响应 `200 OK`：**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    }
  ],
  "pagination": { "skip": 0, "take": 20 }
}
```

---

### GET /api/v1/accounts/:id — 账号详情

🔓 无需认证

**响应 `200 OK`：** Account 对象

**错误：** `404` — 账号不存在

---

## 九、系统 (System)

### GET /health — 健康检查

🔓 无需认证

**响应 `200 OK`：**
```json
{
  "service": "gateway",
  "status": "ok"
}
```

---

## 页面与 API 对照表

| 前端页面 | 对应 API |
|---------|---------|
| 注册页 | `POST /auth/register` |
| 登录页 | `POST /auth/login` |
| 商品列表页 | `GET /products?skip=0&take=20` |
| 商品搜索 | `GET /products?query=camera` |
| 商品详情页 | `GET /products/:id` + `GET /products/:id/stock` + `GET /products/:id/reviews?skip=0&take=5` + `GET /products/:id/reviews/stats` |
| 商品创建/编辑页 | `POST /products` / `PUT /products/:id` |
| 评论列表 | `GET /products/:id/reviews?sort=newest` |
| 写评论弹窗 | `POST /products/:id/reviews` |
| 回复评论 | `POST /reviews/:reviewId/replies` |
| 点赞/取消 | `POST /reviews/:reviewId/like` / `DELETE /reviews/:reviewId/like` |
| 我的评论页 | `GET /me/reviews` |
| 下单页 | `POST /orders` |
| 订单列表页 | `GET /orders` |
| 支付页 | `POST /checkout/session` |
| 商品推荐模块 | `GET /products/recommendations` + `GET /products/recommendations/me` |
| 库存管理页 | `GET /inventory/low-stock` + `POST /inventory/restock` |
| 库存流水页 | `GET /inventory/movements/:id` |
| 账号列表页 | `GET /accounts` |

---

## 错误码速查

| HTTP 状态码 | 含义 | 常见原因 |
|-----------|------|---------|
| 200 | 成功 | - |
| 201 | 创建成功 | POST 请求 |
| 400 | 请求参数错误 | 必填字段缺失、格式不对 |
| 401 | 未认证 | 未传或传了无效的 JWT token |
| 403 | 无权限 | 尝试修改/删除非自己创建的资源 |
| 404 | 资源不存在 | 商品/评论/订单 ID 错误 |
| 409 | 冲突 | 重复注册、重复评论、重复点赞 |
| 500 | 服务器内部错误 | 后端异常 |

## 前端实现注意事项

1. **Token 管理**：登录/注册后保存 token 到 `localStorage`，每次请求带上 `Authorization` 头
2. **分页**：列表接口统一使用 `skip` / `take` 参数，响应带 `pagination` 字段
3. **商品列表的库存**：`GET /products` 已自动聚合库存状态，直接用 `data[].stock.display_text` 展示
4. **商品详情的库存**：`GET /products/:id` 已自动聚合库存，直接用 `data.stock.display_text` 展示
5. **评论排序**：推荐默认使用 `sort=newest`，提供切换排序的 UI
6. **支付重定向**：`/checkout/session` 返回的 `paymentUrl` 需要前端 `window.location.href` 跳转，或 `qrCode` 渲染二维码
7. **库存不足处理**：下单时后端会校验库存，`400` 响应表示库存不足，前端需提示用户
