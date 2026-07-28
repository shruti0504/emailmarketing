"use client";

import {
  createContact,
  updateContact,
} from "@/lib/contacts.api";
import { Contact } from "@/types/contact";
import React, { useEffect, useState } from "react";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    tags: "",
    company: "",
    designation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        city: contact.city || "",

        tags: contact.tags?.join(", ") || "",

        company:
          contact.customFields?.company || "",

        designation:
          contact.customFields?.designation || "",
      });
    } else {
      // Reset form for create
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        tags: "",
        company: "",
        designation: "",
      });
    }
  }, [contact]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const body = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,

        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        customFields: {
          company: formData.company,
          designation: formData.designation,
        },
      };

      if (contact) {
        // EDIT
        await updateContact(
          contact.id,
          body
        );

        setSuccess(
          "Contact updated successfully."
        );
      } else {
        // CREATE
        await createContact(body);

        setSuccess(
          "Contact created successfully."
        );
      }

      // Tell ContactTable to refresh
      onSuccess?.();

    } catch (error: any) {
      console.error(
        "Contact save failed:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save contact."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">

      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          {contact
            ? "Edit Contact"
            : "Create Contact"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Tags
              </label>

              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Customer, Premium"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Company */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Company
              </label>

              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Designation
              </label>

              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

          </div>

          <div className="mt-6 flex justify-end gap-3">

            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white"
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