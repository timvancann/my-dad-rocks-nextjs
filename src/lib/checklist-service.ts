import { supabase } from './supabase';

interface ChecklistItem {
  id: string;
  user_email: string;
  name: string;
  is_checked: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export async function getChecklistItems(userEmail: string): Promise<ChecklistItem[]> {
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('user_email', userEmail)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching checklist items:', error);
    throw error;
  }

  return data || [];
}

export async function addChecklistItem(userEmail: string, name: string): Promise<ChecklistItem> {
  // Get the highest position to add new item at the end
  const { data: existingItems } = await supabase
    .from('checklist_items')
    .select('position')
    .eq('user_email', userEmail)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingItems && existingItems.length > 0 
    ? existingItems[0].position + 1 
    : 0;

  const { data, error } = await supabase
    .from('checklist_items')
    .insert({
      user_email: userEmail,
      name,
      position: nextPosition,
      is_checked: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding checklist item:', error);
    throw error;
  }

  return data;
}

export async function updateChecklistItem(
  id: string, 
  updates: Partial<{ name: string; is_checked: boolean }>
): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from('checklist_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating checklist item:', error);
    throw error;
  }

  return data;
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting checklist item:', error);
    throw error;
  }
}

export async function resetAllChecks(userEmail: string): Promise<void> {
  const { error } = await supabase
    .from('checklist_items')
    .update({ is_checked: false })
    .eq('user_email', userEmail);

  if (error) {
    console.error('Error resetting checklist:', error);
    throw error;
  }
}