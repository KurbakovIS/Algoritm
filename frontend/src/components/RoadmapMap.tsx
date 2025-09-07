import VisualRoadmap from './VisualRoadmap'

type Node = { id: number, title: string, description: string, checkpoint: boolean, resources: string[], parent_id?: number, direction: string }

export default function RoadmapMap({ nodes, onOpen, direction }: { nodes: Node[], onOpen: (id: number) => void, direction?: string }) {
  return <VisualRoadmap direction={direction} onOpen={onOpen} />
}
