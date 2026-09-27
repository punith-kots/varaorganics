import { redirect } from "next/navigation";
import { LAB_REPORTS_PATH } from "@/config/routes";

export default function LabReportPage() {
  redirect(`${LAB_REPORTS_PATH}/ghee`);
}
