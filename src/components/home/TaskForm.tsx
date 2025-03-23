"use client";

import { Play, Square } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";
import axios from "axios";
import { toast } from "sonner";
import ITask from "@/types/entities/ITask";
import { secondsToTime } from "@/utils/time";

export default function TaskForm({
  tasks,
  setTasks,
  afterStopTask,
}: {
  tasks: ITask[];
  setTasks(newTasks: ITask[]): void;
  afterStopTask(): void;
}) {
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [descriptions, setDescriptions] = useState<
    { label: string; value: string }[]
  >([]);
  const currentTask = useMemo(() => {
    return tasks.find((t) => t.endTime === null);
  }, [tasks]);
  const [tasksDuration, setTasksDuration] = useState<number>(0);

  const createTask = async () => {
    if (!taskDescription) {
      return toast.error("Informe a descrição da tarefa.");
    }
    const { data: newTask } = await axios.post("/api/tasks", {
      description: taskDescription,
    });
    setTasks([newTask, ...tasks]);
  };
  const stopTask = async () => {
    await axios.patch(`/api/tasks/${currentTask?.id}/stop`);
    afterStopTask();
  };

  useEffect(() => {
    const tasksDurationInSeconds = tasks.reduce((duration, task) => {
      const startTime = new Date(task.startTime).getTime();
      const endTime = task.endTime
        ? new Date(task.endTime).getTime()
        : Date.now();
      const taskDuration = (endTime - startTime) / 1000;
      return duration + taskDuration;
    }, 0);
    setTasksDuration(tasksDurationInSeconds);
    if (!currentTask) return;
    const tasksDurationInterval = setInterval(() => {
      setTasksDuration((prevDuration) => prevDuration + 1);
    }, 1000);
    return () => clearInterval(tasksDurationInterval);
  }, [tasks, currentTask]);

  useEffect(() => {
    axios.get("/api/tasks/descriptions").then((r) => {
      setDescriptions(
        r.data.map((description: string) => ({
          label: description,
          value: description,
        }))
      );
    });
  }, []);

  return (
    <>
      <CreatableSelect
        options={descriptions}
        onChange={(selectedDescription) =>
          setTaskDescription(selectedDescription?.value || "")
        }
        onCreateOption={(newDescription) => {
          setDescriptions([
            { label: newDescription, value: newDescription },
            ...descriptions,
          ]);
          setTaskDescription(newDescription);
        }}
        value={
          currentTask?.description || taskDescription
            ? {
                label: currentTask?.description || taskDescription,
                value: currentTask?.description || taskDescription,
              }
            : null
        }
      />
      <div className="text-4xl font-bold text-center my-4">
        {secondsToTime(tasksDuration)}
      </div>
      <div className="flex gap-2 justify-center">
        <Button className="w-1/2" onClick={createTask} disabled={!!currentTask}>
          <Play className="w-5 h-5 mr-2" /> Iniciar
        </Button>
        <Button
          className="w-1/2"
          variant="destructive"
          onClick={stopTask}
          disabled={!currentTask}
        >
          <Square className="w-5 h-5 mr-2" /> Parar
        </Button>
      </div>
    </>
  );
}
