"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import TasksList from "@/components/home/TasksList";
import ITask from "@/types/entities/ITask";
import LogoutButton from "@/components/home/LogoutButton";
import TaskForm from "@/components/home/TaskForm";

export default function Home() {
  const [tasks, setTasks] = useState<ITask[]>([]);

  const fetchTasks = async () => {
    const { data: tasksResponse } = await axios.get("/api/tasks");
    setTasks(tasksResponse);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <LogoutButton />
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">
            ⏳ Cronômetro de Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TaskForm
            tasks={tasks}
            setTasks={setTasks}
            afterStopTask={fetchTasks}
          />
          <TasksList tasks={tasks} setTasks={setTasks} />
        </CardContent>
      </Card>
    </div>
  );
}
