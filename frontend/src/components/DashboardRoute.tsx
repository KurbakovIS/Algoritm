import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

export default function DashboardRoute() {
  const navigate = useNavigate();

  const handleSelect = (direction: string) => {
    navigate(`/roadmap/${direction}`);
  };

  const handleChangeProfession = () => {
    // Открываем модальное окно выбора профессии
    // Это можно сделать через контекст или состояние
  };

  return (
    <Dashboard 
      onSelect={handleSelect}
      onChangeProfession={handleChangeProfession}
    />
  );
}
