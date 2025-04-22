"use client";

import ITask from "@/types/entities/ITask";
import { useMemo } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Trash } from "lucide-react";
import { getBrazilianDate, secondsToTime } from "@/utils/time";
import axios from "axios";

interface TaskGroup {
  description: string;
  tasksIds: string[];
  duration: number;
}

export default function TasksList({
  tasks,
  setTasks,
}: {
  tasks: ITask[];
  setTasks(newTasks: ITask[]): void;
}) {
  const deleteTasks = (tasksIds: string[]) => {
    tasksIds.map(async (id) => {
      await axios.delete(`/api/tasks/${id}`);
    });
    setTasks(tasks.filter((t) => !tasksIds.includes(t.id)));
  };

  const grouppedTasks = useMemo<TaskGroup[]>(() => {
    return tasks.reduce((group: TaskGroup[], currentTask) => {
      const start = new Date(currentTask.startTime).getTime();
      const end = currentTask.endTime
        ? new Date(currentTask.endTime).getTime()
        : getBrazilianDate().getTime();
      const duration = Math.floor((end - start) / 1000);
      const currentTaskIndex = group.findIndex(
        (t) => t.description === currentTask.description
      );
      if (currentTaskIndex === -1) {
        return [
          {
            description: currentTask.description,
            tasksIds: [currentTask.id],
            duration,
          },
          ...group,
        ];
      }
      group[currentTaskIndex].tasksIds.push(currentTask.id);
      group[currentTaskIndex].duration += duration;
      return group;
    }, []);
  }, [tasks]);

  return (
    <div className="mt-4 space-y-4">
      {grouppedTasks.map((task) => (
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
            <p>
              ⏳ Duração:{" "}
              {task.duration < 0
                ? "Em andamento..."
                : secondsToTime(task.duration)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
