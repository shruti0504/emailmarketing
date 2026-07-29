"use client";

import { createContact, updateContact } from "@/lib/contacts.api";
import { Contact } from "@/types/contact";
import React, { useEffect, useState } from "react";
import AlertNotification from "../ui/alert/AlertNotification";
import Badge from "../ui/badge/Badge";

interface ContactFormProps {
  onCancel: () => void;
  contact?: Contact | null;
  onSuccess?: () => void;
}

export default function ContactForm({
  onCancel,
  contact,
  onSuccess,
}: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Populate form when editing or resetting
  useEffect(() => {
    if (contact) {
      setName(contact.name || "");
      setEmail(contact.email || "");
      setPhone(contact.phone || "");
      setCity(contact.city || "");
      
      // Ensure tags array is correctly loaded
      if (Array.isArray(contact.tags)) {
        setTags(contact.tags);
      } else {
        setTags([]);
      }
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setCity("");
      setTags([]);
    }
    setTagInput("");
    setFieldErrors({});
    setAlertInfo(null);
  }, [contact]);

  const handleAddTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter" && e.key !== ",") return;
    if (e) e.preventDefault();

    const clean = tagInput.replace(/,/g, "").trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Contact name is required.";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
    }

    if (phone.trim()) {
      const phoneRegex = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
      if (!phoneRegex.test(phone.trim()) || phone.trim().length < 7) {
        errors.phone = "Please enter a valid phone number (at least 7 digits).";
      }
    }

    if (!email.trim() && !phone.trim()) {
      errors.general = "Please provide at least an email address or phone number.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlertInfo(null);

    // Auto-add any pending tag text before submission
    let currentTags = [...tags];
    if (tagInput.trim()) {
      const clean = tagInput.replace(/,/g, "").trim();
      if (clean && !currentTags.includes(clean)) {
        currentTags.push(clean);
        setTags(currentTags);
        setTagInput("");
      }
    }

    if (!validateForm()) {
      setAlertInfo({
        variant: "error",
        title: "Validation Error",
        message: fieldErrors.general || "Please fix the validation errors below.",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        tags: currentTags,
      };

      if (contact) {
        await updateContact(contact.id, payload);
        setAlertInfo({
          variant: "success",
          title: "Success",
          message: "Contact updated successfully.",
        });
      } else {
        await createContact(payload);
        setAlertInfo({
          variant: "success",
          title: "Success",
          message: "Contact created successfully.",
        });
      }

      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (error: any) {
      console.error("Contact save failed:", error);
      setAlertInfo({
        variant: "error",
        title: "Save Failed",
        message: error.response?.data?.message || "Failed to save contact. Please check your inputs.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          {contact ? "Edit Contact" : "Create Contact"}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {contact
            ? "Update contact details and manage tag segments."
            : "Add a new subscriber or contact to your workspace."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {alertInfo && (
            <div className="mb-4">
              <AlertNotification
                variant={alertInfo.variant}
                title={alertInfo.title}
                message={alertInfo.message}
                onClose={() => setAlertInfo(null)}
                durationMs={2500}
              />
            </div>
          )}

          {fieldErrors.general && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {fieldErrors.general}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. Sarah Connor"
                required
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
                  fieldErrors.name
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="e.g. sarah@example.com"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
                  fieldErrors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="e.g. +19876543210"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
                  fieldErrors.phone
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
                }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                City / Location
              </label>
              <input
                type="text"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Tags */}
            <div className="xl:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Tags
              </label>

              {/* Tag Badges Chip Container */}
              <div className="mb-3 flex flex-wrap gap-2 min-h-[36px] items-center p-2 rounded-lg border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/50">
                {tags.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">No tags assigned yet</span>
                ) : (
                  tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-white font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag name and press Enter (e.g. VIP, Customer)"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  + Add Tag
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Press Enter or comma to add multiple tags.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading
                ? "Saving..."
                : contact
                ? "Update Contact"
                : "Create Contact"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}