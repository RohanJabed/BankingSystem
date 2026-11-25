import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="border-b border-gray-200 dark:border-gray-800 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100">NexaBank</span>
        </Link>
        <Link href="/"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">About NexaBank</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          NexaBank is a modern digital banking platform designed to make financial management simple, secure, and accessible for everyone.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Our platform supports individual customers, bank staff, and administrators with role-specific dashboards and tools. From fund transfers to loan management, NexaBank provides a complete banking experience.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Built with cutting-edge technology and bank-grade security, NexaBank is a simulated banking system for demonstration and educational purposes.
        </p>
      </div>
    </div>
  );
}
