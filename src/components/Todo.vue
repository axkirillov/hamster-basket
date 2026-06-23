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
			relative
		">
		<div
			class="flex items-center px-0 py-0 sm:px-4"
			@contextmenu.prevent="openLabelPicker"
			@touchstart="onTouchStart"
			@touchend="onTouchEnd"
			@touchmove="onTouchMove"
		>
			<Checkbox :checked="todo['is_complete'] ?? false" @click="updateTaskCompletion(todo, !todo['is_complete'])" />
			<div class="min-w-0 flex-1 flex flex-col items-start py-2">
				<div class="text-sm leading-5 font-medium whitespace-pre-wrap break-words w-full">{{ todo.task }}</div>
				<!-- Label badges -->
				<div v-if="assignedLabels.length > 0" class="flex flex-wrap gap-1 mt-1">
					<span
						v-for="label in assignedLabels"
						:key="label.id"
						:style="{ backgroundColor: label.color || '#3B82F6' }"
						class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
					>
						{{ label.name }}
					</span>
				</div>
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

		<!-- Label picker popover -->
		<div
			v-if="showLabelPicker"
			class="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1"
		>
			<div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
				Assign Labels
			</div>
			<div v-if="allLabels.length === 0" class="px-3 py-2 text-sm text-gray-400">
				No labels yet. Create one in the Lists menu.
			</div>
			<button
				v-for="label in allLabels"
				:key="label.id"
				@click.stop="toggleLabel(label)"
				class="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 transition duration-150"
			>
				<span
					:style="{ backgroundColor: label.color || '#3B82F6' }"
					class="w-3 h-3 rounded-full mr-2 flex-shrink-0"
				></span>
				<span class="flex-1 text-left">{{ label.name }}</span>
				<font-awesome-icon
					v-if="hasLabel(todo.id!, label.id!)"
					:icon="['fas', 'check']"
					class="w-3 h-3 text-green-500"
				/>
			</button>
		</div>
	</li>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, computed, onMounted } from 'vue'
import { updateTaskCompletion, deleteTodo } from '@/vuetils/useTodo'
import { allTodos } from '@/vuetils/useTodo'
import { allLabels, fetchLabels, addLabelToTodo, removeLabelFromTodo, getTodoLabels, hasLabel } from '@/vuetils/useLabels'
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
		const showLabelPicker = ref(false)
		let longPressTimer: ReturnType<typeof setTimeout> | null = null
		let touchMoved = false

		onMounted(async () => {
			if (allLabels.value.length === 0) {
				await fetchLabels()
			}
		})

		// Removes todo from supbase and also from app state
		function clearTodo() {
			showLabelPicker.value = false
			deleteTodo(props.todo).then(() => {
				allTodos.value = allTodos.value.filter(todo => todo.id != props.todo.id)
			})
		}

		// Long press for touch devices
		function onTouchStart() {
			touchMoved = false
			longPressTimer = setTimeout(() => {
				if (!touchMoved) {
					openLabelPicker()
				}
			}, 600)
		}

		function onTouchMove() {
			touchMoved = true
		}

		function onTouchEnd() {
			if (longPressTimer) {
				clearTimeout(longPressTimer)
				longPressTimer = null
			}
		}

		function openLabelPicker() {
			showLabelPicker.value = !showLabelPicker.value
			// Close picker when clicking outside
			if (showLabelPicker.value) {
				setTimeout(() => {
					const closeHandler = (e: MouseEvent) => {
						const picker = document.querySelector('.absolute.right-0.top-full')
						if (picker && !picker.contains(e.target as Node)) {
							showLabelPicker.value = false
							document.removeEventListener('click', closeHandler)
						}
					}
					document.addEventListener('click', closeHandler)
				}, 0)
			}
		}

		async function toggleLabel(label: Label) {
			if (!props.todo.id) return

			if (hasLabel(props.todo.id, label.id!)) {
				await removeLabelFromTodo(props.todo.id, label.id!)
			} else {
				await addLabelToTodo(props.todo.id, label.id!)
			}
		}

		const assignedLabels = computed(() => {
			if (!props.todo.id) return []
			return getTodoLabels(props.todo.id)
		})

		return {
			updateTaskCompletion,
			clearTodo,
			showLabelPicker,
			openLabelPicker,
			onTouchStart,
			onTouchEnd,
			onTouchMove,
			toggleLabel,
			allLabels,
			hasLabel,
			assignedLabels,
		}
	},
})
</script>

<style lang="scss" scoped></style>
