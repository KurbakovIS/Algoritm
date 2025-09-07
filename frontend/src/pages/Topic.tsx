import { useEffect, useState } from 'react'
import { Progress, Roadmap } from '../api'
import Toast from '../components/Toast'

type Node = { id: number, title: string, description: string, checkpoint: boolean, resources: string[] }

export default function Topic({ id, onBack }: { id: number, onBack: () => void }) {
  const [node, setNode] = useState<Node | null>(null)
  const [status, setStatus] = useState<'not_started'|'in_progress'|'completed'>('not_started')
  const [score, setScore] = useState(0)
  const [toast, setToast] = useState('')
  useEffect(() => { (async () => setNode(await Roadmap.getNode(id)))() }, [id])

  async function update(newStatus: 'not_started'|'in_progress'|'completed') {
    setStatus(newStatus)
    await Progress.update(id, newStatus, score)
    if (newStatus === 'completed') setToast('Задание выполнено! Вы получили XP и, возможно, бейдж!')
  }

  if (!node) return null
  return (
    <div className="max-w-4xl mx-auto mt-10 wood-panel p-6 rounded-xl">
      <button onClick={onBack} className="mb-4 text-sm underline">← Назад к карте</button>
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-amber-200 mb-2">{node.title}</h2>
          <p className="text-amber-100/90">{node.description}</p>
          <div className="mt-4">
            <h3 className="font-bold mb-2">Ресурсы</h3>
            <ul className="list-disc list-inside text-amber-100/90">
              {node.resources.map((r, i) => (<li key={i}><a className="underline" href={r} target="_blank">{r}</a></li>))}
            </ul>
          </div>
        </div>
        <div className="w-72 card-3d p-4">
          <h3 className="font-bold mb-2">Статус</h3>
          <select value={status} onChange={e=>setStatus(e.target.value as any)} className="w-full p-2 bg-black/30 rounded border border-amber-900">
            <option value="not_started">Не начато</option>
            <option value="in_progress">В процессе</option>
            <option value="completed">Завершено</option>
          </select>
          <div className="mt-4">
            <h3 className="font-bold mb-2">Мини-тест (очки)</h3>
            <input type="number" value={score} onChange={e=>setScore(parseInt(e.target.value||'0'))} min={0} max={100} className="w-full p-2 bg-black/30 rounded border border-amber-900" />
            <p className="text-xs mt-1 text-amber-100/70">От 0 до 100. Влияет на бонус XP.</p>
          </div>
          <button onClick={()=>update(status)} className="mt-4 w-full px-4 py-2 rounded brass-bevel">Отметить</button>
          {status==='completed' && <div className="mt-3 text-amber-200 animate-pop">Сияние! ✨</div>}
        </div>
      </div>
      {toast && <Toast message={toast} />}
    </div>
  )
}

