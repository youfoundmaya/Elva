"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { StickyNote, X } from "lucide-react"
import Draggable from "react-draggable"
import { Card } from "./ui/card"

interface StickyNote {
    id: number
    text: string
    color: string
    x: number
    y: number
}

const colors = [
    "bg-yellow-100",
    "bg-pink-100",
    "bg-blue-100",
    "bg-green-100",
    "bg-purple-100",
]

export default function StickyNotesWidget() {
    const [notes, setNotes] = useState<StickyNote[]>([])
    const refs = useRef<Map<number, React.RefObject<HTMLDivElement>>>(new Map())

    useEffect(() => {
        const stored = localStorage.getItem("stickyNotes")
        if (stored) {
            setNotes(JSON.parse(stored))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("stickyNotes", JSON.stringify(notes))
    }, [notes])

    const createSticky = () => {
        const id = Date.now()
        const newRef = React.createRef<HTMLDivElement>()
        refs.current.set(id, newRef)

        const newNote: StickyNote = {
            id,
            text: "",
            color: colors[Math.floor(Math.random() * colors.length)],
            x: Math.random() * 300,
            y: Math.random() * 300,
        }
        setNotes((prev) => [...prev, newNote])
    }

    const updateText = (id: number, text: string) => {
        setNotes((prev) =>
            prev.map((note) => (note.id === id ? { ...note, text } : note))
        )
    }

    const removeSticky = (id: number) => {
        setNotes((prev) => prev.filter((note) => note.id !== id))
        refs.current.delete(id)
    }

    const updatePosition = (id: number, x: number, y: number) => {
        setNotes((prev) =>
            prev.map((note) => (note.id === id ? { ...note, x, y } : note))
        )
    }

    return (
        <div className="relative h-full">
            <Card className="text-gray-800 p-3 w-fit  md:w-auto">
                <div className="flex items-center">
                    
                    <Button
                        onClick={createSticky}
                        className="p-3 text-lg border"
                        variant="outline"
                    >
                        <StickyNote className="text-xl"/>
                        Post it!
                    </Button>
                    <div>
                    <p className="ml-4">
                       Create lightweight, draggable sticky notes for your quick thoughts and reminders!</p>
                       <p className="ml-4 text-gray-600">Note: the sticky notes are persistent, however only displayed on Dashboard.</p>
                    </div>
                    
                </div>
                
            </Card>

            {notes.map((note) => {
                if (!refs.current.has(note.id)) {
                    refs.current.set(note.id, React.createRef<HTMLDivElement>())
                }

                const ref = refs.current.get(note.id)!

                return (
                    <Draggable
                        key={note.id}
                        nodeRef={ref}
                        defaultPosition={{ x: note.x, y: note.y }}
                        onStop={(_, data) => updatePosition(note.id, data.x, data.y)}
                    >
                        <div ref={ref} className="absolute" style={{ zIndex: 50 }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                className={`${note.color} p-3 rounded-md shadow-md cursor-move`}
                                style={{ width: "180px" }}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-600">Sticky</span>
                                    <X
                                        size={16}
                                        className="cursor-pointer text-gray-500 hover:text-red-500"
                                        onClick={() => removeSticky(note.id)}
                                    />
                                </div>
                                <textarea
                                    className="w-full h-32 resize-none bg-transparent text-sm focus:outline-none"
                                    value={note.text}
                                    onChange={(e) => updateText(note.id, e.target.value)}
                                    placeholder="Write something..."
                                />
                            </motion.div>
                        </div>
                    </Draggable>
                )
            })}
        </div>
    )
}
