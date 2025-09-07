"""
Тесты для проверки исправления RecursionError в схемах.
"""
import pytest
from unittest.mock import Mock
from app.schemas import RoadmapNodeOut


class TestRecursionFix:
    """Тесты для проверки защиты от циклических ссылок."""
    
    def test_model_validate_without_cycles(self):
        """Тест сериализации узла без циклических ссылок."""
        # Создаем мок объект узла
        mock_node = Mock()
        mock_node.id = 1
        mock_node.title = "Test Node"
        mock_node.description = "Test Description"
        mock_node.direction = "backend"
        mock_node.resources = '["resource1", "resource2"]'
        mock_node.checkpoint = True
        mock_node.node_type = "task"
        mock_node.is_required = True
        mock_node.order_index = 0
        mock_node.is_active = True
        mock_node.children = []
        mock_node.blocked_by = []
        mock_node.blocks = []
        
        # Тестируем сериализацию
        result = RoadmapNodeOut.model_validate(mock_node)
        
        assert result.id == 1
        assert result.title == "Test Node"
        assert result.description == "Test Description"
        assert result.direction == "backend"
        assert result.resources == ["resource1", "resource2"]
        assert result.checkpoint is True
        assert result.children == []
    
    def test_model_validate_with_cycles(self):
        """Тест сериализации узла с циклическими ссылками."""
        # Создаем мок объекты для циклической связи
        mock_node1 = Mock()
        mock_node1.id = 1
        mock_node1.title = "Node 1"
        mock_node1.description = "Description 1"
        mock_node1.direction = "backend"
        mock_node1.resources = "[]"
        mock_node1.checkpoint = False
        mock_node1.node_type = "task"
        mock_node1.is_required = True
        mock_node1.order_index = 0
        mock_node1.is_active = True
        mock_node1.blocked_by = []
        mock_node1.blocks = []
        
        mock_node2 = Mock()
        mock_node2.id = 2
        mock_node2.title = "Node 2"
        mock_node2.description = "Description 2"
        mock_node2.direction = "backend"
        mock_node2.resources = "[]"
        mock_node2.checkpoint = False
        mock_node2.node_type = "task"
        mock_node2.is_required = True
        mock_node2.order_index = 0
        mock_node2.is_active = True
        mock_node2.blocked_by = []
        mock_node2.blocks = []
        
        # Создаем циклическую связь
        mock_node1.children = [mock_node2]
        mock_node2.children = [mock_node1]
        
        # Тестируем сериализацию - не должно быть RecursionError
        result1 = RoadmapNodeOut.model_validate(mock_node1)
        
        assert result1.id == 1
        assert result1.title == "Node 1"
        assert len(result1.children) == 1
        assert result1.children[0].id == 2
        # Дочерний узел должен быть обрезан из-за циклической ссылки
        assert result1.children[0].children == []
    
    def test_model_validate_max_depth(self):
        """Тест ограничения глубины рекурсии."""
        # Создаем цепочку узлов
        nodes = []
        for i in range(15):  # Больше чем max_depth=10
            mock_node = Mock()
            mock_node.id = i
            mock_node.title = f"Node {i}"
            mock_node.description = f"Description {i}"
            mock_node.direction = "backend"
            mock_node.resources = "[]"
            mock_node.checkpoint = False
            mock_node.node_type = "task"
            mock_node.is_required = True
            mock_node.order_index = 0
            mock_node.is_active = True
            mock_node.blocked_by = []
            mock_node.blocks = []
            nodes.append(mock_node)
        
        # Создаем цепочку связей
        for i in range(len(nodes) - 1):
            nodes[i].children = [nodes[i + 1]]
        nodes[-1].children = []
        
        # Тестируем сериализацию с ограничением глубины
        result = RoadmapNodeOut.model_validate(nodes[0], max_depth=5)
        
        # Проверяем, что глубина ограничена
        current = result
        depth = 0
        while current.children and depth < 10:
            current = current.children[0]
            depth += 1
        
        assert depth <= 5  # Должно быть ограничено max_depth
    
    def test_model_validate_visited_set(self):
        """Тест использования visited set для предотвращения циклов."""
        # Создаем узел, который ссылается сам на себя
        mock_node = Mock()
        mock_node.id = 1
        mock_node.title = "Self-referencing Node"
        mock_node.description = "Description"
        mock_node.direction = "backend"
        mock_node.resources = "[]"
        mock_node.checkpoint = False
        mock_node.node_type = "task"
        mock_node.is_required = True
        mock_node.order_index = 0
        mock_node.is_active = True
        mock_node.blocked_by = []
        mock_node.blocks = []
        mock_node.children = [mock_node]  # Ссылка на самого себя
        
        # Тестируем сериализацию
        result = RoadmapNodeOut.model_validate(mock_node)
        
        assert result.id == 1
        assert result.title == "Self-referencing Node"
        # Дочерний элемент должен быть обрезан из-за self-reference
        assert result.children == []
