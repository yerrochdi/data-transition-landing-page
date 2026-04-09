import { redirect } from "next/navigation";
import { getTaskWithContext } from "@/lib/journey/actions";
import { TaskSessionView } from "./_components/task-session-view";

export default async function TaskSessionPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = await getTaskWithContext(taskId);

  if (!task) {
    redirect("/journey");
  }

  if (task.taskStatus === "LOCKED") {
    redirect("/journey");
  }

  return <TaskSessionView task={task} />;
}
