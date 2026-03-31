import React, { useState, useEffect } from "react";
import { Plus, Filter, Calendar as CalendarIcon, MoreHorizontal, ChevronRight } from "lucide-react";
import { Meeting, MeetingType } from "../types";
import { cn } from "@/src/lib/utils";

const initialMeetings: Meeting[] = [
  { id: "1", title: "2026年第一次临时股东大会", type: "股东会", date: "2026-04-10", status: "筹备中", complianceScore: 98, notifiedDays: 11 },
  { id: "2", title: "第三届董事会第十二次会议", type: "董事会", date: "2026-03-30", status: "进行中", complianceScore: 85, notifiedDays: 10 },
  { id: "3", title: "2025年度监事会工作会议", type: "监事会", date: "2026-03-15", status: "已结束", complianceScore: 100, notifiedDays: 15 },
  { id: "4", title: "关于股权激励计划的董事会专题会议", type: "董事会", date: "2026-04-20", status: "筹备中", complianceScore: 92, notifiedDays: 22 },
];

interface MeetingManagerProps {
  onStartMeeting?: (id: string) => void;
}

export const MeetingManager: React.FC<MeetingManagerProps> = ({ onStartMeeting }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem("corporate_meetings_list");
    return saved ? JSON.parse(saved) : initialMeetings;
  });
  const [filterType, setFilterType] = useState<MeetingType | "ALL">("ALL");

  useEffect(() => {
    localStorage.setItem("corporate_meetings_list", JSON.stringify(meetings));
  }, [meetings]);

  const filteredMeetings = filterType === "ALL" 
    ? meetings 
    : meetings.filter(m => m.type === filterType);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-mck-navy">会议管理</h2>
          <p className="text-mck-navy/60 mt-1">全生命周期管理三会运作流程</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-mck-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-mck-navy transition-all">
          <Plus size={16} />
          发起新会议
        </button>
      </header>

      <div className="flex items-center gap-4 border-b border-mck-border pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mck-navy/40 mr-4">
          <Filter size={14} />
          筛选:
        </div>
        {(["ALL", "股东会", "董事会", "监事会"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              "px-4 py-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
              filterType === type ? "border-mck-blue text-mck-blue" : "border-transparent text-mck-navy/40 hover:text-mck-navy"
            )}
          >
            {type === "ALL" ? "全部类型" : type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMeetings.map((meeting) => (
          <div key={meeting.id} className="mck-card group hover:border-mck-blue transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-mck-bg flex flex-col items-center justify-center text-mck-navy/40 group-hover:bg-mck-blue/10 group-hover:text-mck-blue transition-colors">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-mck-bg text-mck-navy/60">
                      {meeting.type}
                    </span>
                    <h4 className="text-base font-serif font-bold text-mck-navy">{meeting.title}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-mck-navy/40 font-mono uppercase tracking-wider">
                    <span>日期: {meeting.date}</span>
                    <span>•</span>
                    <span className={cn(
                      meeting.notifiedDays >= 10 ? "text-green-600" : "text-mck-red font-bold"
                    )}>
                      通知期: {meeting.notifiedDays}日
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-mck-navy/40 mb-1">合规指数</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-mck-bg rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", meeting.complianceScore > 90 ? "bg-green-500" : "bg-mck-blue")} 
                        style={{ width: `${meeting.complianceScore}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold font-mono">{meeting.complianceScore}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-3 py-1 border",
                    meeting.status === "进行中" ? "bg-mck-blue text-white border-mck-blue" : 
                    meeting.status === "筹备中" ? "bg-white text-mck-navy border-mck-border" : "bg-mck-bg text-mck-navy/40 border-mck-bg"
                  )}>
                    {meeting.status}
                  </span>
                  {meeting.status === "进行中" && onStartMeeting && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onStartMeeting(meeting.id); }}
                      className="px-4 py-1 bg-mck-blue text-white text-[10px] font-bold uppercase tracking-widest hover:bg-mck-navy transition-all"
                    >
                      开始会议
                    </button>
                  )}
                  <button className="p-2 text-mck-navy/20 hover:text-mck-navy transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                  <ChevronRight size={18} className="text-mck-navy/20 group-hover:text-mck-blue transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="mck-card bg-white border border-mck-border p-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-mck-navy/40 mb-6">程序合规引擎</h3>
          <p className="text-sm text-mck-navy/80 leading-relaxed mb-8">
            系统已自动对标 2024 新《公司法》，实时计算法定通知期限、出席人数比例及表决权权重。
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-mck-blue flex items-center justify-center text-[10px] font-bold text-white">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-mck-navy/40">3位合规专家在线</span>
          </div>
        </div>

        <div className="md:col-span-2 mck-card border-dashed">
          <div className="h-full flex flex-col items-center justify-center text-mck-navy/20 py-12">
            <CalendarIcon size={48} className="mb-4 opacity-10" />
            <p className="text-sm font-serif italic">暂无更多待办会议</p>
            <button className="mt-4 text-[10px] font-bold uppercase tracking-widest text-mck-blue hover:underline">
              查看历史会议档案
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
