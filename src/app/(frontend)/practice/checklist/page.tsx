'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { addChecklistItem, deleteChecklistItem, getChecklistItems, resetAllChecks, updateChecklistItem } from '@/lib/checklist-service';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { IoAddCircleOutline, IoCheckmarkOutline, IoCloseOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';

interface ChecklistItem {
  id: string;
  user_email: string;
  name: string;
  is_checked: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export default function ChecklistPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (session?.user?.email) {
      fetchChecklistItems();
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChecklistItems = async () => {
    if (!session?.user?.email) return;

    try {
      const data = await getChecklistItems(session.user.email);
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching checklist items:', error);
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItemName.trim() || !session?.user?.email) return;

    try {
      const newItem = await addChecklistItem(session.user.email, newItemName.trim());
      setItems([...items, newItem]);
      setNewItemName('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const toggleItem = async (id: string, isChecked: boolean) => {
    try {
      await updateChecklistItem(id, { is_checked: !isChecked });
      setItems(items.map((item) => (item.id === id ? { ...item, is_checked: !isChecked } : item)));
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
      await updateChecklistItem(editingId, { name: editingName.trim() });
      setItems(items.map((item) => (item.id === editingId ? { ...item, name: editingName.trim() } : item)));
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

  const deleteItem = async (id: string) => {
    try {
      await deleteChecklistItem(id);
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const resetChecklist = async () => {
    if (!session?.user?.email) return;

    try {
      await resetAllChecks(session.user.email);
      setItems(items.map((item) => ({ ...item, is_checked: false })));
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

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Gig Checklist</h1>
        {items.some((item) => item.is_checked) && (
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
        {items.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No items in your checklist yet.</p>
            <p className="mt-2 text-sm">Add items you need to bring to gigs!</p>
          </Card>
        ) : (
          items.map((item) => (
            <div key={item.id} className="space-y-2">
              {editingId === item.id ? (
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
                  <Card className={`flex-1 cursor-pointer p-2 transition-all active:scale-[0.98] ${item.is_checked ? '' : 'hover:bg-muted/30'}`} onClick={() => toggleItem(item.id, item.is_checked)}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${item.is_checked ? 'border-green-500 text-white' : 'border-muted-foreground/70'}`}>
                        {item.is_checked && <IoCheckmarkOutline className="h-3 w-3" />}
                      </div>
                      <span className={`flex-1 text-left transition-colors ${item.is_checked ? 'text-green-700 line-through dark:text-green-300' : 'text-white'}`}>{item.name}</span>
                    </div>
                  </Card>

                  {/* Action buttons on the side */}
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(item.id, item.name);
                      }}
                    >
                      <IoPencilOutline className="h-10 w-10" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
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
      {items.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {items.filter((item) => item.is_checked).length} of {items.length} items packed
        </div>
      )}
    </div>
  );
}
