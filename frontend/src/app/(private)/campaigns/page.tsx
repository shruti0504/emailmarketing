"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CampaignTable from "@/components/campaign/CampaignTable";
import CampaignForm from "@/components/campaign/CampaignForm";

export default function CampaignsPage() {
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    setShowForm(true);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Email Campaigns" />

      <div className="space-y-6">
        {showForm ? (
          <CampaignForm
            onCancel={() => {
              setShowForm(false);
            }}
            onSuccess={() => {
              setShowForm(false);
            }}
          />
        ) : (
          <ComponentCard title="Campaign Management">
            <CampaignTable onCreateClick={handleCreate} />
          </ComponentCard>
        )}
      </div>
    </div>
  );
}
