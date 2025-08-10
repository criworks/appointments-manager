import React from 'react';
import { Button } from "@/components/ui/button"
import { MessageCircle } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-grow w-full p-10 space-y-10">
        {children}
      </main>
      <footer className="w-full py-5 px-10 text-gray-500 flex justify-between items-center">
        <p>© un diseño de <a href="https://string.cri.run" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@cri.string</a></p>
        <Button variant="outline">
          <MessageCircle className="mr-2 w-4 h-4" />
          Feedback
        </Button>
      </footer>
    </>
  );
}
