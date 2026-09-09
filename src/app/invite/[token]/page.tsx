import { InviteFlow } from "@/components/InviteFlow";

export default function InvitePage({ params }: { params: { token: string } }) {
  return <InviteFlow token={params.token} />;
}
