'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useChecklistItems,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
  useResetAllChecklistItems
} from '@/hooks/convex';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { IoAddCircleOutline, IoCheckmarkOutline, IoCloseOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import type { Id } from '../../../../../convex/_generated/dataModel';

export default function ChecklistPage() {
  const { data: session } = useSession();
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Convex hooks
  const items = useChecklistItems(session?.user?.email ?? undefined);
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const resetAll = useResetAllChecklistItems();

  const loading = items === undefined;

  const addItem = async () => {
    if (!newItemName.trim() || !session?.user?.email) return;

    try {
      await createItem({
        userEmail: session.user.email,
        name: newItemName.trim(),
      });
      setNewItemName('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const toggleItem = async (id: string, isChecked: boolean) => {
    try {
      await updateItem({
        id: id as Id<"checklistItems">,
        isChecked: !isChecked,
      });
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const saveEdit = async () => {
    if (!editingName.trim() || !editingId) return;

    try {
      await updateItem({
        id: editingId as Id<"checklistItems">,
        name: editingName.trim(),
      });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem({ id: id as Id<"checklistItems"> });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const resetChecklist = async () => {
    if (!session?.user?.email) return;

    try {
      await resetAll({ userEmail: session.user.email });
    } catch (error) {
      console.error('Error resetting checklist:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-4">
        <h1 className="mb-8 text-3xl font-bold">My Gig Checklist</h1>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const sortedItems = [...(items || [])].sort((a, b) => a.position - b.position);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Gig Checklist</h1>
        {sortedItems.some((item) => item.isChecked) && (
          <Button variant="outline" size="sm" onClick={resetChecklist}>
            Reset All
          </Button>
        )}
      </div>

      {/* Add new item */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Add new item (e.g., 2 guitars, cables, FM9...)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            className="flex-1"
          />
          <Button onClick={addItem} disabled={!newItemName.trim()}>
            <IoAddCircleOutline className="mr-1 h-5 w-5" />
            Add
          </Button>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {sortedItems.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No items in your checklist yet.</p>
            <p className="mt-2 text-sm">Add items you need to bring to gigs!</p>
          </Card>
        ) : (
          sortedItems.map((item) => (
            <div key={item._id} className="space-y-2">
              {editingId === item._id ? (
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && saveEdit()} className="flex-1" autoFocus />
                    <Button size="icon" variant="ghost" onClick={saveEdit}>
                      <IoCheckmarkOutline className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEdit}>
                      <IoCloseOutline className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="flex items-center gap-2">
                  <Card className={`flex-1 cursor-pointer p-2 transition-all active:scale-[0.98] ${item.isChecked ? '' : 'hover:bg-muted/30'}`} onClick={() => toggleItem(item._id, item.isChecked)}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${item.isChecked ? 'border-green-500 text-white' : 'border-muted-foreground/70'}`}>
                        {item.isChecked && <IoCheckmarkOutline className="h-3 w-3" />}
                      </div>
                      <span className={`flex-1 text-left transition-colors ${item.isChecked ? 'text-green-700 line-through dark:text-green-300' : 'text-white'}`}>{item.name}</span>
                    </div>
                  </Card>

                  {/* Action buttons on the side */}
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(item._id, item.name);
                      }}
                    >
                      <IoPencilOutline className="h-10 w-10" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item._id);
                      }}
                    >
                      <IoTrashOutline className="h-10 w-10" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Progress indicator */}
      {sortedItems.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {sortedItems.filter((item) => item.isChecked).length} of {sortedItems.length} items packed
        </div>
      )}
    </div>
  );
}
