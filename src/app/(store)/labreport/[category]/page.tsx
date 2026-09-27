import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  LabReports,
  REPORT_CATEGORIES,
  reportLabels,
  type ReportCategory,
} from "@/components/lab-reports/LabReports";
import { buildMetadata } from "@/components/seo/metadata";
import { LAB_REPORTS_PATH } from "@/config/routes";

export const revalidate = 300;

type Props = { params: Promise<{ category: string }> };

function validCategory(category: string): category is ReportCategory {
  return REPORT_CATEGORIES.some((key) => key === category);
}

export function generateStaticParams() {
  return REPORT_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!validCategory(category)) notFound();
  return buildMetadata({
    title: `${reportLabels[category]} Lab Reports & Accreditation`,
    description: `View available ${reportLabels[category].toLowerCase()} laboratory reports and Vara Organics batch records.`,
    path: `${LAB_REPORTS_PATH.slice(1)}/${category}`,
  });
}

export default async function LabReportCategoryPage({ params }: Props) {
  const { category } = await params;
  if (!validCategory(category)) notFound();
  return LabReports({ category });
}
