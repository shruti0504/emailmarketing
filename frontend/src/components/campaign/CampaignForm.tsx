"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createCampaign } from "@/lib/campaigns.api";
import { getAudiences } from "@/lib/audiences.api";
import { getContacts } from "@/lib/contacts.api";
import { Audience } from "@/types/audience";
import { Contact } from "@/types/contact";
import Badge from "../ui/badge/Badge";

interface CampaignFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

type RecipientMode = "audience" | "paste";
type SendTiming = "now" | "later";

interface ParsedRecipient {
  raw: string;
  matchedContact?: Contact;
}

export default function CampaignForm({
  onCancel,
  onSuccess,
}: CampaignFormProps) {
  // Core form fields
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Target selection
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("audience");
  const [selectedAudienceId, setSelectedAudienceId] = useState("");
  const [selectedTags, setSelectedTags] = useState("");
  const [pastedRecipientsText, setPastedRecipientsText] = useState("");

  // Timing
  const [sendTiming, setSendTiming] = useState<SendTiming>("now");
  const [scheduledAt, setScheduledAt] = useState("");

  // Data state
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  // Real-time recipient inspector for pasted text
  const parsedRecipients = useMemo<ParsedRecipient[]>(() => {
    if (!pastedRecipientsText.trim()) return [];

    const rawList = pastedRecipientsText
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    // Remove duplicates
    const uniqueRawList = Array.from(new Set(rawList));

    return uniqueRawList.map((raw) => {
      const cleanRaw = raw.toLowerCase();

      // Try matching by email first, then phone
      const matchedContact = contacts.find((contact) => {
        const contactEmail = (contact.email || "").toLowerCase();
        const contactPhone = (contact.phone || "").replace(/\D/g, "");
        const cleanRawPhone = raw.replace(/\D/g, "");

        if (contactEmail && contactEmail === cleanRaw) {
          return true;
        }
        if (
          cleanRawPhone.length > 5 &&
          contactPhone &&
          (contactPhone === cleanRawPhone || contactPhone.endsWith(cleanRawPhone))
        ) {
          return true;
        }
        return false;
      });

      return {
        raw,
        matchedContact,
      };
    });
  }, [pastedRecipientsText, contacts]);

  const matchedCount = useMemo(
    () => parsedRecipients.filter((r) => r.matchedContact).length,
    [parsedRecipients]
  );
  const unmatchedCount = useMemo(
    () => parsedRecipients.filter((r) => !r.matchedContact).length,
    [parsedRecipients]
  );

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

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setSubmissionResult(null);

      if (!name.trim()) {
        setError("Campaign name is required.");
        setLoading(false);
        return;
      }
      if (!subject.trim()) {
        setError("Email subject is required.");
        setLoading(false);
        return;
      }
      if (!body.trim()) {
        setError("Email body content is required.");
        setLoading(false);
        return;
      }

      // Build payload
      const tagsArray = selectedTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      let emailsList: string[] = [];

      if (recipientMode === "paste") {
        // Collect emails from parsed recipients
        emailsList = parsedRecipients.map((item) => {
          if (item.matchedContact && item.matchedContact.email) {
            return item.matchedContact.email;
          }
          return item.raw;
        });

        if (emailsList.length === 0) {
          setError("Please enter at least one recipient email or phone number.");
          setLoading(false);
          return;
        }
      } else {
        if (!selectedAudienceId && tagsArray.length === 0) {
          setError("Please select an audience or enter at least one tag.");
          setLoading(false);
          return;
        }
      }

      let formattedScheduledAt: string | undefined = undefined;
      if (sendTiming === "later") {
        if (!scheduledAt) {
          setError("Please specify date and time for scheduled send.");
          setLoading(false);
          return;
        }
        formattedScheduledAt = new Date(scheduledAt).toISOString();
      }

      const payload = {
        name: name.trim(),
        subject: subject.trim(),
        body: body.trim(),
        audienceId: recipientMode === "audience" && selectedAudienceId ? selectedAudienceId : undefined,
        tags: recipientMode === "audience" && tagsArray.length > 0 ? tagsArray : undefined,
        emails: recipientMode === "paste" ? emailsList : undefined,
        scheduledAt: formattedScheduledAt,
      };

      const result = await createCampaign(payload);

      setSubmissionResult({
        matchedRecipients: result.matchedRecipients,
        unmatched: result.unmatched,
      });

      setSuccess(
        sendTiming === "later"
          ? "Campaign scheduled successfully! It will fire at the designated time via Redis queue."
          : "Campaign created and sending initiated!"
      );

      setTimeout(() => {
        onSuccess?.();
      }, 1800);
    } catch (err: any) {
      console.error("Campaign creation error:", err);
      setError(
        err.response?.data?.message || "Failed to create campaign. Please check inputs."
      );
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
          Design your campaign, select target recipients, and schedule or send immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          {/* Notifications */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400 space-y-1">
              <div className="font-semibold">{success}</div>
              {submissionResult && (
                <div className="text-xs">
                  Matched Recipients: {submissionResult.matchedRecipients} |
                  Unmatched Items: {submissionResult.unmatched.length}
                </div>
              )}
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
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Target Selection Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
              2. Choose Audience & Target Recipients
            </h3>

            {/* Mode Switcher */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-2">
              <button
                type="button"
                onClick={() => setRecipientMode("audience")}
                className={`pb-2 px-3 text-sm font-medium transition-colors border-b-2 ${
                  recipientMode === "audience"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                Option A: Select Saved Audience / Tag
              </button>

              <button
                type="button"
                onClick={() => setRecipientMode("paste")}
                className={`pb-2 px-3 text-sm font-medium transition-colors border-b-2 ${
                  recipientMode === "paste"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                Option B: Paste Email / Phone List
              </button>
            </div>

            {/* Option A: Audience / Tag Selection */}
            {recipientMode === "audience" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Audience Segment
                  </label>
                  <select
                    value={selectedAudienceId}
                    onChange={(e) => setSelectedAudienceId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">-- Choose an Audience --</option>
                    {audiences.map((aud) => (
                      <option key={aud.id} value={aud.id}>
                        {aud.name} {aud.count !== undefined ? `(${aud.count} contacts)` : ""}
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
                    placeholder="VIP, Lead, Newsletter"
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
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded hover:bg-blue-50 hover:text-blue-600"
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Option B: Direct Pasted Recipients with Live Matching & Inspection */}
            {recipientMode === "paste" && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Paste Emails or Phone Numbers (separated by lines or commas)
                  </label>
                  <textarea
                    value={pastedRecipientsText}
                    onChange={(e) => setPastedRecipientsText(e.target.value)}
                    rows={4}
                    placeholder={"john@example.com\n+1987654321\nsarah@company.org"}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Recipient Inspector / Sanity Check Box */}
                {parsedRecipients.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span>Contact Match Inspector</span>
                        <span className="text-gray-400">({parsedRecipients.length} total entered)</span>
                      </div>

                      <div className="flex gap-2">
                        <Badge color="success" size="sm">
                          {matchedCount} Matched
                        </Badge>
                        {unmatchedCount > 0 && (
                          <Badge color="warning" size="sm">
                            {unmatchedCount} Unmatched
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                      {parsedRecipients.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700/60"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-800 dark:text-gray-200">
                              {item.raw}
                            </span>
                          </div>

                          {item.matchedContact ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {item.matchedContact.name}
                              </span>
                              <Badge color="success" size="sm">
                                Matched Contact
                              </Badge>
                            </div>
                          ) : (
                            <Badge color="error" size="sm">
                              Unmatched / Not in Contacts
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                  Schedule for Later (Redis Queue)
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
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Processing Campaign..."
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
