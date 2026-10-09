import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { profile } from '../data/portfolio';
import { CONTACT_FORM_ENDPOINT } from '../config';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email';
    }
    if (!formData.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    if (CONTACT_FORM_ENDPOINT) {
      try {
        await fetch(CONTACT_FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } catch (err) {
        console.error('Contact submit error:', err);
      }
    } else {
      // Simulate submission delay
      await new Promise((res) => setTimeout(res, 800));
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="relative w-full py-24 sm:py-32 md:py-40 bg-black overflow-hidden">
      {/* Background radial spotlight */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] radial-spotlight pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-16 sm:mb-20">
          <div className="mb-4">
            <span className="pill-label">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AVAILABLE FOR OPPORTUNITIES
            </span>
          </div>
          <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
            Let's Work Together<span className="text-neutral-600">.</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 max-w-xl font-light mt-4 leading-relaxed">
            Interested in starting a project, collaborating on AI systems, or discussing engineering opportunities? Drop me a message.
          </p>
        </div>

        {/* Two-Column Layout: Contact Info + Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
            <div className="space-y-6">
              {/* Email Link */}
              <a
                href={`mailto:${profile.email}`}
                className="group glass-card p-6 flex items-center space-x-5 hover:border-white/25 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:border-white/30 transition-all">
                  <Mail className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <p className="text-[11px] font-mono tracking-widest text-neutral-500 uppercase">
                    EMAIL ME DIRECTLY
                  </p>
                  <p className="text-base sm:text-lg font-heading font-semibold text-white group-hover:text-white mt-0.5">
                    {profile.email}
                  </p>
                </div>
              </a>

              {/* Phone Link */}
              <a
                href={`tel:${profile.phone}`}
                className="group glass-card p-6 flex items-center space-x-5 hover:border-white/25 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:border-white/30 transition-all">
                  <Phone className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <p className="text-[11px] font-mono tracking-widest text-neutral-500 uppercase">
                    DIRECT CALL / WHATSAPP
                  </p>
                  <p className="text-base sm:text-lg font-heading font-semibold text-white group-hover:text-white mt-0.5">
                    +91 {profile.phone}
                  </p>
                </div>
              </a>

              {/* Location Card */}
              <div className="glass-card p-6 flex items-center space-x-5 border-white/[0.06]">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-neutral-400">
                  <MapPin className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <p className="text-[11px] font-mono tracking-widest text-neutral-500 uppercase">
                    LOCATION BASE
                  </p>
                  <p className="text-base font-medium text-neutral-300 mt-0.5">
                    {profile.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick response note */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-500 leading-relaxed font-mono">
              <span className="text-white font-medium">Notice:</span> Typically responding within 24 hours. For urgent engineering or technical queries, reach out via direct phone or WhatsApp.
            </div>
          </div>

          {/* Right Column: Glass Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 sm:p-12 relative overflow-hidden border-white/10">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Message Sent Successfully
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-400 max-w-md font-light">
                    Thank you for reaching out! I've received your inquiry and will be in touch shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono tracking-widest uppercase text-neutral-400 mb-2">
                      YOUR NAME *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className={`w-full px-5 py-4 rounded-xl bg-white/[0.03] border text-white placeholder-neutral-600 focus:outline-none focus:bg-white/[0.06] transition-all text-sm ${
                        errors.name ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-white/40'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400 mt-1.5 font-mono">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono tracking-widest uppercase text-neutral-400 mb-2">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className={`w-full px-5 py-4 rounded-xl bg-white/[0.03] border text-white placeholder-neutral-600 focus:outline-none focus:bg-white/[0.06] transition-all text-sm ${
                        errors.email ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-white/40'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1.5 font-mono">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono tracking-widest uppercase text-neutral-400 mb-2">
                      MESSAGE *
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your project, timeline, or inquiry..."
                      className={`w-full px-5 py-4 rounded-xl bg-white/[0.03] border text-white placeholder-neutral-600 focus:outline-none focus:bg-white/[0.06] transition-all text-sm resize-none ${
                        errors.message ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-white/40'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-xs text-red-400 mt-1.5 font-mono">{errors.message}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-black bg-white hover:bg-neutral-200 transition-all rounded-full shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>SENDING...</span>
                      ) : (
                        <>
                          <span>SUBMIT INQUIRY</span>
                          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
