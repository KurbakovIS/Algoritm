import React from 'react';

interface RoadmapNode {
  id: number;
  title: string;
  direction: string;
  node_type: string;
  is_required: boolean;
  is_active: boolean;
  children: RoadmapNode[];
  blocked_by: any[];
  blocks: any[];
}

interface NodeCardProps {
  node: RoadmapNode;
  onEdit: (node: RoadmapNode) => void;
  onDelete: (nodeId: number) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, onEdit, onDelete }) => {
  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'parent': return 'bg-blue-600';
      case 'task': return 'bg-green-600';
      case 'optional': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'parent': return 'Родительский';
      case 'task': return 'Задача';
      case 'optional': return 'Дополнительный';
      default: return type;
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'frontend': return 'bg-blue-500';
      case 'backend': return 'bg-green-500';
      case 'devops': return 'bg-purple-500';
      case 'career': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Заголовок */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
              {node.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getDirectionColor(node.direction)}`}>
                {node.direction.charAt(0).toUpperCase() + node.direction.slice(1)}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getNodeTypeColor(node.node_type)}`}>
                {getNodeTypeLabel(node.node_type)}
              </span>
            </div>
          </div>
          
          {/* Статус активности */}
          <div className={`w-3 h-3 rounded-full ${node.is_active ? 'bg-green-500' : 'bg-red-500'}`} 
               title={node.is_active ? 'Активный' : 'Неактивный'} />
        </div>

        {/* Дополнительная информация */}
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <span>Обязательный:</span>
            <span className={node.is_required ? 'text-green-400' : 'text-yellow-400'}>
              {node.is_required ? 'Да' : 'Нет'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Дочерних узлов:</span>
            <span className="text-blue-400">{node.children.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Блокировок:</span>
            <span className="text-red-400">{node.blocked_by.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Блокирует:</span>
            <span className="text-orange-400">{node.blocks.length}</span>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="p-4 flex space-x-2">
        <button
          onClick={() => onEdit(node)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Редактировать
        </button>
        
        <button
          onClick={() => onDelete(node.id)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Индикаторы */}
      {node.blocked_by.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-red-900/30 border border-red-500/50 rounded p-2">
            <div className="flex items-center text-red-400 text-xs">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Заблокирован {node.blocked_by.length} узлом(ами)
            </div>
          </div>
        </div>
      )}

      {node.children.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-blue-900/30 border border-blue-500/50 rounded p-2">
            <div className="flex items-center text-blue-400 text-xs">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Имеет {node.children.length} дочерних узлов
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeCard;
