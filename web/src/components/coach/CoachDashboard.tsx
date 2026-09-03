import React, { useState } from 'react';
import ReviewKanban from './ReviewKanban';
import RoutineArtifactEditor from './RoutineArtifactEditor';
import ArchetypeStudio from './ArchetypeStudio';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';
import { PricingFreedomFakeDoor } from '../pt-dashboard/PricingFreedomFakeDoor';
import { GamificationBuilder } from './GamificationBuilder';

export default function CoachDashboard() {
  const flags = useFeatureFlags();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'ARCHETYPES' | 'GAMIFICATION'>('KANBAN');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-900 bg-zinc-950 p-6 flex flex-col hidden md:flex">
        <div className="text-emerald-500 font-bold tracking-widest text-xl mb-12">
          COACH COCKPIT
        </div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => { setActiveTab('KANBAN'); setSelectedRoutineId(null); }}
            className={`text-left px-4 py-3 rounded-md font-mono text-sm transition-colors ${activeTab === 'KANBAN' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
          >
            REVIEW KANBAN
          </button>
          <button 
            onClick={() => { setActiveTab('ARCHETYPES'); setSelectedRoutineId(null); }}
            className={`text-left px-4 py-3 rounded-md font-mono text-sm transition-colors ${activeTab === 'ARCHETYPES' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
          >
            ARCHETYPE STUDIO
          </button>
          <button 
            onClick={() => { setActiveTab('GAMIFICATION'); setSelectedRoutineId(null); }}
            className={`text-left px-4 py-3 rounded-md font-mono text-sm transition-colors ${activeTab === 'GAMIFICATION' ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-500/30' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
          >
            GAME MASTER
          </button>
          {flags.pricingFreedomB2b && (
            <button 
              onClick={() => setIsPricingModalOpen(true)}
              className="text-left px-4 py-3 rounded-md font-mono text-sm transition-colors text-indigo-400 hover:bg-indigo-900/30 hover:text-indigo-300 border border-indigo-900/50 mt-4"
            >
              💳 MONETIZACIÓN B2B
            </button>
          )}
        </nav>
        
        <div className="mt-auto border-t border-zinc-900 pt-6">
          <div className="text-xs text-zinc-600 font-mono">
            B2B HITL Telemetry Active<br/>Latencia: 0ms (Local-First)
          </div>
        </div>
      </div>

      {isPricingModalOpen && (
        <PricingFreedomFakeDoor 
          ptId="pt_current_user_id" 
          onClose={() => setIsPricingModalOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {selectedRoutineId ? (
          <RoutineArtifactEditor 
            routineId={selectedRoutineId} 
            onBack={() => setSelectedRoutineId(null)} 
          />
        ) : (
          activeTab === 'KANBAN' ? (
            <ReviewKanban onSelectRoutine={setSelectedRoutineId} />
          ) : activeTab === 'ARCHETYPES' ? (
            <ArchetypeStudio />
          ) : (
            <GamificationBuilder />
          )
        )}
      </div>
    </div>
  );
}
