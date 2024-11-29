/* eslint-disable @typescript-eslint/camelcase */
import { supabase } from '@/lib/supabase'
import { ref } from 'vue'
import { userSession } from '@/vuetils/useAuth'

const allTodos = ref<Todo[]>([])
const allLists = ref<TodoList[]>([])
const currentList = ref<TodoList | null>(null)

/**
 * Retrieve all lists for the signed in user
 */
async function fetchLists() {
	try {
		const { data: lists, error } = await supabase.from('todo_lists').select('*').order('id')

		if (error) {
			console.log('error', error)
			return
		}
		// handle for when no lists are returned
		if (lists === null || lists.length === 0) {
			// Create a default list if no lists exist
			const defaultList = await addList({ 
				user_id: userSession.value?.user.id || '', 
				name: 'Default List' 
			})
			
			if (defaultList) {
				allLists.value = [defaultList]
				currentList.value = defaultList
				return
			}
		}
		// store response to allLists
		allLists.value = lists
		currentList.value = lists[0]
		console.log('got lists!', allLists.value)
	} catch (err) {
		console.error('Error retrieving lists from db', err)
	}
}

/**
 * Retrieve todos for the current list
 */
async function fetchTodos(listId?: number) {
	try {
		const query = listId 
			? supabase.from('todos').select('*').eq('list_id', listId).order('id')
			: supabase.from('todos').select('*').order('id')

		const { data: todos, error } = await query

		if (error) {
			console.log('error', error)
			return
		}
		// handle for when no todos are returned
		if (todos === null) {
			allTodos.value = []
			return
		}
		// store response to allTodos
		allTodos.value = todos
		console.log('got todos!', allTodos.value)
	} catch (err) {
		console.error('Error retrieving data from db', err)
	}
}

/**
 *  Add a new list to supabase
 */
async function addList(list: TodoList): Promise<null | TodoList> {
	try {
		const { data, error } = await supabase.from('todo_lists').insert(list).select().single()

		if (error) {
			alert(error.message)
			console.error('There was an error inserting list', error)
			return null
		}

		return data
	} catch (err) {
		console.error('Unknown problem inserting list to db', err)
		return null
	}
}

/**
 * Delete a list from supabase
 */
async function deleteList(list: TodoList): Promise<boolean> {
	try {
		// First, delete all todos associated with this list
		await supabase.from('todos').delete().eq('list_id', list.id)

		// Then delete the list itself
		const { error } = await supabase.from('todo_lists').delete().eq('id', list.id)

		if (error) {
			alert(error.message)
			console.error('There was an error deleting list', error)
			return false
		}

		// Remove the list from allLists
		allLists.value = allLists.value.filter(l => l.id !== list.id)

		// If the deleted list was the current list, switch to another list or create a default
		if (currentList.value?.id === list.id) {
			if (allLists.value.length > 0) {
				currentList.value = allLists.value[0]
				await fetchTodos(currentList.value.id)
			} else {
				// Create a new default list if no lists remain
				const defaultList = await addList({ 
					user_id: userSession.value?.user.id || '', 
					name: 'Default List' 
				})
				
				if (defaultList) {
					currentList.value = defaultList
				}
			}
		}

		return true
	} catch (err) {
		console.error('Unknown problem deleting list from db', err)
		return false
	}
}

/**
 *  Add a new todo to supabase
 */
async function addTodo(todo: Todo): Promise<null | Todo> {
	try {
		const { data, error } = await supabase.from('todos').insert(todo).select().single()

		if (error) {
			alert(error.message)
			console.error('There was an error inserting', error)
			return null
		}

		return data
	} catch (err) {
		console.error('Unknown problem inserting to db', err)
		return null
	}
}

/**
 * Targets a specific todo via its record id and updates the is_completed attribute.
 */
async function updateTaskCompletion(todo: Todo, isCompleted: boolean) {
	try {
		const { error } = await supabase
			.from('todos')
			.update({ is_complete: isCompleted })
			.eq('id', todo.id)
			.single()

		if (error) {
			alert(error.message)
			console.error('There was an error updating', error)
			return
		}

		console.log('Updated task', todo.id)
	} catch (err) {
		alert('Error')
		console.error('Unknown problem updating record', err)
	}
}

/**
 *  Deletes a todo via its id
 */
async function deleteTodo(todo: Todo) {
	try {
		await supabase.from('todos').delete().eq('id', todo.id)
		console.log('deleted todo', todo.id)
	} catch (error) {
		console.error('error', error)
	}
}

const channel: any = supabase
	.channel('any')

channel
	.on('postgres_changes', { event: '*', schema: '*' }, (payload: any) => {
		console.log('Change received!', payload)
		fetchTodos()
	})
	.subscribe()


export { 
  allTodos, 
  fetchTodos, 
  addTodo, 
  updateTaskCompletion, 
  deleteTodo, 
  currentList, 
  allLists, 
  fetchLists, 
  addList,
  deleteList
}
