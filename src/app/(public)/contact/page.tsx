import Link from "next/link";
import { Building2, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">We&apos;re here to help. Reach out through any of the channels below.</p>
        <div className="space-y-6">
          {[
            { icon: Mail, label: "Email", value: "support@nexabank.com" },
            { icon: Phone, label: "Phone", value: "+1 (800) 123-4567" },
            { icon: MapPin, label: "Address", value: "123 Banking Ave, Financial District, NY 10004" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{item.label}</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
