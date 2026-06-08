export type RedPacketType = 'receive' | 'send';
export type ChannelType = 'wechat' | 'alipay' | 'cash';
export type OccasionType = 'newyear' | 'wedding' | 'baby' | 'moving' | 'other';
export type ReciprocityStatus = 'pending' | 'balanced' | 'none';

export interface RedPacket {
  id: string;
  relation: string;
  amount: number;
  type: RedPacketType;
  channel: ChannelType;
  date: string;
  time: string;
  createdAt: string;
  occasion: OccasionType;
  remark: string;
  reciprocityStatus: ReciprocityStatus;
}

export interface Summary {
  totalReceive: number;
  totalSend: number;
  netAmount: number;
}

export interface RelationStat {
  name: string;
  value: number;
}

export interface DailyStat {
  date: string;
  dateLabel: string;
  receive: number;
  send: number;
}

export interface ReconciliationStat {
  relation: string;
  totalReceive: number;
  totalSend: number;
  netAmount: number;
  isUpsideDown: boolean;
  recordCount: number;
}

export interface FormData {
  relation: string;
  amount: number;
  type: RedPacketType;
  channel: ChannelType;
  date: string;
  time: string;
  quickAddCount: number;
  occasion: OccasionType;
  remark: string;
  reciprocityStatus: ReciprocityStatus;
}

export const RELATION_OPTIONS = [
  '爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆',
  '伯父', '伯母', '叔叔', '婶婶', '舅舅', '舅妈',
  '姑姑', '姑父', '姨父', '姨妈',
  '哥哥', '姐姐', '弟弟', '妹妹',
  '堂哥', '堂姐', '堂弟', '堂妹',
  '表哥', '表姐', '表弟', '表妹',
  '侄子', '侄女', '外甥', '外甥女',
  '其他亲戚', '朋友', '同事', '同学'
];

export const CHANNEL_OPTIONS: { value: ChannelType; label: string; icon: string }[] = [
  { value: 'wechat', label: '微信', icon: '💬' },
  { value: 'alipay', label: '支付宝', icon: '💰' },
  { value: 'cash', label: '现金', icon: '💵' },
];

export const TYPE_OPTIONS: { value: RedPacketType; label: string }[] = [
  { value: 'receive', label: '收红包' },
  { value: 'send', label: '发红包' },
];

export const OCCASION_OPTIONS: { value: OccasionType; label: string; icon: string }[] = [
  { value: 'newyear', label: '拜年', icon: '🧧' },
  { value: 'wedding', label: '婚礼', icon: '💒' },
  { value: 'baby', label: '满月', icon: '👶' },
  { value: 'moving', label: '乔迁', icon: '🏠' },
  { value: 'other', label: '其他', icon: '📝' },
];

export const RECIPROCITY_OPTIONS: { value: ReciprocityStatus; label: string; color: string }[] = [
  { value: 'pending', label: '待回礼', color: '#F39C12' },
  { value: 'balanced', label: '已平账', color: '#27AE60' },
  { value: 'none', label: '无需回礼', color: '#95A5A6' },
];

export const MAX_RECORDS = 50;
