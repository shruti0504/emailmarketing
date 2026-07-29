"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createCampaign } from "@/lib/campaigns.api";
import { getAudiences } from "@/lib/audiences.api";
import { getContacts } from "@/lib/contacts.api";
import { Audience } from "@/types/audience";
import { Contact } from "@/types/contact";
import AlertNotification from "../ui/alert/AlertNotification";

interface CampaignFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

type SendTiming = "now" | "later";

export default function CampaignForm({
  onCancel,
  onSuccess,
}: CampaignFormProps) {
  // Core form fields
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Attachment state
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentContent, setAttachmentContent] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAttachmentError(null);
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAttachmentError("Attachment size must be under 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.includes(",") ? result.split(",")[1] : result;
      setAttachmentName(file.name);
      setAttachmentContent(base64Data);
    };
    reader.onerror = () => {
      setAttachmentError("Failed to read attachment file.");
    };
    reader.readAsDataURL(file);
  };

  // Target selection
  const [selectedAudienceId, setSelectedAudienceId] = useState("");
  const [selectedTags, setSelectedTags] = useState("");

  // Timing
  const [sendTiming, setSendTiming] = useState<SendTiming>("now");
  const [scheduledAt, setScheduledAt] = useState("");

  // Data state
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form submission state
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const [submissionResult, setSubmissionResult] = useState<{
    matchedRecipients: number;
    unmatched: string[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [audData, contactData] = await Promise.all([
          getAudiences().catch(() => []),
          getContacts().catch(() => []),
        ]);
        setAudiences(audData);
        setContacts(contactData);
      } catch (err: any) {
        console.error("Failed to load campaign form reference data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Available tags extracted from all saved contacts
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach((c) => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [contacts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertInfo(null);
    setSubmissionResult(null);

    // Client-side validations
    if (!name.trim()) {
      setAlertInfo({
        variant: "error",
        title: "Validation Error",
        message: "Campaign name is required.",
      });
      return;
    }

    if (!subject.trim()) {
      setAlertInfo({
        variant: "error",
        title: "Validation Error",
        message: "Email subject line is required.",
      });
      return;
    }

    if (!body.trim()) {
      setAlertInfo({
        variant: "error",
        title: "Validation Error",
        message: "Email message body content is required.",
      });
      return;
    }

    const tagsArray = selectedTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!selectedAudienceId && tagsArray.length === 0) {
      setAlertInfo({
        variant: "error",
        title: "Validation Error",
        message: "Please select an audience segment or specify at least one contact tag.",
      });
      return;
    }

    let formattedScheduledAt: string | undefined = undefined;
    if (sendTiming === "later") {
      if (!scheduledAt) {
        setAlertInfo({
          variant: "error",
          title: "Validation Error",
          message: "Please specify date and time for scheduled send.",
        });
        return;
      }
      if (new Date(scheduledAt).getTime() <= Date.now()) {
        setAlertInfo({
          variant: "error",
          title: "Validation Error",
          message: "Scheduled send date must be in the future.",
        });
        return;
      }
      formattedScheduledAt = new Date(scheduledAt).toISOString();
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        subject: subject.trim(),
        body: body.trim(),
        audienceId: selectedAudienceId || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        scheduledAt: formattedScheduledAt,
        attachmentName: attachmentName || undefined,
        attachmentContent: attachmentContent || undefined,
      };

      const result = await createCampaign(payload);
      
      setSubmissionResult({
        matchedRecipients: result.matchedRecipients,
        unmatched: result.unmatched,
      });

      setAlertInfo({
        variant: "success",
        title: "Campaign Created",
        message:
          sendTiming === "later"
            ? "Campaign scheduled successfully! It will fire at the designated time."
            : `Campaign created and sending initiated to ${result.matchedRecipients} recipient(s)!`,
      });

      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      console.error("Campaign creation error:", err);
      setAlertInfo({
        variant: "error",
        title: "Creation Failed",
        message: err.response?.data?.message || err.message || "Failed to create campaign. Please check inputs.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Form Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Create New Campaign
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Design your email campaign, select target audience segments, and schedule or launch immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          {/* Alert Notifications */}
          {alertInfo && (
            <AlertNotification
              variant={alertInfo.variant}
              title={alertInfo.title}
              message={alertInfo.message}
              onClose={() => setAlertInfo(null)}
              durationMs={3000}
            />
          )}

          {submissionResult && (
            <div className="rounded-lg bg-blue-50 p-3.5 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-medium">
              Matched Recipients: <span className="font-bold">{submissionResult.matchedRecipients}</span>
            </div>
          )}

          {/* Campaign Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
              1. Campaign Content
            </h3>

            {/* Campaign Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer Special Promotion 2026"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Email Subject */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Subject Line <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Exclusive Offer Inside! Don't Miss Out"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Write your email content here..."
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-sans"
              />
            </div>

            {/* File Attachment (PDF / Document) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Attach File (PDF, Document, max 5MB) <span className="text-xs text-gray-400 font-normal">(Optional Extra Credit)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/40 dark:file:text-blue-300 cursor-pointer"
                />
                {attachmentName && (
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentName(null);
                      setAttachmentContent(null);
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              {attachmentName && (
                <p className="mt-1 text-xs text-green-600 font-medium dark:text-green-400">
                  📎 Attached: {attachmentName}
                </p>
              )}
              {attachmentError && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {attachmentError}
                </p>
              )}
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Target Selection Section (Option A strictly) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
              2. Target Audience & Segment Selection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Saved Audience Segment
                </label>
                <select
                  value={selectedAudienceId}
                  onChange={(e) => setSelectedAudienceId(e.target.value)}
                  disabled={loadingData}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">-- Choose an Audience --</option>
                  {audiences.map((aud) => (
                    <option key={aud.id} value={aud.id}>
                      {aud.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Or Filter by Contact Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={selectedTags}
                  onChange={(e) => setSelectedTags(e.target.value)}
                  placeholder="e.g. VIP, Lead, Newsletter"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                {availableTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-gray-400">Available tags:</span>
                    {availableTags.slice(0, 6).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const current = selectedTags
                            ? selectedTags.split(",").map((t) => t.trim())
                            : [];
                          if (!current.includes(tag)) {
                            setSelectedTags([...current, tag].join(", "));
                          }
                        }}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Schedule / Timing Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
              3. Sending Timing & Schedule
            </h3>

            <div className="flex flex-wrap gap-6 items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="timing"
                  checked={sendTiming === "now"}
                  onChange={() => setSendTiming("now")}
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Send Immediately
                </span>
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="timing"
                  checked={sendTiming === "later"}
                  onChange={() => setSendTiming("later")}
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Schedule for Later
                </span>
              </label>
            </div>

            {sendTiming === "later" && (
              <div className="max-w-xs pt-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required={sendTiming === "later"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
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
              disabled={loading || loadingData}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading
                ? "Launching..."
                : sendTiming === "later"
                ? "Schedule Campaign"
                : "Send Campaign Now"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
