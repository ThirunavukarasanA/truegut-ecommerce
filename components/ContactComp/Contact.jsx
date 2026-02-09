"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdAccessTime,
  MdSend,
} from "react-icons/md";
import Navbar from "@/components/Home/Navbar";
import MobileBottomNav from "@/components/Home/MobileBottomNav";
import Footer from "@/components/Home/Footer";
import toast from "react-hot-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (!/^[a-zA-Z\s]*$/.test(formData.name)) {
      newErrors.name = "Only alphabets allowed";
    }

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    else if (!/^[a-zA-Z0-9\s]*$/.test(formData.subject)) {
      newErrors.subject = "Only alphanumeric allowed";
    }

    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (!/^[a-zA-Z0-9\s]*$/.test(formData.message)) {
      newErrors.message = "Only alphanumeric allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Validation logic on change (prevent invalid input)
    if (name === "name") {
      // Allow only alphabets and spaces
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "subject" || name === "message") {
      // Allow alphabets, numbers and spaces (alphanumeric)
      if (/^[a-zA-Z0-9\s]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      // For email and other fields, just update
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Form submitted successfully!");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setErrors({});
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full pt-20">
        {/* Simple Hero */}
        <div className="bg-[#023120] py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg font-light">
            Have questions about our products or just want to say hello? We'd
            loved to hear from you.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-10">
              <div>
                <h4 className="text-secondary font-bold tracking-widest uppercase text-sm mb-2">
                  Contact Us
                </h4>
                <h2 className="text-3xl md:text-4xl font-bold text-font-title mb-6">
                  We're here to help
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Whether you're curious about our fermentation process, need
                  help with an order, or want to partner with us, reach out!
                </p>
              </div>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                    <MdLocationOn size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-font-title mb-1">Visit Us</h3>
                    <p className="text-gray-600">
                      123 Fermentaa Lane, <br />
                      Organic Valley, CA 90210
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <MdEmail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-font-title mb-1">Email Us</h3>
                    <p className="text-gray-600">hello@fermentaa.com</p>
                    <p className="text-gray-500 text-sm">
                      We reply within 24 hours.
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                    <MdPhone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-font-title mb-1">Call Us</h3>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-gray-500 text-sm">
                      Mon-Fri, 9am - 6pm EST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className={`w-full bg-white border ${
                        errors.name ? "border-red-500" : "border-gray-200"
                      } rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-medium`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs ml-1">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Email
                    </label>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`w-full bg-white border ${
                        errors.email ? "border-red-500" : "border-gray-200"
                      } rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-medium`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs ml-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className={`w-full bg-white border ${
                      errors.subject ? "border-red-500" : "border-gray-200"
                    } rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-medium`}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-xs ml-1">{errors.subject}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more..."
                    className={`w-full bg-white border ${
                      errors.message ? "border-red-500" : "border-gray-200"
                    } rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-medium`}
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-xs ml-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary text-white font-bold py-4 rounded-xl hover:bg-[#3d7a30] transition-transform active:scale-[0.98] shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Message"} <MdSend />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="h-[400px] w-full bg-gray-200 relative grayscale hover:grayscale-0 transition-all duration-700">
          {/* Integrate Google Maps Embed Here */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <span className="bg-white/80 px-6 py-3 rounded-full shadow-sm backdrop-blur-sm">
              Map Location Placeholder
            </span>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
