"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Play, Square, Trash } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

interface Task {
  id: string
  description: string
  startTime: string
  endTime: string
  userId: string
}

interface TaskGroup {
  description: string;
  tasksIds: string[];
  duration: number;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [liveDuration, setLiveDuration] = useState(0);
  const currentTask = useMemo(() => tasks.find(t => t.endTime === null) || null, [tasks]);
  const [taskDescription, setTaskDescription] = useState<string>(currentTask?.description || '');
  const hasCurrentTask = useMemo(() => !!currentTask, [currentTask]);

  const grouppedTasks = useMemo<TaskGroup[]>(() => {
    return tasks.reduce((group: TaskGroup[], currentTask) => {
      const start = new Date(currentTask.startTime).getTime();
      const end = currentTask.endTime ? new Date(currentTask.endTime).getTime() : Date.now();
      const duration = Math.floor((end - start) / 1000);
      const currentTaskIndex = group.findIndex((t) => t.description === currentTask.description);
      if (currentTaskIndex === -1) {
        return [{ description: currentTask.description, tasksIds: [currentTask.id], duration }, ...group];
      }
      group[currentTaskIndex].tasksIds.push(currentTask.id);
      group[currentTaskIndex].duration += duration;
      return group;
    }, []);
  }, [tasks]);

  const tasksDuration = useMemo(
    () => grouppedTasks.reduce((totalDuration, group) => totalDuration + group.duration, 0) + liveDuration,
    [grouppedTasks, liveDuration]
  );

  useEffect(() => {
    if (!currentTask) return;
    setLiveDuration(0);
    const interval = setInterval(() => {
      setLiveDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTask]);


  const secondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsToMinutes = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secondsToMinutes.toString().padStart(2, "0")}`;
  };

  const fetchTasks = async () => {
    const { data: tasksResponse } = await axios.get('/api/tasks');
    setTasks(tasksResponse)
  }

  const createTask = async () => {
    try {
      const { data: newTask } = await axios.post('/api/tasks', {
        description: taskDescription
      })
      setTasks((prevTasks) => [newTask, ...prevTasks]);
    } catch (err: any) {
      toast.error(err.response.data.message)
    }
  }

  const stopTask = async () => {
    await axios.patch(`/api/tasks/${currentTask?.id}/stop`)
    setLiveDuration(0)
    await fetchTasks()
  }

  const deleteTasks = (tasksIds: string[]) => {
    tasksIds.map(async (id) => {
      await axios.delete(`/api/tasks/${id}`)
    })
    setTasks(tasks.filter(t => !tasksIds.includes(t.id)))
  }

  useEffect(() => {
    fetchTasks()
  }, [])


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Button
        variant="destructive"
        className="absolute top-4 right-4"
        onClick={() => signOut()}
      >
        <LogOut className="w-5 h-5 mr-2" /> Sair
      </Button>
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">⏳ Cronômetro de Tarefas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value.toUpperCase())}
            placeholder="Nome da Tarefa"
            disabled={hasCurrentTask}
          />
          <div className="text-4xl font-bold text-center my-4">{secondsToTime(tasksDuration)}</div>
          <div className="flex gap-2 justify-center">
            <Button className="w-1/2" onClick={createTask} disabled={hasCurrentTask}>
              <Play className="w-5 h-5 mr-2" /> Iniciar
            </Button>
            <Button className="w-1/2" variant="destructive" onClick={stopTask} disabled={!hasCurrentTask}>
              <Square className="w-5 h-5 mr-2" /> Parar
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {grouppedTasks.map(task => (
              <Card key={task.description} className="p-3 relative">
                <Button
                  variant="ghost"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  size="icon"
                  onClick={() => deleteTasks(task.tasksIds)}
                >
                  <Trash className="w-5 h-5" />
                </Button>
                <CardHeader>
                  <CardTitle className="text-sm">{task.description}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>⏳ Duração: {task.duration < 0 ? 'Em andamento...' : secondsToTime(task.duration)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
