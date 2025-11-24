import React, { createContext, useContext, useState } from 'react';

type DropTarget = { teamId: string, roleId: string };

type DndContextType = {
    onDrop: (candidateId: string, target: DropTarget | null) => void;
};

const DndContext = createContext<DndContextType | undefined>(undefined);

export const useDnd = () => {
    const context = useContext(DndContext);
    if (!context) {
        throw new Error('useDnd must be used within a DndProvider');
    }
    return context;
};

interface DndProviderProps {
    children: React.ReactNode;
    onDrop: (candidateId: string, target: DropTarget | null) => void;
}

const DndProviderComponent: React.FC<DndProviderProps> = ({ children, onDrop }) => {
    const [isDragOverPool, setIsDragOverPool] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOverPool(false);

        try {
            const data = e.dataTransfer.getData("application/json");
            if (!data) return;
            const { candidateId } = JSON.parse(data);

            const dropTargetElement = e.target as HTMLElement;
            const teamSlot = dropTargetElement.closest('[data-role-id]');
            
            if (teamSlot) { // Dropped on a specific role slot
                const teamId = teamSlot.getAttribute('data-team-id');
                const roleId = teamSlot.getAttribute('data-role-id');
                if (teamId && roleId) {
                    onDrop(candidateId, { teamId, roleId });
                }
            } else if (dropTargetElement.closest('#candidate-pool')) { // Dropped on the unassigned pool
                onDrop(candidateId, null);
            }
        } catch (error) {
            console.error("Failed to parse dropped data", error);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const target = e.target as HTMLElement;
        if (target.closest('#candidate-pool')) {
            setIsDragOverPool(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
         const relatedTarget = e.relatedTarget as HTMLElement;
         if (!e.currentTarget.contains(relatedTarget)) {
            setIsDragOverPool(false);
         }
    };
    
    return (
        <DndContext.Provider value={{ onDrop }}>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                ref={node => {
                    if (node) {
                        const pool = node.querySelector('#candidate-pool');
                        if (pool) {
                            if (isDragOverPool) {
                                pool.classList.add('bg-green-100', 'border-green-400');
                                pool.classList.remove('bg-gray-100');
                            } else {
                                pool.classList.remove('bg-green-100', 'border-green-400');
                                pool.classList.add('bg-gray-100');
                            }
                        }
                    }
                }}
            >
                {children}
            </div>
        </DndContext.Provider>
    );
};

export { DndProviderComponent as DndContext };