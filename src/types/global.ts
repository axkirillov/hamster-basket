declare interface Credentials {
  email?: string | undefined
  password?: string | undefined
  provider?: 'bitbucket' | 'github' | 'gitlab' | 'google' | undefined
}

declare interface Todo {
  id?: number
  user_id: string
  task: string
  is_complete?: boolean
  inserted_at?: string
  list_id?: number
}

declare interface TodoList {
  id?: number
  user_id: string
  name: string
  created_at?: string
}

declare interface Label {
  id?: number
  user_id: string
  name: string
  color?: string
  created_at?: string
}

declare interface TodoLabel {
  todo_id: number
  label_id: number
}
