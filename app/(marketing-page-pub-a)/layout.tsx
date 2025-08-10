import React from 'react';
import { Button } from "@/components/ui/button"
import { MessageCircle } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="grow w-full max-w-screen-xl mx-auto flex flex-col gap-20">
        {children}
      </main>
      <footer className="w-full max-w-screen-xl mx-auto py-5 text-gray-500 flex justify-between items-center">
        <p>© yo lo hice <a href="https://cri.works" target="_blank" rel="noopener noreferrer" className="text-black font-medium hover:underline">@cri.works</a></p>
        <Button variant="outline">
          <MessageCircle className="mr-2 w-4 h-4" />
          Feedback
        </Button>
      </footer>
    </>
  );
}
