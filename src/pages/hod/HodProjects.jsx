import CrudPage from '../../components/ui/CrudPage'
import { Badge } from '../../components/ui/primitives'

export default function HodProjects() {
  return (
    <CrudPage
      collection="projects"
      eyebrow="Publish"
      title="Student Projects"
      description="Final year and semester projects — guides, teams and deliverables."
      exportName="projects"
      searchKeys={['title', 'guide', 'students']}
      columns={[
        { key: 'title', label: 'Project', render: (p) => <span className="font-semibold text-zinc-800 dark:text-white/90">{p.title}</span> },
        { key: 'students', label: 'Team', render: (p) => (p.students?.length ? `${p.students.length} members` : '—') },
        { key: 'guide', label: 'Guide' },
        { key: 'year', label: 'Year' },
        { key: 'status', label: 'Status', render: (p) => <Badge tone={p.status === 'completed' ? 'mint' : 'amber'}>{p.status}</Badge> },
      ]}
      formFields={[
        { name: 'title', label: 'Project title', required: true },
        { name: 'students', label: 'Team member IDs (comma separated)', fullWidth: true },
        { name: 'guide', label: 'Guide' },
        { name: 'year', label: 'Year', type: 'number' },
        { name: 'githubLink', label: 'GitHub link', fullWidth: true },
        { name: 'demoLink', label: 'Demo link' },
        { name: 'status', label: 'Status', type: 'select', options: ['in-progress', 'completed'] },
      ]}
    />
  )
}
