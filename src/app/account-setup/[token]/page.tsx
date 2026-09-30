import { AccountSetupForm } from "@/components/AccountSetupForm";

export const metadata = {
  title: "Konto einrichten – QET Kultur-Kompass",
};

export default function AccountSetupPage({ params }: { params: { token: string } }) {
  return <AccountSetupForm token={params.token} />;
}
