import { supabase } from '@/lib/supabase'
import { ref } from 'vue'
import { userSession } from '@/vuetils/useAuth'

const allLabels = ref<Label[]>([])
// Maps todo_id -> array of label ids
const todoLabelMap = ref<Record<number, number[]>>({})

/**
 * Fetch all labels for the current user
 */
async function fetchLabels() {
  try {
    const { data: labels, error } = await supabase
      .from('labels')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching labels', error)
      return
    }

    allLabels.value = labels ?? []
  } catch (err) {
    console.error('Unknown error fetching labels', err)
  }
}

/**
 * Create a new label
 */
async function addLabel(label: Omit<Label, 'id' | 'created_at'>): Promise<Label | null> {
  try {
    const { data, error } = await supabase
      .from('labels')
      .insert(label)
      .select()
      .single()

    if (error) {
      alert(error.message)
      console.error('Error inserting label', error)
      return null
    }

    allLabels.value.push(data)
    return data
  } catch (err) {
    console.error('Unknown error inserting label', err)
    return null
  }
}

/**
 * Delete a label
 */
async function deleteLabel(label: Label): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', label.id)

    if (error) {
      alert(error.message)
      console.error('Error deleting label', error)
      return false
    }

    allLabels.value = allLabels.value.filter(l => l.id !== label.id)
    // Remove from todoLabelMap
    Object.keys(todoLabelMap.value).forEach(todoIdStr => {
      const todoId = Number(todoIdStr)
      todoLabelMap.value[todoId] = todoLabelMap.value[todoId].filter(lid => lid !== label.id)
    })
    return true
  } catch (err) {
    console.error('Unknown error deleting label', err)
    return false
  }
}

/**
 * Fetch all todo-label assignments (for all todos of current user)
 */
async function fetchTodoLabels() {
  try {
    const { data, error } = await supabase
      .from('todo_labels')
      .select('*')

    if (error) {
      console.error('Error fetching todo labels', error)
      return
    }

    const map: Record<number, number[]> = {}
    ;(data ?? []).forEach((tl: TodoLabel) => {
      if (!map[tl.todo_id]) map[tl.todo_id] = []
      map[tl.todo_id].push(tl.label_id)
    })
    todoLabelMap.value = map
  } catch (err) {
    console.error('Unknown error fetching todo labels', err)
  }
}

/**
 * Assign a label to a todo
 */
async function addLabelToTodo(todoId: number, labelId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('todo_labels')
      .insert({ todo_id: todoId, label_id: labelId })

    if (error) {
      console.error('Error adding label to todo', error)
      return false
    }

    if (!todoLabelMap.value[todoId]) {
      todoLabelMap.value[todoId] = []
    }
    todoLabelMap.value[todoId].push(labelId)
    return true
  } catch (err) {
    console.error('Unknown error adding label to todo', err)
    return false
  }
}

/**
 * Remove a label from a todo
 */
async function removeLabelFromTodo(todoId: number, labelId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('todo_labels')
      .delete()
      .eq('todo_id', todoId)
      .eq('label_id', labelId)

    if (error) {
      console.error('Error removing label from todo', error)
      return false
    }

    if (todoLabelMap.value[todoId]) {
      todoLabelMap.value[todoId] = todoLabelMap.value[todoId].filter(lid => lid !== labelId)
    }
    return true
  } catch (err) {
    console.error('Unknown error removing label from todo', err)
    return false
  }
}

/**
 * Get labels assigned to a specific todo
 */
function getTodoLabels(todoId: number): Label[] {
  const labelIds = todoLabelMap.value[todoId] ?? []
  return allLabels.value.filter(l => labelIds.includes(l.id!))
}

/**
 * Check if a todo has a specific label
 */
function hasLabel(todoId: number, labelId: number): boolean {
  return (todoLabelMap.value[todoId] ?? []).includes(labelId)
}

// Realtime subscription for labels and todo_labels changes
const labelChannel = supabase
  .channel('label-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'labels' }, () => {
    console.log('Labels changed, refreshing...')
    fetchLabels()
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'todo_labels' }, () => {
    console.log('Todo labels changed, refreshing...')
    fetchTodoLabels()
  })
  .subscribe()

export {
  allLabels,
  todoLabelMap,
  fetchLabels,
  addLabel,
  deleteLabel,
  fetchTodoLabels,
  addLabelToTodo,
  removeLabelFromTodo,
  getTodoLabels,
  hasLabel,
}
