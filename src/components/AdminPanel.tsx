import React, { useState } from 'react';
import { ArrowLeft, Building2, Users, BarChart3, Upload, UserCheck } from 'lucide-react';
import UnidadesTab from './UnidadesTab';
import AtendentesTab from './AtendentesTab';
import MetricasTab from './MetricasTab';
import BulkImportTab from './BulkImportTab';
import UserApprovalTab from './UserApprovalTab';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'unidades' | 'atendentes' | 'metricas' | 'importacao' | 'aprovacao'>('unidades');

  const tabs = [
    {
      id: 'unidades' as const,
      label: 'Unidades',
      icon: <Building2 className="w-4 h-4" />,
      component: <UnidadesTab />
    },
    {
      id: 'atendentes' as const,
      label: 'Atendentes',
      icon: <Users className="w-4 h-4" />,
      component: <AtendentesTab />
    },
    {
      id: 'metricas' as const,
      label: 'Métricas',
      icon: <BarChart3 className="w-4 h-4" />,
      component: <MetricasTab />
    },
    {
      id: 'importacao' as const,
      label: 'Importação',
      icon: <Upload className="w-4 h-4" />,
      component: <BulkImportTab />
    },
    {
      id: 'aprovacao' as const,
      label: 'Aprovação de Usuários',
      icon: <UserCheck className="w-4 h-4" />,
      component: <UserApprovalTab />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-sm text-gray-600">Gerencie unidades, atendentes e métricas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;