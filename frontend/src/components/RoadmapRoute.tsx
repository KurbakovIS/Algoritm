import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoadmapPage from '../pages/Roadmap';

export default function RoadmapRoute() {
  const { direction } = useParams<{ direction: string }>();
  const navigate = useNavigate();

  const handleOpen = (id: number) => {
    navigate(`/topic/${id}`);
  };

  return (
    <RoadmapPage 
      direction={direction || 'frontend'} 
      onOpen={handleOpen} 
    />
  );
}
