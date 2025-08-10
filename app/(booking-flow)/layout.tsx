import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/catalogue" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded"></div>
            <span className="text-xl font-semibold">CalClone</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/catalogue">Volver al catálogo</Link>
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}