export default function Status({ status }) {
  if (status === "error" || !status) {
    <div className="w-3 h-3  bg-theme-500/10 dark:bg-theme-900 rounded-full border-solid border-2 border-theme-200 dark:border-theme-900" />;
  }

  if (status?.includes("running")) {
    return (
      <div className="w-3 h-3  bg-theme-500/10 dark:bg-theme-900 rounded-full border-solid border-2 border-theme-200 dark:border-theme-900" />
    );
  }

  if (status === "unhealthy") {
    return (
      <div className="`w-3 h-3  bg-rose-500/80 rounded-full border-solid border-2 border-theme-200 dark:border-theme-900" />
    );
  }
  if (status === "healthy" || status === "running" || status === "ok") {
    return (
      <div className="w-3 h-3  bg-emerald-500 rounded-full border-solid border-2 border-theme-200 dark:border-theme-900" />
    );
  }

  if (status === "not found" || status === "exited" || status.startsWith("partial")) {
    return (
      <div className="w-3 h-3  bg-rose-500/80 rounded-full border-solid border-2 border-theme-200 dark:border-theme-900" />
    );
  }

  return (
    <div className="w-3 h-3  bg-theme-500/10 dark:bg-theme-900 rounded-full border-solid border-2 border-theme-200 dark:border-theme-900" />
  );
}
