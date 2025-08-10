import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="w-full py-5 px-10 flex justify-between items-center">
        <div>
          <Link href="/" className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Agendamientos</h1>
            <Badge variant="secondary">Proyecto Portfolio</Badge>
          </Link>
        </div>

        <div>
          <Button variant="outline">
            <MessageCircle className="mr-2 w-4 h-4" />
            Feedback
          </Button>
        </div>
      </header>

      <main className="flex-grow p-10">
        {children}
      </main>
    </>
  );
}