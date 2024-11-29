<template>
	<div class="w-full">
		<div class="logos">
			<a href="" class="logo">
				<img src="/hamster.svg">
			</a>
			<a href="" class="logo">
				<img src="/basket.png">
			</a>
		</div>
		<h1 class="m-2 font-semibold text-2xl text-center whitespace-pre-wrap break-all w-full overflow-wrap-anywhere">Hamster's Basket 2.0</h1>
		<div class="bg-white shadow overflow-hidden rounded-md py-2">
			<ul v-for="(todo, index) in allTodos" :key="index">
				<Todo :todo="todo" />
			</ul>
		</div>
		<div class="flex gap-2 my-4">
			<input
				v-model="task"
				class="
					rounded 
					w-full 
					p-2 
					whitespace-pre-wrap 
					break-all 
					overflow-wrap-anywhere
				"
				type="text"
				placeholder="What do you need to do?"
				@keyup.enter="insertTask"
			/>
			<button @click="insertTask" class="btn-black">
				Add
			</button>
		</div>
	</div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { defineComponent, ref } from 'vue'
import Todo from '@/components/Todo.vue'
import { allTodos, fetchTodos, addTodo } from '@/vuetils/useTodo'
import { userSession } from '@/vuetils/useAuth'

export default defineComponent({
	name: 'TodoList',
	components: {
		Todo,
	},

	async setup() {
		await fetchTodos()

		const task = ref('')

		/**
		 * Wrapper function adding a new todo for additional client-side error handling.
		 */
		async function insertTask() {
			// Guard for short task descriptions which will fail db policy.
			if (task.value.length <= 3) {
				alert('Please make your task a little more descriptive')
				return
			}
			// Type check to ensure user is still logged in.
			if (userSession?.value === null) {
				alert('Please log in again')
				return
			}
			try {
				// Try and write the data to the database.
				const todo = await addTodo({ user_id: userSession.value.user.id, task: task.value })

				// If there was no response, don't do anything.
				if (!todo) {
					return
				}
				// Otherwise, push the response into allTodos.
				allTodos.value.push(todo)

				// Reset input field.
				task.value = ''
			} catch (err) {
				console.error('Unknown error when adding todo', err)
			}
		}

		return {
			task,
			allTodos,
			insertTask,
			userSession,
		}
	},
})
</script>
