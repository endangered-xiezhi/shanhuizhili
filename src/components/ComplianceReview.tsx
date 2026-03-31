import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, BookOpen, AlertTriangle, CheckCircle2, ArrowRight, Brain, RefreshCw, FileCheck } from "lucide-react";
import { ComplianceIssue, LegalArticle } from "../types";
import { cn } from "@/src/lib/utils";

const mockIssues: ComplianceIssue[] = [
  { id: "1", type: "程序性", title: "股东大会通知时间不足", description: "根据新公司法，临时股东大会应提前15日通知，当前仅提前11日。", lawReference: "《公司法》第111条", severity: "high", status: "待处理" },
  { id: "2", type: "实质性", title: "关联交易表决回避风险", description: "议案三涉及大股东资产注入，关联董事未在预审阶段明确回避意向。", lawReference: "《上市规则》第6.3条", severity: "medium", status: "待处理" },
  { id: "3", type: "程序性", title: "独董出席人数比例", description: "董事会应至少有1/3独立董事出席，当前确认出席人数仅达标，无缓冲余量。", lawReference: "《独董管理办法》第18条", severity: "medium", status: "已修正" },
];

const mockLaws: LegalArticle[] = [
  { id: "L1", title: "《中华人民共和国公司法》(2024修订)", content: "第一百一十一条：董事会会议，应于会议召开十日前通知全体董事和监事...", source: "全国人大常委会", updateDate: "2024-01-01" },
  { id: "L2", title: "《上市公司独立董事管理办法》", content: "第十八条：独立董事应当亲自出席董事会会议。因故不能亲自出席的，应当审慎选择并书面委托其他独立董事代为出席...", source: "证监会", updateDate: "2023-08-01" },
  { id: "L3", title: "《国有企业公司治理准则》", content: "第四十二条：重大决策事项应当经集体讨论决定，严禁个人或少数人擅自决定...", source: "国资委", updateDate: "2022-12-15" },
];

interface ComplianceReviewProps {
  meetingId?: string | null;
  onGenerateDocuments?: (id: string) => void;
}

export const ComplianceReview: React.FC<ComplianceReviewProps> = ({ meetingId, onGenerateDocuments }) => {
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [activeIssue, setActiveIssue] = useState<ComplianceIssue | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("corporate_compliance_issues");
    const allIssues: ComplianceIssue[] = saved ? JSON.parse(saved) : mockIssues;
    const filtered = meetingId ? allIssues.filter(i => i.meetingId === meetingId) : allIssues;
    setIssues(filtered);
    setActiveIssue(filtered[0] || null);
  }, [meetingId]);

  const handleGenerate = () => {
    if (!meetingId || !onGenerateDocuments) return;
    setIsGenerating(true);
    
    // Simulate document generation
    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        meetingId,
        title: "会议决议公告 (AI 生成)",
        type: "决议公告",
        date: new Date().toISOString().split('T')[0],
        status: "草稿"
      };
      const savedDocs = localStorage.getItem("corporate_generated_documents");
      const allDocs = savedDocs ? JSON.parse(savedDocs) : [];
      localStorage.setItem("corporate_generated_documents", JSON.stringify([...allDocs, newDoc]));
      
      setIsGenerating(false);
      onGenerateDocuments(meetingId);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-serif font-bold text-mck-navy">合规审查</h2>
        <p className="text-mck-navy/60 mt-1">基于 RAG 技术的穿透式法律风险拦截</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Issue List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="mck-card mck-card-accent-red">
            <h3 className="text-xs font-bold uppercase tracking-widest text-mck-navy/60 mb-6 flex items-center justify-between">
              风险雷达
              <span className="bg-red-100 text-mck-red px-2 py-0.5 rounded-full text-[10px]">{issues.length} 个活跃风险</span>
            </h3>
            <div className="space-y-4">
              {issues.map((issue) => (
                <div 
                  key={issue.id}
                  onClick={() => setActiveIssue(issue)}
                  className={cn(
                    "p-4 border cursor-pointer transition-all",
                    activeIssue?.id === issue.id ? "border-mck-blue bg-mck-blue/5" : "border-mck-border hover:border-mck-blue/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-1.5 py-0.5",
                      issue.severity === "high" ? "bg-red-100 text-mck-red" : "bg-orange-100 text-orange-700"
                    )}>
                      {issue.type}
                    </span>
                    <span className="text-[9px] text-mck-navy/40 font-mono">{issue.status}</span>
                  </div>
                  <h4 className="text-sm font-bold text-mck-navy mb-1">{issue.title}</h4>
                  <p className="text-xs text-mck-navy/60 line-clamp-2">{issue.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mck-card">
            <h3 className="text-xs font-bold uppercase tracking-widest text-mck-navy/60 mb-4">合规健康度</h3>
            <div className="flex items-end gap-4">
              <div className="text-4xl font-serif font-bold text-mck-blue">88</div>
              <div className="text-xs text-mck-navy/40 mb-1">/ 100</div>
              <div className="ml-auto text-xs text-green-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} />
                较上月提升 4%
              </div>
            </div>
            <div className="mt-4 h-2 bg-mck-bg rounded-full overflow-hidden">
              <div className="h-full bg-mck-blue w-[88%]" />
            </div>
          </div>
        </div>

        {/* Right: Detailed Audit & RAG */}
        <div className="lg:col-span-2 space-y-6">
          {activeIssue && (
            <div className="mck-card border-l-4 border-l-mck-blue">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-mck-blue/10 flex items-center justify-center text-mck-blue">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold">{activeIssue.title}</h3>
                    <p className="text-xs text-mck-navy/40 uppercase tracking-widest">风险详情与修正建议</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-2 bg-mck-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-mck-blue transition-all">
                    标记为已修正
                  </button>
                  {meetingId && onGenerateDocuments && (
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-6 py-2 bg-mck-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-mck-navy transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <FileCheck size={14} />}
                      {isGenerating ? "生成中..." : "生成会议文书"}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40 mb-2">风险描述</h4>
                    <p className="text-sm text-mck-navy/80 leading-relaxed">{activeIssue.description}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40 mb-2">AI 修正建议</h4>
                    <div className="p-4 bg-mck-bg border-l-4 border-mck-blue text-sm italic text-mck-navy/70">
                      "建议立即发布补充通知，将会议日期顺延4日，或通过电子投票系统获取全体股东对缩短通知期的书面豁免函。"
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40 mb-2">法律依据 (RAG 检索)</h4>
                    <div className="p-4 border border-mck-border space-y-3">
                      <div className="flex items-center gap-2 text-mck-blue">
                        <BookOpen size={14} />
                        <span className="text-xs font-bold">{activeIssue.lawReference}</span>
                      </div>
                      <p className="text-xs text-mck-navy/60 leading-relaxed">
                        {mockLaws.find(l => l.title.includes(activeIssue.lawReference.split('》')[0]))?.content || "正在检索详细条款..."}
                      </p>
                      <button className="text-[10px] font-bold text-mck-blue hover:underline flex items-center gap-1">
                        查看完整法条 <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mck-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif font-bold flex items-center gap-2">
                <Brain size={20} className="text-mck-blue" />
                2024 新公司法知识库 (RAG)
              </h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mck-navy/40" />
                <input 
                  type="text" 
                  placeholder="搜索法条、案例或监管问答..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-xs border border-mck-border focus:outline-none focus:border-mck-blue w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockLaws.map((law) => (
                <div key={law.id} className="p-4 border border-mck-border hover:bg-mck-bg transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-mck-navy group-hover:text-mck-blue transition-colors">{law.title}</h4>
                    <span className="text-[9px] text-mck-navy/40 font-mono">{law.updateDate}</span>
                  </div>
                  <p className="text-xs text-mck-navy/60 line-clamp-2 mb-3">{law.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-mck-navy/40">{law.source}</span>
                    <button className="text-[9px] font-bold text-mck-blue opacity-0 group-hover:opacity-100 transition-opacity">引用此条</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
