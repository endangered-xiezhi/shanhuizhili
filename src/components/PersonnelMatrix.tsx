import React, { useState, useEffect } from "react";
import { Users, UserPlus, Search, Trash2, Edit3, ShieldCheck, ShieldAlert, Calendar, Save, X, Filter, AlertTriangle, Clock } from "lucide-react";
import { Personnel } from "../types";
import { cn } from "@/src/lib/utils";

// 任期预警工具函数
const getTermStatus = (termEnd: string): { status: 'normal' | 'warning' | 'expired'; daysRemaining: number; label: string } => {
  if (!termEnd) return { status: 'normal', daysRemaining: Infinity, label: '无固定期限' };
  
  const endDate = new Date(termEnd);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining, label: `已过期 ${Math.abs(daysRemaining)} 天` };
  } else if (daysRemaining <= 90) {
    return { status: 'warning', daysRemaining, label: `剩余 ${daysRemaining} 天` };
  } else {
    return { status: 'normal', daysRemaining, label: `剩余 ${daysRemaining} 天` };
  }
};

const initialPersonnel: Personnel[] = [
  { id: "p1", name: "张明德", role: "董事长", organization: "董事会", termStart: "2024-01-01", termEnd: "2027-01-01", isIndependent: false, conflictOfInterest: ["关联公司A"], status: "在职" },
  { id: "p2", name: "李华", role: "独立董事", organization: "董事会", termStart: "2024-01-01", termEnd: "2027-01-01", isIndependent: true, conflictOfInterest: [], status: "在职" },
  { id: "p3", name: "王建国", role: "监事", organization: "监事会", termStart: "2024-01-01", termEnd: "2027-01-01", isIndependent: false, conflictOfInterest: [], status: "在职" },
  { id: "p4", name: "赵敏", role: "董秘", organization: "管理层", termStart: "2024-01-01", termEnd: "2027-01-01", isIndependent: false, conflictOfInterest: [], status: "在职" },
];

export const PersonnelMatrix: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>(() => {
    const saved = localStorage.getItem("corporate_personnel_matrix");
    return saved ? JSON.parse(saved) : initialPersonnel;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrg, setFilterOrg] = useState<string>("全部");
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPerson, setCurrentPerson] = useState<Partial<Personnel>>({});

  useEffect(() => {
    localStorage.setItem("corporate_personnel_matrix", JSON.stringify(personnel));
  }, [personnel]);

  const filteredPersonnel = personnel.filter(p => 
    (p.name.includes(searchQuery) || p.role.includes(searchQuery)) &&
    (filterOrg === "全部" || p.organization === filterOrg)
  );

  const handleSave = () => {
    if (!currentPerson.name || !currentPerson.role) return;
    
    if (currentPerson.id) {
      setPersonnel(personnel.map(p => p.id === currentPerson.id ? { ...p, ...currentPerson } as Personnel : p));
    } else {
      const newPerson: Personnel = {
        id: Date.now().toString(),
        name: currentPerson.name,
        role: currentPerson.role as any,
        organization: currentPerson.organization as any || "董事会",
        termStart: currentPerson.termStart || new Date().toISOString().split('T')[0],
        termEnd: currentPerson.termEnd || "",
        isIndependent: !!currentPerson.isIndependent,
        conflictOfInterest: currentPerson.conflictOfInterest || [],
        status: "在职",
      };
      setPersonnel([newPerson, ...personnel]);
    }
    setIsEditing(false);
    setCurrentPerson({});
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setPersonnel(personnel.filter(p => p.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-mck-navy">人员矩阵 (Personnel Matrix)</h2>
          <p className="text-mck-navy/60 mt-1">管理“三会”成员任期、独立性及关联关系声明</p>
        </div>
        <button 
          onClick={() => { setIsEditing(true); setCurrentPerson({ organization: "董事会", isIndependent: false, conflictOfInterest: [], role: "董事" }); }}
          className="flex items-center gap-2 px-6 py-2 bg-mck-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-mck-navy transition-all"
        >
          <UserPlus size={16} />
          新增成员
        </button>
      </header>

      {isEditing && (
        <div className="fixed inset-0 bg-mck-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl mck-card shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-mck-border">
              <h3 className="text-xl font-serif font-bold">编辑成员信息</h3>
              <button onClick={() => setIsEditing(false)} className="text-mck-navy/40 hover:text-mck-navy"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40">姓名</label>
                  <input 
                    type="text" 
                    value={currentPerson.name || ""} 
                    onChange={e => setCurrentPerson({...currentPerson, name: e.target.value})}
                    className="w-full border border-mck-border px-4 py-2 text-sm focus:outline-none focus:border-mck-blue"
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40">所属机构</label>
                  <select 
                    value={currentPerson.organization || "董事会"} 
                    onChange={e => setCurrentPerson({...currentPerson, organization: e.target.value as any})}
                    className="w-full border border-mck-border px-4 py-2 text-sm focus:outline-none focus:border-mck-blue bg-white"
                  >
                    <option>董事会</option>
                    <option>监事会</option>
                    <option>管理层</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40">职位</label>
                  <select 
                    value={currentPerson.role || "董事"} 
                    onChange={e => setCurrentPerson({...currentPerson, role: e.target.value as any})}
                    className="w-full border border-mck-border px-4 py-2 text-sm focus:outline-none focus:border-mck-blue bg-white"
                  >
                    <option>董事长</option>
                    <option>董事</option>
                    <option>独立董事</option>
                    <option>监事</option>
                    <option>董秘</option>
                    <option>高管</option>
                  </select>
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={currentPerson.isIndependent || false}
                      onChange={e => setCurrentPerson({...currentPerson, isIndependent: e.target.checked})}
                      className="w-4 h-4 accent-mck-blue"
                    />
                    <span className="text-xs font-bold text-mck-navy">独立性声明 (Independent)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40">任期开始</label>
                  <input 
                    type="date" 
                    value={currentPerson.termStart || ""} 
                    onChange={e => setCurrentPerson({...currentPerson, termStart: e.target.value})}
                    className="w-full border border-mck-border px-4 py-2 text-sm focus:outline-none focus:border-mck-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40">任期结束</label>
                  <input 
                    type="date" 
                    value={currentPerson.termEnd || ""} 
                    onChange={e => setCurrentPerson({...currentPerson, termEnd: e.target.value})}
                    className="w-full border border-mck-border px-4 py-2 text-sm focus:outline-none focus:border-mck-blue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mck-navy/40">关联公司 (多个请用逗号分隔)</label>
                <input 
                  type="text" 
                  value={(currentPerson.conflictOfInterest || []).join(", ")} 
                  onChange={e => {
                    const value = e.target.value;
                    const companies = value.split(/[,，]/).map(s => s.trim()).filter(s => s.length > 0);
                    setCurrentPerson({...currentPerson, conflictOfInterest: companies});
                  }}
                  className="w-full border border-mck-border px-4 py-2 text-sm focus:outline-none focus:border-mck-blue"
                  placeholder="例如：关联公司A, 关联公司B"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-mck-navy/60 hover:text-mck-navy">取消</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-8 py-2 bg-mck-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-mck-navy transition-all">
                  <Save size={16} />
                  保存记录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-mck-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md mck-card shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 flex items-center justify-center text-mck-red">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-mck-navy">确认删除</h3>
                <p className="text-[10px] text-mck-navy/40 uppercase tracking-widest">此操作不可撤销</p>
              </div>
            </div>
            
            <p className="text-sm text-mck-navy/60 mb-8">
              您确定要移除该人员记录吗？该操作将从系统中永久删除该成员的所有任期和关联关系数据。
            </p>

            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-mck-navy/60 hover:text-mck-navy"
              >
                取消
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-8 py-2 bg-mck-red text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
              >
                确认移除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mck-navy/40" />
          <input 
            type="text" 
            placeholder="搜索姓名、职位..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-mck-border pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-mck-blue"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-mck-border px-4 py-3">
          <Filter size={16} className="text-mck-navy/40" />
          <select 
            value={filterOrg} 
            onChange={e => setFilterOrg(e.target.value)}
            className="text-sm bg-transparent focus:outline-none font-bold text-mck-navy"
          >
            <option>全部</option>
            <option>董事会</option>
            <option>监事会</option>
            <option>管理层</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPersonnel.map(p => (
          <div key={p.id} className="mck-card group hover:border-mck-blue transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-mck-bg flex items-center justify-center text-mck-navy/40 group-hover:text-mck-blue transition-colors">
                <Users size={24} />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { setCurrentPerson(p); setIsEditing(true); }}
                  className="p-1 hover:bg-mck-bg text-mck-navy/40 hover:text-mck-blue"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="p-1 hover:bg-mck-bg text-mck-navy/40 hover:text-mck-red"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-serif font-bold text-mck-navy">{p.name}</h4>
                {p.isIndependent && (
                  <span className="flex items-center gap-1 text-[9px] font-bold uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5">
                    <ShieldCheck size={10} />
                    独立
                  </span>
                )}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-mck-navy/40">{p.role} · {p.organization}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-mck-border">
              {(() => {
                const termStatus = getTermStatus(p.termEnd);
                return (
                  <>
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                      <span className="text-mck-navy/40">任期状态</span>
                      <span className={cn(
                        "font-bold",
                        termStatus.status === 'expired' && "text-red-600",
                        termStatus.status === 'warning' && "text-amber-600",
                        termStatus.status === 'normal' && "text-green-600"
                      )}>
                        {termStatus.status === 'expired' ? '已过期' : termStatus.status === 'warning' ? '即将到期' : '正常'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-mck-navy/60">
                      <Calendar size={12} />
                      <span>{p.termStart} 至 {p.termEnd || "至今"}</span>
                    </div>
                    {termStatus.status !== 'normal' && (
                      <div className={cn(
                        "flex items-center gap-2 text-[10px] font-bold",
                        termStatus.status === 'expired' ? "text-red-600" : "text-amber-600"
                      )}>
                        <AlertTriangle size={12} />
                        <span>{termStatus.label}</span>
                      </div>
                    )}
                  </>
                );
              })()}
              {p.conflictOfInterest.length > 0 ? (
                <div className="flex items-center gap-2 text-[10px] text-mck-red font-bold">
                  <ShieldAlert size={12} />
                  <span>关联关系: {p.conflictOfInterest.join(", ")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold">
                  <ShieldCheck size={12} />
                  <span>无关联冲突</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="mck-card mck-card-accent-blue bg-white">
          <h3 className="text-xs font-bold uppercase tracking-widest text-mck-navy/40 mb-4">董事会结构</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-mck-navy/60">总人数</span>
              <span className="text-lg font-serif font-bold">{personnel.filter(p => p.organization === "董事会").length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-mck-navy/60">独立董事占比</span>
              <span className="text-lg font-serif font-bold text-mck-blue">
                {Math.round((personnel.filter(p => p.organization === "董事会" && p.isIndependent).length / personnel.filter(p => p.organization === "董事会").length) * 100)}%
              </span>
            </div>
            <p className="text-[10px] text-mck-navy/40 leading-relaxed italic">
              * 根据《公司法》，独立董事占比需符合监管要求。
            </p>
          </div>
        </div>
        
        <div className="mck-card mck-card-accent-red bg-white">
          <h3 className="text-xs font-bold uppercase tracking-widest text-mck-navy/40 mb-4">任期预警</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {(() => {
              const warningPersonnel = personnel
                .map(p => ({ ...p, termStatus: getTermStatus(p.termEnd) }))
                .filter(p => p.termStatus.status !== 'normal')
                .sort((a, b) => a.termStatus.daysRemaining - b.termStatus.daysRemaining);
              
              if (warningPersonnel.length === 0) {
                return (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border-l-4 border-green-500">
                    <ShieldCheck size={18} className="text-green-600" />
                    <div>
                      <p className="text-xs font-bold text-green-800">暂无任期到期预警</p>
                      <p className="text-[10px] text-green-600">所有成员任期均在有效期内。</p>
                    </div>
                  </div>
                );
              }
              
              return warningPersonnel.map(p => (
                <div 
                  key={p.id} 
                  className={cn(
                    "flex items-center gap-3 p-3 border-l-4",
                    p.termStatus.status === 'expired' 
                      ? "bg-red-50 border-red-500" 
                      : "bg-amber-50 border-amber-500"
                  )}
                >
                  {p.termStatus.status === 'expired' ? (
                    <AlertTriangle size={18} className="text-red-600" />
                  ) : (
                    <Clock size={18} className="text-amber-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-xs font-bold truncate",
                        p.termStatus.status === 'expired' ? "text-red-800" : "text-amber-800"
                      )}>
                        {p.name}
                      </p>
                      <span className="text-[9px] text-mck-navy/40">{p.role}</span>
                    </div>
                    <p className={cn(
                      "text-[10px]",
                      p.termStatus.status === 'expired' ? "text-red-600" : "text-amber-600"
                    )}>
                      {p.termStatus.label}
                    </p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
