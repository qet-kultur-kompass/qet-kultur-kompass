import { Suspense } from "react";
import { InviteFlow } from "@/components/InviteFlow";

export default function InvitePage({ params }: { params: { token: string } }) {
  // Suspense-Grenze nötig, da InviteFlow useSearchParams() nutzt (für
  // "?scope=" / "?new=1" – direkter Einstieg aus der Testübersicht/dem
  // Dashboard, siehe InviteFlow.tsx), sonst schlägt der Production-Build fehl.
  return (
    <Suspense fallback={null}>
      <InviteFlow token={params.token} />
    </Suspense>
  );
}
