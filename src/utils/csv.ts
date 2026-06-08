import type { RedPacket } from '../types';
import { CHANNEL_OPTIONS, OCCASION_OPTIONS, RECIPROCITY_OPTIONS, TYPE_OPTIONS } from '../types';

function getChannelLabel(channel: string): string {
  const opt = CHANNEL_OPTIONS.find(o => o.value === channel);
  return opt ? opt.label : channel;
}

function getOccasionLabel(occasion: string): string {
  const opt = OCCASION_OPTIONS.find(o => o.value === occasion);
  return opt ? opt.label : occasion;
}

function getReciprocityLabel(status: string): string {
  const opt = RECIPROCITY_OPTIONS.find(o => o.value === status);
  return opt ? opt.label : status;
}

function getTypeLabel(type: string): string {
  const opt = TYPE_OPTIONS.find(o => o.value === type);
  return opt ? opt.label : type;
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCSV(records: RedPacket[], filename?: string): void {
  const headers = [
    '亲友关系',
    '类型',
    '金额',
    '渠道',
    '日期',
    '时间',
    '场合',
    '回礼状态',
    '备注',
    '创建时间',
  ];

  const rows = records.map(record => [
    escapeCSV(record.relation),
    escapeCSV(getTypeLabel(record.type)),
    record.amount.toFixed(2),
    escapeCSV(getChannelLabel(record.channel)),
    escapeCSV(record.date),
    escapeCSV(record.time),
    escapeCSV(getOccasionLabel(record.occasion)),
    escapeCSV(getReciprocityLabel(record.reciprocityStatus)),
    escapeCSV(record.remark),
    escapeCSV(new Date(record.createdAt).toLocaleString('zh-CN')),
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  
  const defaultFilename = `红包记录_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', filename || defaultFilename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generatePrintHTML(records: RedPacket[], title: string = '红包对账单'): string {
  const totalReceive = records.filter(r => r.type === 'receive').reduce((sum, r) => sum + r.amount, 0);
  const totalSend = records.filter(r => r.type === 'send').reduce((sum, r) => sum + r.amount, 0);
  const netAmount = totalReceive - totalSend;

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
      padding: 40px;
      color: #1a1a2e;
      background: #fff;
    }
    .print-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #D72638;
    }
    .header h1 {
      font-size: 32px;
      color: #D72638;
      margin-bottom: 8px;
      font-family: 'Noto Serif SC', serif;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      background: #f9f9f9;
    }
    .summary-card.receive { background: #e8f5e9; }
    .summary-card.send { background: #ffebee; }
    .summary-card.net { background: #fff8e1; }
    .summary-card .label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
    .summary-card .amount {
      font-size: 28px;
      font-weight: bold;
    }
    .summary-card.receive .amount { color: #27ae60; }
    .summary-card.send .amount { color: #e74c3c; }
    .summary-card.net .amount { color: #f39c12; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
    }
    tr:hover {
      background: #fafafa;
    }
    .amount-receive { color: #27ae60; font-weight: 600; }
    .amount-send { color: #e74c3c; font-weight: 600; }
    .tag {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    .tag-pending { background: #fef3e2; color: #f39c12; }
    .tag-balanced { background: #e8f5e9; color: #27ae60; }
    .tag-none { background: #f0f0f0; color: #95a5a6; }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #999;
      font-size: 12px;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    @media print {
      body { padding: 20px; }
      .summary { grid-template-columns: repeat(3, 1fr); }
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="header">
      <h1>🧧 ${title}</h1>
      <p>生成时间：${new Date().toLocaleString('zh-CN')} · 共 ${records.length} 条记录</p>
    </div>

    <div class="summary">
      <div class="summary-card receive">
        <div class="label">总收入</div>
        <div class="amount">¥${totalReceive.toFixed(2)}</div>
      </div>
      <div class="summary-card send">
        <div class="label">总支出</div>
        <div class="amount">¥${totalSend.toFixed(2)}</div>
      </div>
      <div class="summary-card net">
        <div class="label">净收益</div>
        <div class="amount">${netAmount >= 0 ? '+' : ''}¥${netAmount.toFixed(2)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>序号</th>
          <th>亲友</th>
          <th>类型</th>
          <th>金额</th>
          <th>渠道</th>
          <th>日期</th>
          <th>场合</th>
          <th>回礼状态</th>
          <th>备注</th>
        </tr>
      </thead>
      <tbody>
        ${records.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.relation}</td>
            <td>${r.type === 'receive' ? '收红包' : '发红包'}</td>
            <td class="${r.type === 'receive' ? 'amount-receive' : 'amount-send'}">
              ${r.type === 'receive' ? '+' : '-'}¥${r.amount.toFixed(2)}
            </td>
            <td>${getChannelLabel(r.channel)}</td>
            <td>${r.date}</td>
            <td>${getOccasionLabel(r.occasion)}</td>
            <td>
              <span class="tag tag-${r.reciprocityStatus}">
                ${getReciprocityLabel(r.reciprocityStatus)}
              </span>
            </td>
            <td>${r.remark || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>压岁钱收支看板 · 数据本地存储 · 打印时间：${new Date().toLocaleString('zh-CN')}</p>
    </div>
  </div>
</body>
</html>
  `;
  
  return html;
}

export function printHTML(html: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('请允许弹出窗口以打印');
    return;
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}
