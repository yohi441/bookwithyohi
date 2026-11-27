"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function TimezoneDisplay() {
  const timezone = useSyncExternalStore<string | null>(subscribe, getTimezone, () => null);

  return (
    <p className="mt-8 text-xs text-zinc-500 dark:text-zinc-400">
      {timezone ? `Times will be shown in your timezone: ${timezone}` : "Detecting your timezone…"}
    </p>
  );
}
