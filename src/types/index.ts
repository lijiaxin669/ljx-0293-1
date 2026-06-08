export type RedPacketType = 'receive' | 'send';
export type ChannelType = 'wechat' | 'alipay' | 'cash';

export interface RedPacket {
  id: string;
  relation: string;
  amount: number;
  type: RedPacketType;
  channel: ChannelType;
  date: string;
  time: string;
  createdAt: string;
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

export interface FormData {
  relation: string;
  amount: number;
  type: RedPacketType;
  channel: ChannelType;
  date: string;
  time: string;
  quickAddCount: number;
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

export const MAX_RECORDS = 50;
