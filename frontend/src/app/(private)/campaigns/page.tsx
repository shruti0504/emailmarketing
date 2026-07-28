"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CampaignTable from "@/components/campaign/CampaignTable";
import CampaignForm from "@/components/campaign/CampaignForm";

export default function CampaignsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div>
      <PageBreadcrumb pageTitle="Email Campaigns" />

      <div className="space-y-6">
        {showCreateForm ? (
          <CampaignForm
            onCancel={() => setShowCreateForm(false)}
            onSuccess={() => setShowCreateForm(false)}
          />
        ) : (
          <ComponentCard title="Campaign Management">
            <CampaignTable onCreateClick={() => setShowCreateForm(true)} />
          </ComponentCard>
        )}
      </div>
    </div>
  );
}
