"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useState } from "react";
import Link from 'next/link';

export default function Home() {
  const [title, setTitle] = useState("");
  const handleCreateMeeting = async () => {
    if (!title.trim()) {
      alert("Please enter a meeting title.");
      return;
    }

    await fetch('http://localhost:3000/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    setTitle("");
    alert("Meeting created!");
  };

  return (
    <div className="text-center mt-16 md:mt-20">
      <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
        Transform Your Meetings
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
        From agenda creation to AI-powered follow-ups, MeetWise is the all-in-one platform to make every meeting count.
      </p>

      <div className="mt-10">
        <SignedOut>
          <Link href="/dashboard">
            <span className="px-8 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg cursor-pointer">
              Get Started for Free
            </span>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <span className="px-8 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg cursor-pointer">
              Go to Your Dashboard
            </span>
          </Link>
        </SignedIn>
      </div>
    </div>
  );
}