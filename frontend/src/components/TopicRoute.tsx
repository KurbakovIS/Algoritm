import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topic from '../pages/Topic';

export default function TopicRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };

  if (!id) {
    return <div>Ошибка: ID топика не найден</div>;
  }

  return (
    <Topic 
      id={parseInt(id)} 
      onBack={handleBack} 
    />
  );
}
