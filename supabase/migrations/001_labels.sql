-- Labels table: stores user-defined labels like "important", "optional", etc.
CREATE TABLE IF NOT EXISTS labels (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: many-to-many relationship between todos and labels
CREATE TABLE IF NOT EXISTS todo_labels (
  todo_id BIGINT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  label_id BIGINT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (todo_id, label_id)
);

-- RLS policies for labels
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own labels" ON labels
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own labels" ON labels
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own labels" ON labels
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own labels" ON labels
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for todo_labels
ALTER TABLE todo_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view labels for their todos" ON todo_labels
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_labels.todo_id AND todos.user_id = auth.uid())
  );
CREATE POLICY "Users can add labels to their todos" ON todo_labels
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_labels.todo_id AND todos.user_id = auth.uid())
  );
CREATE POLICY "Users can remove labels from their todos" ON todo_labels
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_labels.todo_id AND todos.user_id = auth.uid())
  );
