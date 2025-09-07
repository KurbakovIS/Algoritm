import React, { useState } from 'react';
import NodeCard from './components/NodeCard';

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

interface NodeListProps {
  nodes: RoadmapNode[];
  onEdit: (node: RoadmapNode) => void;
  onDelete: (nodeId: number) => void;
  onRefresh: () => void;
}

const NodeList: React.FC<NodeListProps> = ({ nodes, onEdit, onDelete, onRefresh }) => {
  const [filter, setFilter] = useState({
    direction: '',
    node_type: '',
    is_active: true,
    search: ''
  });

  const filteredNodes = nodes.filter(node => {
    const matchesDirection = !filter.direction || node.direction === filter.direction;
    const matchesType = !filter.node_type || node.node_type === filter.node_type;
    const matchesActive = filter.is_active === null || node.is_active === filter.is_active;
    const matchesSearch = !filter.search || 
      node.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      node.direction.toLowerCase().includes(filter.search.toLowerCase());

    return matchesDirection && matchesType && matchesActive && matchesSearch;
  });

  const directions = [...new Set(nodes.map(n => n.direction))];
  const nodeTypes = [...new Set(nodes.map(n => n.node_type))];

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Поиск */}
          <div>
            <label className="block text-sm font-medium mb-2">Поиск</label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
              placeholder="Поиск по названию..."
              className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Направление */}
          <div>
            <label className="block text-sm font-medium mb-2">Направление</label>
            <select 
              value={filter.direction}
              onChange={(e) => setFilter({...filter, direction: e.target.value})}
              className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Все направления</option>
              {directions.map(dir => (
                <option key={dir} value={dir}>
                  {dir.charAt(0).toUpperCase() + dir.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Тип узла */}
          <div>
            <label className="block text-sm font-medium mb-2">Тип узла</label>
            <select 
              value={filter.node_type}
              onChange={(e) => setFilter({...filter, node_type: e.target.value})}
              className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Все типы</option>
              {nodeTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'parent' ? 'Родительский' : 
                   type === 'task' ? 'Задача' : 
                   type === 'optional' ? 'Дополнительный' : type}
                </option>
              ))}
            </select>
          </div>
          
          {/* Активность */}
          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select 
              value={filter.is_active === null ? '' : filter.is_active.toString()}
              onChange={(e) => setFilter({
                ...filter, 
                is_active: e.target.value === '' ? null : e.target.value === 'true'
              })}
              className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Все</option>
              <option value="true">Активные</option>
              <option value="false">Неактивные</option>
            </select>
          </div>
        </div>

        {/* Кнопки сброса */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilter({
              direction: '',
              node_type: '',
              is_active: true,
              search: ''
            })}
            className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      {/* Результаты */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-300">
          Найдено узлов: <span className="font-semibold text-white">{filteredNodes.length}</span>
        </div>
        <button
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Обновить
        </button>
      </div>

      {/* Список узлов */}
      {filteredNodes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Узлы не найдены</h3>
          <p className="text-slate-400">
            Попробуйте изменить фильтры или создать новый узел
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNodes.map(node => (
            <NodeCard 
              key={node.id} 
              node={node} 
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NodeList;
