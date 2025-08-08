// ProviderTabs.jsx
import React from 'react';
import ProviderRequests from "../Providercomps/ProviderRequests";
import ProviderTalentpool from "../Providercomps/ProviderTalentpool";
import ProviderTechnicians from "../Providercomps/ProviderTechnicians";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'talentPools_v1';

const ProviderTabs = ({ providerTab, setProviderTab }) => {
    const [pools, setPools] = useState([]); // [{id, name, technicians: [...tech]}]
    const [selectedPoolId, setSelectedPoolId] = useState(null);

    // Load pools from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                setPools(Array.isArray(parsed) ? parsed : []);
                if (Array.isArray(parsed) && parsed[0]) {
                    setSelectedPoolId(parsed[0].id);
                }
            }
        } catch {
            setPools([]);
        }
    }, []);

    // Persist pools
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pools));
        } catch {}
    }, [pools]);

    const createPool = useCallback((name) => {
        const id = `${Date.now()}_${Math.floor(Math.random()*1e6)}`;
        const newPool = { id, name: name.trim() || `Pool ${pools.length + 1}`, technicians: [] };
        setPools((prev) => [newPool, ...prev]);
        setSelectedPoolId(id);
    }, [pools.length]);

    const renamePool = useCallback((id, name) => {
        setPools((prev) => prev.map(p => p.id === id ? { ...p, name } : p));
    }, []);

    const deletePool = useCallback((id) => {
        setPools((prev) => prev.filter(p => p.id !== id));
        setSelectedPoolId((cur) => (cur === id && pools[1] ? pools[1].id : null));
    }, [pools]);

    const addTechToPool = useCallback((poolId, technician) => {
        if (!poolId || !technician?._id) return;
        setPools((prev) => prev.map(pool => {
            if (pool.id !== poolId) return pool;
            const exists = pool.technicians.some(t => t._id === technician._id);
            if (exists) return pool;
            return { ...pool, technicians: [...pool.technicians, technician] };
        }));
    }, []);

    const removeTechFromPool = useCallback((poolId, technicianId) => {
        setPools((prev) => prev.map(pool => pool.id === poolId
            ? { ...pool, technicians: pool.technicians.filter(t => t._id !== technicianId) }
            : pool
        ));
    }, []);

    const [openRequests, setOpenRequests] = useState(false);
    const [openTalent, setOpenTalent] = useState(false);
    const [openTech, setOpenTech] = useState(false);

    return (
        <div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpenRequests(true)}>Requests</Button>
                <Button variant="outline" size="sm" onClick={() => setOpenTalent(true)}>Talent Pools</Button>
                <Button variant="outline" size="sm" onClick={() => setOpenTech(true)}>Technicians</Button>
            </div>

            <Dialog open={openRequests} onOpenChange={setOpenRequests}>
                <DialogContent className="max-w-3xl w-full">
                    <DialogHeader>
                        <DialogTitle>Applicants</DialogTitle>
                    </DialogHeader>
                    <ProviderRequests
                        pools={pools}
                        selectedPoolId={selectedPoolId}
                        onAddToPool={addTechToPool}
                        onSelectPool={setSelectedPoolId}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={openTalent} onOpenChange={setOpenTalent}>
                <DialogContent className="max-w-4xl w-full">
                    <DialogHeader>
                        <DialogTitle>Talent Pools</DialogTitle>
                    </DialogHeader>
                    <ProviderTalentpool
                        pools={pools}
                        selectedPoolId={selectedPoolId}
                        onSelectPool={setSelectedPoolId}
                        onCreatePool={createPool}
                        onRenamePool={renamePool}
                        onDeletePool={deletePool}
                        onRemoveTech={removeTechFromPool}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={openTech} onOpenChange={setOpenTech}>
                <DialogContent className="max-w-4xl w-full">
                    <DialogHeader>
                        <DialogTitle>Technicians</DialogTitle>
                    </DialogHeader>
                    <ProviderTechnicians
                        pools={pools}
                        selectedPoolId={selectedPoolId}
                        onSelectPool={setSelectedPoolId}
                        onAddToPool={addTechToPool}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProviderTabs;