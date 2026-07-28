"use client";

import React, { use } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CampaignAnalytics from "@/components/campaign/CampaignAnalytics";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignAnalyticsPage({ params }: PageProps) {
  const resolvedParams = use(params);

  return (
    <div>
      <PageBreadcrumb pageTitle="Campaign Analytics" />

      <div className="space-y-6">
        <CampaignAnalytics campaignId={resolvedParams.id} />
      </div>
    </div>
  );
}
