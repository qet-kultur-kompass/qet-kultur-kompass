import { SurveyFlow } from "@/components/SurveyFlow";

export default function SurveyPage({ params }: { params: { token: string } }) {
  return <SurveyFlow token={params.token} />;
}
