import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api';
import NodeRelationsManager from './components/NodeRelationsManager';

interface RoadmapNode {
  id: number;
  title: string;
  description: string;
  direction: string;
  node_type: string;
  is_required: boolean;
  is_active: boolean;
  checkpoint: boolean;
  resources: string[];
  parent_ids: number[];
  blocking_node_ids: number[];
}

interface NodeFormProps {
  node?: RoadmapNode | null;
  onSave: (node: RoadmapNode) => void;
  onCancel: () => void;
}

const NodeForm: React.FC<NodeFormProps> = ({ node, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    direction: '',
    node_type: 'task',
    is_required: true,
    is_active: true,
    checkpoint: false,
    resources: [] as string[],
    parent_ids: [] as number[],
    blocking_node_ids: [] as number[]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (node) {
      setFormData({
        title: node.title,
        description: node.description || '',
        direction: node.direction,
        node_type: node.node_type,
        is_required: node.is_required,
        is_active: node.is_active,
        checkpoint: node.checkpoint,
        resources: node.resources || [],
        parent_ids: node.parent_ids || [],
        blocking_node_ids: node.blocking_node_ids || []
      });
    }
  }, [node]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const savedNode = node 
        ? await apiClient.updateNode(node.id, formData)
        : await apiClient.createNode(formData);
      
      onSave(savedNode);
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения узла');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceChange = (value: string) => {
    const resources = value.split('\n').filter(r => r.trim());
    setFormData({...formData, resources});
  };

  const directions = ['frontend', 'backend', 'devops', 'career'];
  const nodeTypes = [
    { value: 'parent', label: 'Родительский' },
    { value: 'task', label: 'Задача' },
    { value: 'optional', label: 'Дополнительный' }
  ];

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold mb-6">
        {node ? 'Редактирование узла' : 'Создание узла'}
      </h2>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основные поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Название <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="Введите название узла"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Направление <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.direction}
              onChange={(e) => setFormData({...formData, direction: e.target.value})}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Выберите направление</option>
              {directions.map(dir => (
                <option key={dir} value={dir}>
                  {dir.charAt(0).toUpperCase() + dir.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 focus:outline-none h-24"
            placeholder="Описание узла (необязательно)"
          />
        </div>

        {/* Тип узла и настройки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Тип узла</label>
            <select
              value={formData.node_type}
              onChange={(e) => setFormData({...formData, node_type: e.target.value})}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              {nodeTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Настройки</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_required}
                  onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Обязательный</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Активный</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.checkpoint}
                  onChange={(e) => setFormData({...formData, checkpoint: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Чекпоинт</span>
              </label>
            </div>
          </div>
        </div>

        {/* Управление связями узлов */}
        <div>
          <label className="block text-sm font-medium mb-4">Управление связями узлов</label>
          <NodeRelationsManager
            currentNode={node || { id: 0, title: formData.title, direction: formData.direction, node_type: formData.node_type, is_active: formData.is_active }}
            parentIds={formData.parent_ids}
            blockingNodeIds={formData.blocking_node_ids}
            onParentIdsChange={(ids) => setFormData({...formData, parent_ids: ids})}
            onBlockingNodeIdsChange={(ids) => setFormData({...formData, blocking_node_ids: ids})}
          />
        </div>

        {/* Ресурсы */}
        <div>
          <label className="block text-sm font-medium mb-2">Ресурсы</label>
          <textarea
            value={formData.resources.join('\n')}
            onChange={(e) => handleResourceChange(e.target.value)}
            className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 focus:outline-none h-24"
            placeholder="https://example.com&#10;https://docs.example.com&#10;Каждый ресурс на новой строке"
          />
          <p className="text-xs text-slate-400 mt-1">
            Ссылки на материалы для изучения (по одной на строку)
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Сохранение...' : (node ? 'Обновить' : 'Создать')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NodeForm;
