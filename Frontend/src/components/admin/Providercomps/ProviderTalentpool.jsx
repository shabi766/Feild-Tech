// ProviderTalentpool.js
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ProviderTalentpool = ({
  pools = [],
  selectedPoolId,
  onSelectPool,
  onCreatePool,
  onRenamePool,
  onDeletePool,
  onRemoveTech
}) => {
  const [newPoolName, setNewPoolName] = useState("");
  const [renamingPoolId, setRenamingPoolId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const selectedPool = useMemo(
    () => pools.find(p => p.id === selectedPoolId) || pools[0],
    [pools, selectedPoolId]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Talent Pools</span>
            <div className="flex gap-2">
              <Input
                placeholder="Create new pool"
                value={newPoolName}
                onChange={(e) => setNewPoolName(e.target.value)}
                className="h-9 w-48"
              />
              <Button size="sm" onClick={() => { onCreatePool?.(newPoolName); setNewPoolName(""); }}>Create</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {pools.length === 0 && (
              <p className="text-sm text-gray-500">No talent pools yet. Create one to get started.</p>
            )}
            {pools.map(pool => (
              <Badge
                key={pool.id}
                onClick={() => onSelectPool?.(pool.id)}
                className={`cursor-pointer ${selectedPool?.id === pool.id ? '' : 'bg-muted text-foreground'}`}
              >
                {renamingPoolId === pool.id ? (
                  <span className="flex items-center gap-2">
                    <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="h-7 w-32" />
                    <Button size="sm" variant="outline" onClick={() => { onRenamePool?.(pool.id, renameValue.trim() || pool.name); setRenamingPoolId(null); setRenameValue(""); }}>Save</Button>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {pool.name}
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setRenamingPoolId(pool.id); setRenameValue(pool.name); }}>Rename</Button>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDeletePool?.(pool.id); }}>Delete</Button>
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPool && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedPool.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPool.technicians.length === 0 ? (
              <p className="text-sm text-gray-500">No technicians in this pool yet.</p>
            ) : (
              <ul className="space-y-3">
                {selectedPool.technicians.map((tech) => (
                  <li key={tech._id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{tech.fullname}</p>
                      <p className="text-sm text-gray-600">{tech.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onRemoveTech?.(selectedPool.id, tech._id)}>Remove</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProviderTalentpool;
