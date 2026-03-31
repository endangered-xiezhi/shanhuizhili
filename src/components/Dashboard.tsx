import React, { useState, useEffect } from "react";
import { StatCard } from "./StatCard";
import { Meeting } from "../types";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

const initialMeetings: Meeting[] = [
  { id: "1", title: "2026年第一次临时股东大会", type: "股东会", date: "2026-04-10", status: "筹备中", complianceScore: 98, notifiedDays: 11 },
  { id: "2", title: "第三届董事会第十二次会议", type: "董事会", date: "2026-03-30", status: "进行中", complianceScore: 85, notifiedDays: 10 },
  { id: "3", title: "2025年度监事会工作会议", type: "监事会", date: "2026-03-15", status: "已结束", complianceScore: 100, notifiedDays: 15 },
];

export const Dashboard: React.FC = () => {
  const [meetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem("corporate_meetings_list");
    return saved ? JSON.parse(saved) : initialMeetings;
  });
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-serif font-bold text-mck-navy">全局控制台</h2>
        <p className="text-mck-navy/60 mt-1">实时监控三会运作合规性与进度</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="待办会议" content="02" />
        <StatCard title="合规指数" content="94.5%" />
        <StatCard title="法定通知预警" content="01" type="red" />
        <StatCard title="文书生成率" content="100%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="mck-card">
            <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
              <Clock size={20} className="text-mck-blue" />
              近期会议日程
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-mck-border text-[10px] uppercase tracking-widest text-mck-navy/40">
                    <th className="pb-4 font-medium">会议名称</th>
                    <th className="pb-4 font-medium">类型</th>
                    <th className="pb-4 font-medium">日期</th>
                    <th className="pb-4 font-medium">通知状态</th>
                    <th className="pb-4 font-medium">合规性</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {meetings.map((m) => (
                    <tr key={m.id} className="border-b border-mck-border last:border-0">
                      <td className="py-4 font-medium">{m.title}</td>
                      <td className="py-4 text-mck-navy/60">{m.type}</td>
                      <td className="py-4 font-mono">{m.date}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase ${m.notifiedDays >= 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          提前 {m.notifiedDays} 日
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-mck-bg rounded-full overflow-hidden">
                            <div className="h-full bg-mck-blue" style={{ width: `${m.complianceScore}%` }} />
                          </div>
                          <span className="text-[10px] font-bold">{m.complianceScore}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="mck-card mck-card-accent-red">
            <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2 text-mck-red">
              <AlertCircle size={20} />
              合规风险拦截
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="text-xs font-bold text-red-800 uppercase mb-1">程序性违规</p>
                <p className="text-sm text-red-900">股东大会通知时间不足15日（当前11日），建议推迟会议或获取全体股东豁免。</p>
              </div>
              <div className="p-4 bg-orange-50 border-l-4 border-orange-500">
                <p className="text-xs font-bold text-orange-800 uppercase mb-1">实质性风险</p>
                <p className="text-sm text-orange-900">议案三涉及关联交易，表决程序需排除关联董事张某。</p>
              </div>
            </div>
          </div>

          <div className="mck-card mck-card-accent-blue">
            <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-mck-blue" />
              RAG 法律库动态
            </h3>
            <ul className="text-sm space-y-3 text-mck-navy/80">
              <li className="flex gap-2">
                <span className="text-mck-blue font-bold">NEW</span>
                <span>2024《公司法》第111条：董事会会议通知期限更新。</span>
              </li>
              <li className="flex gap-2">
                <span className="text-mck-blue font-bold">UPD</span>
                <span>证监会关于独立董事管理办法最新修订。</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
