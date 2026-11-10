import { CounterDetail } from '@/components/counter-detail'

export default async function CounterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CounterDetail id={id} />
}
