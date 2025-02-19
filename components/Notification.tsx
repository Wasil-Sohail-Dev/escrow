"use client";

import { messaging } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";
import { useEffect } from "react";

export default function Notifications() {
  return (
    <div>
      <h1>Real-time Notifications</h1>
    </div>
  );
}
