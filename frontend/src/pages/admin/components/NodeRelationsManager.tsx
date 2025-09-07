import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api';

interface RoadmapNode {
  id: number;
  title: string;
  direction: string;
  node_type: string;
  is_active: boolean;
}

interface NodeRelationsManagerProps {
  currentNode: RoadmapNode;
  parentIds: number[];
  blockingNodeIds: number[];
  onParentIdsChange: (ids: number[]) => void;
  onBlockingNodeIdsChange: (ids: number[]) => void;
}

const NodeRelationsManager: React.FC<NodeRelationsManagerProps> = ({
  currentNode,
  parentIds,
  blockingNodeIds,
  onParentIdsChange,
  onBlockingNodeIdsChange
}) => {
  const [availableNodes, setAvailableNodes] = useState<RoadmapNode[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedNode, setDraggedNode] = useState<RoadmapNode | null>(null);
  
  // Состояние для фильтров
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadAvailableNodes();
    loadSelectedNodes();
    // Загружаем сохраненные фильтры
    const savedFilters = localStorage.getItem('nodeRelationsFilters');
    if (savedFilters) {
      try {
        const { search, direction, type } = JSON.parse(savedFilters);
        setSearchTerm(search || '');
        setDirectionFilter(direction || '');
        setTypeFilter(type || '');
      } catch (error) {
        console.error('Ошибка загрузки фильтров:', error);
      }
    }
  }, []);

  // Загружаем выбранные узлы при изменении parentIds или blockingNodeIds
  useEffect(() => {
    loadSelectedNodes();
  }, [parentIds, blockingNodeIds]);

  // Сохраняем фильтры в localStorage при изменении
  useEffect(() => {
    const filters = {
      search: searchTerm,
      direction: directionFilter,
      type: typeFilter
    };
    localStorage.setItem('nodeRelationsFilters', JSON.stringify(filters));
  }, [searchTerm, directionFilter, typeFilter]);

  const loadAvailableNodes = async () => {
    try {
      setLoading(true);
      const nodes = await apiClient.getAdminNodes();
      // Исключаем текущий узел и уже выбранные узлы
      const filtered = nodes.filter(node => 
        node.id !== currentNode.id && 
        node.is_active
      );
      setAvailableNodes(filtered);
    } catch (error) {
      console.error('Ошибка загрузки узлов:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedNodes = async () => {
    try {
      const allSelectedIds = [...parentIds, ...blockingNodeIds];
      if (allSelectedIds.length === 0) {
        setSelectedNodes([]);
        return;
      }
      
      const nodes = await apiClient.getNodesByIds(allSelectedIds);
      setSelectedNodes(nodes);
    } catch (error) {
      console.error('Ошибка загрузки выбранных узлов:', error);
      setSelectedNodes([]);
    }
  };

  // Функция для фильтрации узлов
  const getFilteredAvailableNodes = (excludeIds: number[]) => {
    return availableNodes.filter(node => {
      // Исключаем уже выбранные узлы
      if (excludeIds.includes(node.id)) return false;
      
      // Фильтр по поисковому запросу
      if (searchTerm && !node.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Фильтр по направлению
      if (directionFilter && node.direction !== directionFilter) {
        return false;
      }
      
      // Фильтр по типу
      if (typeFilter && node.node_type !== typeFilter) {
        return false;
      }
      
      return true;
    });
  };

  // Функция для сброса фильтров
  const resetFilters = () => {
    setSearchTerm('');
    setDirectionFilter('');
    setTypeFilter('');
  };

  // Получаем уникальные направления и типы для фильтров
  const uniqueDirections = [...new Set(availableNodes.map(node => node.direction))];
  const uniqueTypes = [...new Set(availableNodes.map(node => node.node_type))];

  const handleDragStart = (e: React.DragEvent, node: RoadmapNode) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetType: 'parents' | 'blockers') => {
    e.preventDefault();
    
    if (!draggedNode) return;

    if (targetType === 'parents') {
      if (!parentIds.includes(draggedNode.id)) {
        onParentIdsChange([...parentIds, draggedNode.id]);
      }
    } else if (targetType === 'blockers') {
      if (!blockingNodeIds.includes(draggedNode.id)) {
        onBlockingNodeIdsChange([...blockingNodeIds, draggedNode.id]);
      }
    }
    
    setDraggedNode(null);
  };

  const removeParent = (nodeId: number) => {
    onParentIdsChange(parentIds.filter(id => id !== nodeId));
  };

  const removeBlocker = (nodeId: number) => {
    onBlockingNodeIdsChange(blockingNodeIds.filter(id => id !== nodeId));
  };

  const getSelectedNodes = (ids: number[]) => {
    return selectedNodes.filter(node => ids.includes(node.id));
  };

  const getAvailableNodes = (excludeIds: number[]) => {
    return getFilteredAvailableNodes(excludeIds);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Управление связями узла</h3>
        <p className="text-slate-400 text-sm">
          Перетащите узлы из левой колонки в правые для создания связей
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Доступные узлы */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-blue-400 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Доступные узлы
            </h4>
            <span className="text-xs text-slate-400">
              {getAvailableNodes([...parentIds, ...blockingNodeIds]).length} из {availableNodes.length}
            </span>
          </div>
          
          {/* Фильтры */}
          <div className="space-y-3">
            {/* Поиск */}
            <div>
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {/* Фильтры по направлению и типу */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Все направления</option>
                {uniqueDirections.map(direction => (
                  <option key={direction} value={direction}>
                    {direction}
                  </option>
                ))}
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Все типы</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Кнопка сброса фильтров */}
            {(searchTerm || directionFilter || typeFilter) && (
              <button
                onClick={resetFilters}
                className="w-full px-3 py-2 bg-slate-600 hover:bg-slate-500 border border-slate-500 rounded-lg text-white text-sm transition-colors"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 min-h-[400px]">
            {getAvailableNodes([...parentIds, ...blockingNodeIds]).map(node => (
              <div
                key={node.id}
                draggable
                onDragStart={(e) => handleDragStart(e, node)}
                className="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg mb-2 cursor-move transition-colors border border-slate-600 hover:border-slate-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white text-sm">{node.title}</div>
                    <div className="text-xs text-slate-400">
                      {node.direction} • {node.node_type}
                    </div>
                  </div>
                  <div className="text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
            {getAvailableNodes([...parentIds, ...blockingNodeIds]).length === 0 && (
              <div className="text-center text-slate-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-sm">Все узлы уже выбраны</p>
              </div>
            )}
          </div>
        </div>

        {/* Родительские узлы */}
        <div className="space-y-4">
          <h4 className="font-semibold text-green-400 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
            Родительские узлы
          </h4>
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'parents')}
            className="bg-slate-800 rounded-lg border-2 border-dashed border-green-500/50 p-4 min-h-[400px] transition-colors hover:border-green-500/70"
          >
            {getSelectedNodes(parentIds).map(node => (
              <div
                key={node.id}
                className="bg-green-900/30 border border-green-500/50 p-3 rounded-lg mb-2 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-green-300 text-sm">{node.title}</div>
                  <div className="text-xs text-green-400">
                    {node.direction} • {node.node_type}
                  </div>
                </div>
                <button
                  onClick={() => removeParent(node.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {parentIds.length === 0 && (
              <div className="text-center text-green-400/50 py-8">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <p className="text-sm">Перетащите узлы сюда</p>
                <p className="text-xs mt-1">Они станут родительскими</p>
              </div>
            )}
          </div>
        </div>

        {/* Блокирующие узлы */}
        <div className="space-y-4">
          <h4 className="font-semibold text-red-400 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Блокирующие узлы
          </h4>
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'blockers')}
            className="bg-slate-800 rounded-lg border-2 border-dashed border-red-500/50 p-4 min-h-[400px] transition-colors hover:border-red-500/70"
          >
            {getSelectedNodes(blockingNodeIds).map(node => (
              <div
                key={node.id}
                className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg mb-2 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-red-300 text-sm">{node.title}</div>
                  <div className="text-xs text-red-400">
                    {node.direction} • {node.node_type}
                  </div>
                </div>
                <button
                  onClick={() => removeBlocker(node.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {blockingNodeIds.length === 0 && (
              <div className="text-center text-red-400/50 py-8">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm">Перетащите узлы сюда</p>
                <p className="text-xs mt-1">Они будут блокировать этот узел</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Инструкции */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h5 className="font-semibold text-slate-300 mb-2">Как использовать:</h5>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• <span className="text-green-400">Родительские узлы:</span> Узлы, которые должны быть завершены перед этим узлом</li>
          <li>• <span className="text-red-400">Блокирующие узлы:</span> Узлы, которые блокируют доступ к этому узлу</li>
          <li>• Перетащите узел из левой колонки в нужную правую колонку</li>
          <li>• Нажмите ✕ чтобы удалить связь</li>
        </ul>
      </div>
    </div>
  );
};

export default NodeRelationsManager;
