import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { RecordingWorkspace } from "./components/RecordingWorkspace";
import { DocumentCenter } from "./components/DocumentCenter";
import { MeetingManager } from "./components/MeetingManager";
import { ComplianceReview } from "./components/ComplianceReview";
import { KnowledgeBase } from "./components/KnowledgeBase";
import { SystemSettings } from "./components/SystemSettings";
import { PersonnelMatrix } from "./components/PersonnelMatrix";
import { Search, Bell, User } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("corporate_active_tab") || "dashboard";
  });
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(() => {
    return localStorage.getItem("corporate_active_meeting_id");
  });

  useEffect(() => {
    localStorage.setItem("corporate_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedMeetingId) {
      localStorage.setItem("corporate_active_meeting_id", selectedMeetingId);
    } else {
      localStorage.removeItem("corporate_active_meeting_id");
    }
  }, [selectedMeetingId]);

  const handleStartMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setActiveTab("recording");
  };

  const handleGoToCompliance = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setActiveTab("compliance");
  };

  const handleGoToDocuments = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setActiveTab("documents");
  };

  return (
    <div className="flex min-h-screen bg-mck-bg">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-mck-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 text-mck-navy/40">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="搜索议案、法规或文书..." 
              className="text-sm bg-transparent focus:outline-none w-64 text-mck-navy"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-mck-navy/60 hover:text-mck-blue transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-mck-red rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-mck-border" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-mck-navy leading-none">bmmemail@163.com</p>
                <p className="text-[10px] text-mck-navy/40 uppercase tracking-wider mt-1">法务总监</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-mck-navy flex items-center justify-center text-white">
                <User size={16} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-y-auto">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "meetings" && (
            <MeetingManager onStartMeeting={handleStartMeeting} />
          )}
          {activeTab === "recording" && (
            <RecordingWorkspace 
              meetingId={selectedMeetingId} 
              onAnalysisComplete={handleGoToCompliance} 
            />
          )}
          {activeTab === "compliance" && (
            <ComplianceReview 
              meetingId={selectedMeetingId} 
              onGenerateDocuments={handleGoToDocuments} 
            />
          )}
          {activeTab === "documents" && (
            <DocumentCenter meetingId={selectedMeetingId} />
          )}
          {activeTab === "knowledge" && <KnowledgeBase />}
          {activeTab === "settings" && <SystemSettings />}
          {activeTab === "users" && <PersonnelMatrix />}
          
          {/* Fallback for unknown tabs */}
          {!["dashboard", "meetings", "recording", "compliance", "documents", "knowledge", "settings", "users"].includes(activeTab) && (
            <div className="h-full flex flex-col items-center justify-center text-mck-navy/40">
              <p className="text-lg font-serif italic">模块建设中...</p>
              <p className="text-xs mt-2 uppercase tracking-widest">Module under construction</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
