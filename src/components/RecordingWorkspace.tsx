import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, User, Brain, AlertTriangle, FileCheck, RefreshCw } from "lucide-react";
import { ASRSegment, ComplianceIssue, KnowledgeItem } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI } from "@google/genai";
import { cn } from "@/src/lib/utils";

const initialKnowledge: KnowledgeItem[] = [
  { id: "k1", title: "中华人民共和国公司法 (2024修订)", category: "法律法规", content: "第一百一十一条：董事会会议，应于会议召开十日前通知全体董事和监事。董事会召开临时会议，可以另定召集董事会的通知方式和通知时限。", lastModified: "2024-01-01", status: "已生效" },
  { id: "k2", title: "智理科技股份有限公司章程", category: "公司章程", content: "第八十二条：公司董事会会议应当有过半数的董事出席方可举行。董事会作出决议，必须经全体董事的过半数通过。", lastModified: "2025-12-20", status: "已生效" },
  { id: "k3", title: "关联交易管理制度", category: "规章制度", content: "第十五条：公司与关联人发生的交易金额在3000万元以上，且占公司最近一期经审计净资产绝对值5%以上的关联交易，应当提交股东大会审议。", lastModified: "2026-01-15", status: "已生效" },
];

const mockASR: ASRSegment[] = [
  { id: "1", speaker: "王董事长", role: "董事长", text: "各位董事，现在开始审议关于公司向银行申请5000万元授信的议案。", timestamp: "10:00:05" },
  { id: "2", speaker: "李董秘", role: "董秘", text: "该授信主要用于补充流动资金，利率为3.5%，期限一年。", timestamp: "10:00:45" },
  { id: "3", speaker: "张独立董事", role: "独立董事", text: "我关注到公司目前的资产负债率已经接近65%，这次授信是否会触发重大资产重组的审批程序？", timestamp: "10:01:30" },
];

interface RecordingWorkspaceProps {
  meetingId?: string | null;
  onAnalysisComplete?: (id: string) => void;
}

export const RecordingWorkspace: React.FC<RecordingWorkspaceProps> = ({ meetingId, onAnalysisComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [segments, setSegments] = useState<ASRSegment[]>(() => {
    if (!meetingId) return mockASR;
    const saved = localStorage.getItem(`corporate_asr_segments_${meetingId}`);
    return saved ? JSON.parse(saved) : mockASR;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(() => {
    if (!meetingId) return null;
    return localStorage.getItem(`corporate_analysis_result_${meetingId}`);
  });
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (meetingId) {
      localStorage.setItem(`corporate_asr_segments_${meetingId}`, JSON.stringify(segments));
    }
  }, [segments, meetingId]);

  useEffect(() => {
    if (meetingId && analysisResult) {
      localStorage.setItem(`corporate_analysis_result_${meetingId}`, analysisResult);
    }
  }, [analysisResult, meetingId]);

  useEffect(() => {
    if (scrollRef.current) {
      try {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      } catch (e) {
        // Ignore errors from scrollRef not being mounted yet
      }
    }
  }, [segments]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate incoming ASR
      setTimeout(() => {
        const newSeg: ASRSegment = {
          id: Date.now().toString(),
          speaker: "刘监事",
          role: "监事",
          text: "监事会已对该议案进行预审，认为程序符合公司章程。",
          timestamp: new Date().toLocaleTimeString(),
        };
        setSegments(prev => [...prev, newSeg]);
      }, 2000);
    }
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // Fetch dynamic RAG context from localStorage
      const savedKnowledge = localStorage.getItem("corporate_knowledge_base");
      const knowledge: KnowledgeItem[] = savedKnowledge ? JSON.parse(savedKnowledge) : initialKnowledge;
      const ragContext = knowledge.map(k => `【${k.category}】${k.title}: ${k.content}`).join("\n\n");

      // Fetch user-configured API keys
      const savedSettings = localStorage.getItem("corporate_ai_settings");
      const settings = savedSettings ? JSON.parse(savedSettings) : null;
      const apiKey = settings?.geminiApiKey || process.env.GEMINI_API_KEY!;

      const ai = new GoogleGenAI({ apiKey });
      const fullText = segments.map(s => `${s.speaker}(${s.role}): ${s.text}`).join("\n");
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `作为一名资深董秘和法律专家，请分析以下会议记录的合规性，并提取关键决议要素。请展现你的“深度思考”过程。
        
        【本地法律规章库 (RAG Context)】:
        ${ragContext}
        
        【当前会议记录】:
        ${fullText}
        
        要求：
        1. 严格参考【本地法律规章库】中的条款进行合规性识别。
        2. 识别潜在的法律风险。
        3. 提取议案核心要素。
        4. 给出合规建议。`,
        config: {
          systemInstruction: "你是一个专业的企业治理AI助手，擅长法律风险穿透和合规文书生成。你必须优先参考用户提供的本地法律规章库内容进行判断。",
        }
      });

      setAnalysisResult(response.text);
      
      // Mock issues based on AI response
      const newIssues: ComplianceIssue[] = [
        { 
          id: `i-${Date.now()}`, 
          meetingId: meetingId || "unknown",
          type: "实质性", 
          title: "资产负债率预警", 
          description: "独立董事提出的65%负债率可能触及内部风控红线。", 
          lawReference: "《公司章程》第82条", 
          severity: "medium", 
          status: "待处理" 
        }
      ];
      setIssues(newIssues);

      // Save to global compliance issues store
      const savedIssues = localStorage.getItem("corporate_compliance_issues");
      const allIssues: ComplianceIssue[] = savedIssues ? JSON.parse(savedIssues) : [];
      localStorage.setItem("corporate_compliance_issues", JSON.stringify([...allIssues, ...newIssues]));

      // Auto-jump to compliance review after a short delay
      if (onAnalysisComplete && meetingId) {
        setTimeout(() => onAnalysisComplete(meetingId), 2000);
      }
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)]">
      {/* Left: ASR Stream */}
      <div className="flex flex-col h-full mck-card overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-serif font-bold flex items-center gap-2">
            <Mic size={20} className={isRecording ? "text-mck-red animate-pulse" : "text-mck-blue"} />
            智能语音解析流
          </h3>
          <button
            onClick={toggleRecording}
            className={cn(
              "px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all",
              isRecording ? "bg-mck-red text-white" : "bg-mck-navy text-white hover:bg-mck-blue"
            )}
          >
            {isRecording ? "停止录音" : "开始录音"}
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-4">
          {segments.map((seg) => (
            <div key={seg.id} className="group">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-mck-bg text-mck-navy/60">
                  {seg.role}
                </span>
                <span className="text-xs font-bold text-mck-navy">{seg.speaker}</span>
                <span className="text-[10px] text-mck-navy/40 font-mono">{seg.timestamp}</span>
              </div>
              <p className="text-sm leading-relaxed text-mck-navy/80 pl-4 border-l-2 border-mck-border group-hover:border-mck-blue transition-colors">
                {seg.text}
              </p>
            </div>
          ))}
          {isRecording && (
            <div className="flex items-center gap-2 text-mck-navy/40 italic text-xs animate-pulse">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-current rounded-full" />
                <div className="w-1 h-1 bg-current rounded-full" />
                <div className="w-1 h-1 bg-current rounded-full" />
              </div>
              正在实时转写...
            </div>
          )}
        </div>
      </div>

      {/* Right: AI Analysis & RAG */}
      <div className="flex flex-col h-full space-y-6">
        <div className="mck-card flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-bold flex items-center gap-2">
              <Brain size={20} className="text-mck-blue" />
              DeepSeek R1 穿透审查
            </h3>
            <button
              onClick={runAIAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-mck-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-mck-navy disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <Brain size={14} />}
              {isAnalyzing ? "深度思考中..." : "启动合规审查"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-4">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="h-4 bg-mck-bg rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-mck-bg rounded w-full animate-pulse" />
                  <div className="h-4 bg-mck-bg rounded w-5/6 animate-pulse" />
                  <div className="p-4 border border-dashed border-mck-blue/30 rounded text-xs text-mck-blue italic">
                    正在检索 2024 新《公司法》知识库...
                  </div>
                </motion.div>
              ) : analysisResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-sm max-w-none text-mck-navy/80"
                >
                  <div className="bg-mck-bg/50 p-4 border-l-4 border-mck-blue mb-6">
                    <p className="text-[10px] font-bold uppercase text-mck-blue mb-2">思考链路 (Thinking Process)</p>
                    <p className="text-xs italic">
                      分析发言人角色 {"->"} 提取关键议案（5000万授信） {"->"} 匹配公司章程权限 {"->"} 校验新公司法第111条程序要求...
                    </p>
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {analysisResult}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-mck-navy/40 text-center p-8">
                  <Brain size={48} className="mb-4 opacity-20" />
                  <p>点击“启动合规审查”以利用 AI 进行法律风险穿透</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Compliance Issues */}
        <div className="mck-card h-48 overflow-y-auto">
          <h4 className="text-xs font-bold uppercase tracking-widest text-mck-navy/60 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-mck-red" />
            风险拦截清单
          </h4>
          <div className="space-y-3">
            {issues.length > 0 ? issues.map(issue => (
              <div key={issue.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100">
                <div className="w-2 h-2 rounded-full bg-mck-red mt-1.5" />
                <div>
                  <p className="text-sm font-bold text-mck-red">{issue.title}</p>
                  <p className="text-xs text-mck-navy/70">{issue.description}</p>
                  <p className="text-[10px] font-mono mt-1 text-mck-navy/40">依据：{issue.lawReference}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-mck-navy/40 italic">暂未发现合规风险</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
