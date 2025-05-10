
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Todo } from "@/types/todo";
import TodoItem from "./TodoItem";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  // fetch todos from Supabase on load
  // It does not fetch other users todos thanks to the "Read own todos only" Supabase RLS policy on the todos table
  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching todos:", error.message);
      } else {
        setTodos(data || []);
      }
    };

    fetchTodos();
  }, []);

  // insert todos to Supabase
  const addTodo = async () => {
    if (newTodo.trim()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("todos")
        .insert({
          text: newTodo.trim(),
          completed: false,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding todo:", error.message);
      } else {
        setTodos([data, ...todos]);
        setNewTodo("");
      }
    }
  };

  const toggleComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const { data, error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling todo:", error.message);
    } else {
      setTodos(todos.map((t) => (t.id === id ? data : t)));
    }
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      console.error("Error deleting todo:", error.message);
    } else {
      setTodos(todos.filter((t) => t.id !== id));
    }
  };

  const editTodo = async (id: string, newText: string) => {
    const { data, error } = await supabase
      .from("todos")
      .update({ text: newText })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error editing todo:", error.message);
    } else {
      setTodos(todos.map((t) => (t.id === id ? data : t)));
    }
  };


  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">My Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-6">
          <Input
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
            }}
            className="flex-1"
          />
          <Button onClick={addTodo}>
            <Plus className="h-5 w-5 mr-1" /> Add
          </Button>
        </div>

        <div>
          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>You don't have any tasks yet.</p>
              <p className="text-sm">Add your first task to get started!</p>
            </div>
          ) : (
            <>
              {todos
                .filter((todo) => !todo.completed)
                .map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggleComplete={toggleComplete}
                    onDelete={deleteTodo}
                    onEdit={editTodo}
                  />
                ))}

              {todos.some((todo) => todo.completed) && (
                <div className="mt-8">
                  <h3 className="font-medium text-gray-500 mb-2">Completed</h3>
                  {todos
                    .filter((todo) => todo.completed)
                    .map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggleComplete={toggleComplete}
                        onDelete={deleteTodo}
                        onEdit={editTodo}
                      />
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoList;
