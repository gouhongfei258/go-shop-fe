export const STOCK_STATUS_MAP: Record<string, string> = {
  in_stock: '有货',
  low_stock: '库存不足',
  out_of_stock: '暂时缺货',
  unknown: '未知',
} as const

export const MOVEMENT_TYPE_MAP: Record<string, string> = {
  reservation: '预扣库存（下单）',
  deduction: '正式扣减（支付成功）',
  release: '释放预扣（取消订单）',
  restock: '补货入库',
  adjustment: '盘点调整',
} as const

export const PAYMENT_METHODS = ['alipay', 'wechat_pay'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const SORT_OPTIONS = [
  { value: 'newest', label: '最新' },
  { value: 'oldest', label: '最早' },
  { value: 'highest', label: '评分最高' },
  { value: 'lowest', label: '评分最低' },
  { value: 'most_liked', label: '最多点赞' },
] as const
