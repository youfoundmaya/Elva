"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { Pencil, Trash } from "lucide-react"

interface Todo {
    id: number
    text: string
    completed: boolean
    isEditing: boolean
}

export default function TodoWidget() {
    const [todos, setTodos] = useState<Todo[]>([])
    const [newTodo, setNewTodo] = useState("")
    const today = format(new Date(), "dd/MM/yy")

    // Function to load todos from localStorage
    const loadTodos = () => {
        const saved = localStorage.getItem("todos")
        if (saved) {
            const parsed = JSON.parse(saved)
            const savedDate = parsed.date
            const todayDate = new Date().toDateString()

            if (savedDate === todayDate) {
                setTodos(parsed.todos)
            } else {
                localStorage.removeItem("todos") // expire old ones
                setTodos([]) // Clear state if date is outdated
            }
        }
    }

    // Load todos from localStorage on every page load or navigation
    useEffect(() => {
        loadTodos() // Load todos on mount or page navigation

        const handleStorageChange = () => {
            loadTodos() // Recheck localStorage if something changes externally
        }

        window.addEventListener('storage', handleStorageChange) // Listen for storage events

        // Cleanup listener when the component is unmounted
        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, []) // This ensures it runs when the component is mounted

    // Only update localStorage if todos actually change
    useEffect(() => {
        if (todos.length > 0) { // Ensure we're only updating when todos are modified
            const payload = {
                date: new Date().toDateString(),
                todos,
            }
            localStorage.setItem("todos", JSON.stringify(payload))
        }
    }, [todos]) // Persist todos to localStorage when todos change

    // Remove todos at midnight using a timer
    useEffect(() => {
        const now = new Date()
        const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()

        const timeout = setTimeout(() => {
            localStorage.removeItem("todos")
            setTodos([]) // Clear todos
        }, millisTillMidnight)

        return () => clearTimeout(timeout)
    }, []) // Runs once when the component mounts

    const addTodo = () => {
        if (!newTodo.trim()) return
        setTodos([
            ...todos,
            {
                id: Date.now(),
                text: newTodo,
                completed: false,
                isEditing: false,
            },
        ])
        setNewTodo("")
    }

    const toggleComplete = (id: number) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ))
    }

    const deleteTodo = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id))
    }

    const toggleEdit = (id: number) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
        ))
    }

    const updateText = (id: number, text: string) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, text } : todo
        ))
    }

    return (
<div className="absolute top-4 right-4 w-80">
  <Card className="min-h-64 flex flex-col">
    <CardHeader className="flex justify-between items-center">
      <CardTitle>todo: {today}</CardTitle>
      <CardDescription>Daily Todo</CardDescription>
    </CardHeader>

    {/* Scrollable/expanding todo list area */}
    <CardContent className="flex-1 overflow-y-auto space-y-4">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-center space-x-2">
          <Checkbox
            id={`task-${todo.id}`}
            checked={todo.completed}
            onCheckedChange={() => toggleComplete(todo.id)}
          />
          {todo.isEditing ? (
            <Input
              value={todo.text}
              onChange={(e) => updateText(todo.id, e.target.value)}
              onBlur={() => toggleEdit(todo.id)}
              autoFocus
              className="text-sm"
            />
          ) : (
            <label
              htmlFor={`task-${todo.id}`}
              className={`text-sm leading-none ${todo.completed ? "line-through text-muted-foreground" : ""}`}
              onDoubleClick={() => toggleEdit(todo.id)}
            >
              {todo.text}
            </label>
          )}
          <div className="flex space-x-1">
            <Pencil
              size={14}
              className="text-muted-foreground cursor-pointer"
              onClick={() => toggleEdit(todo.id)}
            />
            <Trash
              size={14}
              className="text-red-500 cursor-pointer hover:text-red-600"
              onClick={() => deleteTodo(todo.id)}
            />
          </div>
        </div>
      ))}
    </CardContent>

    {/* Input at the very bottom */}
    <div className="p-4 border-t flex items-center gap-2">
      <Input
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="New task..."
        className="flex-1"
      />
      <Button size="sm" onClick={addTodo}>+</Button>
    </div>
  </Card>
</div>

    )
}
