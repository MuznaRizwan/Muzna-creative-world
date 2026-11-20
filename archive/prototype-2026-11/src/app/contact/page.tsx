import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen p-6 sm:p-12 md:p-24 max-w-3xl mx-auto space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Contact Me</h1>
        <p className="text-neutral-400 text-lg leading-relaxed">
          Have an inquiry, university evaluation feedback, or collaboration opportunity?
          Reach out through the form below or interact with the AI assistant.
        </p>
      </div>

      <form className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300" htmlFor="name">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Jane Doe"
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300" htmlFor="email">
            Your Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="jane@example.com"
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Write your message here..."
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors resize-none"
          />
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
          Send Message
        </button>
      </form>
    </div>
  );
}
