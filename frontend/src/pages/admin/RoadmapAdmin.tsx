import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api';
import NodeList from './NodeList';
import NodeForm from './NodeForm';

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

const RoadmapAdmin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNode, setEditingNode] = useState<RoadmapNode | null>(null);
  const [action, setAction] = useState<string | null>(null);

  useEffect(() => {
    const actionParam = searchParams.get('action');
    setAction(actionParam);
    
    if (actionParam === 'create') {
      setShowForm(true);
    }
    
    loadNodes();
  }, [searchParams]);

  const loadNodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAdminNodes();
      setNodes(data);
    } catch (err) {
      setError('Ошибка загрузки узлов');
      console.error('Ошибка загрузки узлов:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNode = () => {
    setEditingNode(null);
    setShowForm(true);
  };

  const handleEditNode = (node: RoadmapNode) => {
    setEditingNode(node);
    setShowForm(true);
  };

  const handleDeleteNode = async (nodeId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот узел?')) {
      return;
    }

    try {
      await apiClient.deleteNode(nodeId);
      await loadNodes();
    } catch (err) {
      setError('Ошибка удаления узла');
      console.error('Ошибка удаления узла:', err);
    }
  };

  const handleSaveNode = async (nodeData: any) => {
    try {
      if (editingNode) {
        await apiClient.updateNode(editingNode.id, nodeData);
      } else {
        await apiClient.createNode(nodeData);
      }
      
      setShowForm(false);
      setEditingNode(null);
      await loadNodes();
    } catch (err) {
      setError('Ошибка сохранения узла');
      console.error('Ошибка сохранения узла:', err);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNode(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-300">Загрузка узлов...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Ошибка</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={loadNodes}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Управление роадмапом</h1>
              <p className="text-slate-300">
                Создание и редактирование узлов роадмапа
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/admin"
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors"
              >
                ← Назад к админке
              </Link>
              <button
                onClick={handleCreateNode}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                ➕ Создать узел
              </button>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold">{nodes.length}</div>
                <div className="text-slate-400 text-sm">Всего узлов</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {nodes.filter(n => n.is_active).length}
                </div>
                <div className="text-slate-400 text-sm">Активных</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {nodes.filter(n => n.node_type === 'parent').length}
                </div>
                <div className="text-slate-400 text-sm">Родительских</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {nodes.filter(n => n.blocked_by.length > 0).length}
                </div>
                <div className="text-slate-400 text-sm">С блокировками</div>
              </div>
            </div>
          </div>
        </div>

        {/* Контент */}
        {showForm ? (
          <NodeForm
            node={editingNode}
            onSave={handleSaveNode}
            onCancel={handleCancelForm}
          />
        ) : (
          <NodeList
            nodes={nodes}
            onEdit={handleEditNode}
            onDelete={handleDeleteNode}
            onRefresh={loadNodes}
          />
        )}
      </div>
    </div>
  );
};

export default RoadmapAdmin;
