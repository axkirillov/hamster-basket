<template>
	<li
		class="
			w-full 
			block 
			cursor-pointer 
			hover:bg-gray-200 
			focus:outline-none 
			focus:bg-gray-200 
			transition 
			duration-150 
			ease-in-out
		">
		<div class="flex items-center px-0 py-0 sm:px-4">
			<Checkbox :checked="todo['is_complete'] ?? false" @click="updateTaskCompletion(todo, !todo['is_complete'])" />
			<div class="min-w-0 flex-1 flex items-center">
				<div class="text-sm leading-5 font-medium whitespace-pre-wrap break-all w-full overflow-wrap-anywhere">{{ todo.task }}</div>
			</div>
			<button
				class="
					middle 
					none 
					center 
					mr-4 
					flex 
					items-center 
					justify-center 
					rounded-lg 
					bg-gray-100 
					p-2 
					font-sans 
					text-xs 
					font-bold 
					uppercase 
					text-pink-500 
					shadow-md 
					shadow-gray-500/20 
					transition-all 
					hover:shadow-lg 
					hover:shadow-pink-500/40 
					focus:opacity-[0.85] 
					focus:shadow-none 
					active:opacity-[0.85] 
					active:shadow-none 
					disabled:pointer-events-none 
					disabled:opacity-50 
					disabled:shadow-none
				"
				data-ripple-light="true" 
				@click="clearTodo">
				<font-awesome-icon :icon="['fas', 'xmark']" />
			</button>
		</div>
	</li>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { updateTaskCompletion, deleteTodo } from '@/vuetils/useTodo'
import { allTodos } from '@/vuetils/useTodo'
import Checkbox from '@/components/Checkbox.vue'

export default defineComponent({
	name: 'Todo',
	components: {
		Checkbox,
	},
	props: {
		todo: {
			type: Object as PropType<Todo>,
			required: true,
		},
	},
	setup(props) {
		// Removes todo from supbase and also from app state
		function clearTodo() {
			deleteTodo(props.todo).then(() => {
				allTodos.value = allTodos.value.filter(todo => todo.id != props.todo.id)
			})
		}

		return { updateTaskCompletion, clearTodo }
	},
})
</script>

<style lang="scss" scoped></style>
