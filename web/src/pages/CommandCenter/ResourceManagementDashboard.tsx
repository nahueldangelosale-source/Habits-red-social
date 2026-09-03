import React from 'react';
import { ResourceConfigurator } from './ResourceConfigurator';
import { ClassSessionBuilder } from './ClassSessionBuilder';
import { ScheduleGrid } from './ScheduleGrid';
import { Settings2 } from 'lucide-react';
import { TrainerCockpitFeed } from './TrainerCockpitFeed';
import { ConflictInterceptorModal } from '../../components/modals/ConflictInterceptorModal';

export const ResourceManagementDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <ConflictInterceptorModal />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-indigo-600" />
              Command Center: Operaciones B2B
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gestiona recursos, horarios y monitorea las reservas en tiempo real.
            </p>
          </div>
        </div>

        {/* Top row: Cockpit and Builder */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-8">
            <TrainerCockpitFeed />
            <ResourceConfigurator />
          </div>
          <ClassSessionBuilder />
        </div>

        {/* Bottom row: Schedule Grid */}
        <ScheduleGrid />
      </div>
    </div>
  );
};

export default ResourceManagementDashboard;
