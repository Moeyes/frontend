'use client';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useEffectiveOrgId, setDemoOrgId } from '../hooks/useEffectiveOrgId';
import { useOrganizations } from '@/modules/organizations';

// Shown when organization_id is missing from the session (backend gap).
// Allows the user to select their organization from a dropdown for demo purposes.
// Only rendered for user2 (Organization) users where org_id is not in session.
// No page reload required — useEffectiveOrgId is reactive via custom event.
export function DemoOrgIdSetter() {
  const orgId = useEffectiveOrgId();
  const orgsQuery = useOrganizations({ limit: 200 });
  const [selected, setSelected] = useState<string>('');
  const [saved, setSaved] = useState(false);

  // If org_id is already known (from session OR from localStorage), show nothing
  if (orgId != null) return null;

  const orgs = orgsQuery.data?.data ?? [];

  const handleSave = () => {
    if (!selected) return;
    setDemoOrgId(Number(selected));
    setSaved(true);
    // useEffectiveOrgId will update reactively — no reload needed
  };

  if (saved) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-400 bg-green-50 px-4 py-3 text-sm text-green-800">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        {'organization_id — បានកំណត់រួចរាល់'}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-2">
        <p className="font-medium">
          {'organization_id — ត្រូវការជ្រើសរើសអង្គការ'}
        </p>
        <p className="text-xs text-yellow-700">
          {'Backend មិនទាន់ផ្ញើ organization_id — ជ្រើសរើសអង្គការដើម្បីបន្ត'}
        </p>
        <div className="flex items-center gap-2">
          <select
            className="rounded border px-2 py-1 text-sm bg-white text-yellow-900 border-yellow-400"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">{'ជ្រើសរើសអង្គការ...'}</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>{o.name_kh}</option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            disabled={!selected}
            onClick={handleSave}
            className="border-yellow-500 text-yellow-800 hover:bg-yellow-100"
          >
            {'រក្សាទុក'}
          </Button>
        </div>
      </div>
    </div>
  );
}
