import React, { useState, useEffect, useRef } from "react";
import { Book, Plus, Search, Trash2, Edit3, FileText, CheckCircle, Clock, Save, X, Upload, FileUp, RefreshCw } from "lucide-react";
import { KnowledgeItem } from "../types";
import { cn } from "@/src/lib/utils";
import mammoth from "mammoth";

const initialKnowledge: KnowledgeItem[] = [
  { id: "k1", title: "中华人民共和国公司法 (2024修订)", category: "法律法规", content: "第一百一十一条：董事会会议，应于会议召开十日前通知全体董事和监事。董事会召开临时会议，可以另定召集董事会的通知方式和通知时限。", lastModified: "2024-01-01", status: "已生效" },
  { id: "k2", title: "智理科技股份有限公司章程", category: "公司章程", content: "第八十二条：公司董事会会议应当有过半数的董事出席方可举行。董事会作出决议，必须经全体董事的过半数通过。", lastModified: "2025-12-20", status: "已生效" },
  { id: "k3", title: "关联交易管理制度", category: "规章制度", content: "第十五条：公司与关联人发生的交易金额在3000万元以上，且占公司最近一期经审计净资产绝对值5%以上的关联交易，应当提交股东大会审议。", lastModified: "2026-01-15", status: "已生效" },
];

export const KnowledgeBase: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>(() => {
    const saved = localStorage.getItem("corporate_knowledge_base");
    return saved ? JSON.parse(saved) : initialKnowledge;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<KnowledgeItem>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("corporate_knowledge_base", JSON.stringify(items));
  }, [items]);

  const filteredItems = items.filter(item => 
    item.title.includes(searchQuery) || item.content.includes(searchQuery)
  );

  const handleSave = () => {
    if (!currentItem.title || !currentItem.content) return;
    
    if (currentItem.id) {
      setItems(items.map(i => i.id === currentItem.id ? { ...i, ...currentItem, lastModified: new Date().toISOString().split('T')[0] } as KnowledgeItem : i));
    } else {
      const newItem: KnowledgeItem = {
        id: Date.now().toString(),
        title: currentItem.title,
        category: currentItem.category || "规章制度",
        content: currentItem.content,
        lastModified: new Date().toISOString().split('T')[0],
        status: "已生效",
      };
      setItems([newItem, ...items]);
    }
    setIsEditing(false);
    setCurrentItem({});
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件格式
    const allowedTypes = [".txt", ".docx"];
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    
    if (!allowedTypes.includes(fileExt)) {
      alert("仅支持 .txt 和 .docx 格式的文件。");
      return;
    }

    setIsUploading(true);
    
    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append("file", file);
      
      // 发送到服务器
      const response = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "上传失败");
      }
      
      const result = await response.json();
      
      if (result.success) {
        // 将服务器返回的数据添加到列表
        const newItem: KnowledgeItem = {
          id: result.data.id,
          title: result.data.title,
          category: result.data.category,
          content: result.data.content,
          lastModified: result.data.lastModified,
          status: result.data.status,
          filePath: result.data.filePath,
          fileName: result.data.fileName
        };
        
        setItems([newItem, ...items]);
        
        // 清空文件输入
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        alert("文件上传成功！");
      } else {
        throw new Error(result.message || "上传失败");
      }
    } catch (error) {
      console.error("上传失败:", error);
      alert(`上传失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除该法律文件吗？此操作不可撤销。")) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-mck-navy">法律文件库 (RAG)</h2>
          <p className="text-mck-navy/60 mt-1">管理法律法规与公司规章，实时同步 AI 知识库</p>
        </div>
        <button 
          onClick={() => { setIsEditing(true); setCurrentItem({ category: "规章制度" }); }}
          className="flex items-center gap-2 px-6 py-2 bg-mck-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-mck-navy transition-all"
        >
          <Plus size={16} />
          上传新规章
        </button>
      </header>

      {isEditing && (
        <div className="fixed inset-0 bg-mck-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl mck-card shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-mck-border">
              <h3 className="text-xl font-serif font-bold">编辑法律文件</h3>
              <button onClick={() => setIsEditing(false)} className="text-mck-navy/40 hover:text-mck-navy"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40">文件标题</label>
                  <input 
                    type="text" 
                    value={currentItem.title || ""} 
                    onChange={e => setCurrentItem({...currentItem, title: e.target.value})}
                    className="w-full border border-mck-border px-4 py-2 text-sm focus:outline-none focus:border-mck-blue"
                    placeholder="例如：公司章程修订版"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40">分类</label>
                  <select 
                    value={currentItem.category || "规章制度"} 
                    onChange={e => setCurrentItem({...currentItem, category: e.target.value as any})}
                    className="w-full border border-mck-border px-4 py-2 text-sm focus:outline-none focus:border-mck-blue bg-white"
                  >
                    <option>法律法规</option>
                    <option>公司章程</option>
                    <option>规章制度</option>
                    <option>监管问答</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40">核心条款内容 (用于 RAG 检索)</label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-[10px] font-bold text-mck-blue hover:text-mck-navy transition-colors uppercase tracking-widest"
                  >
                    <FileUp size={12} />
                    导入 Word 文档
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".txt,.docx" 
                    className="hidden" 
                  />
                </div>
                <div className="relative">
                  <textarea 
                    rows={8}
                    value={currentItem.content || ""} 
                    onChange={e => setCurrentItem({...currentItem, content: e.target.value})}
                    className="w-full border border-mck-border px-4 py-2 text-sm focus:outline-none focus:border-mck-blue resize-none"
                    placeholder={isUploading ? "正在解析文档..." : "请输入具体的法律条文或规章内容..."}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-xs font-bold text-mck-blue">
                        <RefreshCw size={14} className="animate-spin" />
                        解析中...
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-mck-navy/60 hover:text-mck-navy">取消</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-8 py-2 bg-mck-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-mck-navy transition-all">
                  <Save size={16} />
                  保存并同步
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="mck-card mck-card-accent-blue">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40 mb-6">知识库健康度</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-serif font-bold text-mck-navy">100%</span>
              <span className="text-xs text-mck-navy/80 font-bold">已同步</span>
            </div>
            <p className="text-xs text-mck-navy/90 leading-relaxed font-medium">
              当前所有规章制度均已向量化，DeepSeek 将在分析会议时自动检索这些内容。
            </p>
          </div>

          <div className="mck-card">
            <h3 className="text-xs font-bold uppercase tracking-widest text-mck-navy/60 mb-4">分类统计</h3>
            <div className="space-y-4">
              {["法律法规", "公司章程", "规章制度", "监管问答"].map(cat => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-xs text-mck-navy/60">{cat}</span>
                  <span className="text-xs font-bold">{items.filter(i => i.category === cat).length}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mck-navy/40" />
              <input 
                type="text" 
                placeholder="搜索法律文件、规章条款..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-mck-border pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-mck-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="mck-card group hover:border-mck-blue transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-mck-bg flex items-center justify-center text-mck-navy/40 group-hover:text-mck-blue transition-colors">
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[9px] font-bold uppercase px-1.5 py-0.5",
                          item.category === "法律法规" ? "bg-blue-100 text-blue-700" : 
                          item.category === "公司章程" ? "bg-purple-100 text-purple-700" : "bg-mck-bg text-mck-navy/60"
                        )}>
                          {item.category}
                        </span>
                        <h4 className="text-base font-serif font-bold text-mck-navy">{item.title}</h4>
                      </div>
                      <p className="text-sm text-mck-navy/60 line-clamp-2 leading-relaxed max-w-2xl">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1 text-[10px] text-mck-navy/40 uppercase tracking-wider">
                          <Clock size={10} />
                          最后更新: {item.lastModified}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                          <CheckCircle size={10} />
                          AI 已同步
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setCurrentItem(item); setIsEditing(true); }}
                      className="p-2 hover:bg-mck-bg text-mck-navy/40 hover:text-mck-blue"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-mck-bg text-mck-navy/40 hover:text-mck-red"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
