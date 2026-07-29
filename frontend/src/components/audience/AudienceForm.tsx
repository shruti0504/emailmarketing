"use client";

import { createAudience } from "@/lib/audiences.api";
import React, { useState } from "react";
import AlertNotification from "../ui/alert/AlertNotification";

interface AudienceFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function AudienceForm({
  onCancel,
  onSuccess,
}: AudienceFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    tags: "",
  });

  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

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
    setAlertInfo(null);

    // Validation
    if (!formData.name.trim()) {
      setAlertInfo({
        variant: "error",
        title: "Validation Error",
        message: "Audience name is required.",
      });
      return;
    }

    if (!formData.city.trim() && !formData.tags.trim()) {
      setAlertInfo({
        variant: "error",
        title: "Validation Error",
        message: "Please provide at least a city or tags to define the audience segment.",
      });
      return;
    }

    try {
      setLoading(true);

      const body = {
        name: formData.name.trim(),
        filterJson: {
          city: formData.city.trim() || undefined,

          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
      };

      await createAudience(body);

      setAlertInfo({
        variant: "success",
        title: "Success",
        message: "Audience created successfully.",
      });

      setFormData({
        name: "",
        city: "",
        tags: "",
      });

      setTimeout(() => {
        onSuccess?.();
      }, 1200);

    } catch (error: any) {
      console.error(
        "Create audience failed:",
        error
      );

      setAlertInfo({
        variant: "error",
        title: "Create Failed",
        message: error.response?.data?.message || "Failed to create audience.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">

      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Create Audience
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Define a segment of contacts by city, tags, or both.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">

          {/* Alert */}
          {alertInfo && (
            <AlertNotification
              variant={alertInfo.variant}
              title={alertInfo.title}
              message={alertInfo.message}
              onClose={() => setAlertInfo(null)}
              durationMs={2500}
            />
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* Audience Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Audience Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Mumbai Customers"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Mumbai"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Tags */}
            <div className="xl:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </label>

              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="customer, premium"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              <p className="mt-1 text-xs text-gray-500">
                Separate multiple tags with commas.
              </p>
            </div>

          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">

            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Audience"}
            </button>

          </div>

        </div>
      </form>
    </div>
  );
}