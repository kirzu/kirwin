import AdminLoginForm from "@/components/admin-login-form";

export default function AdminLoginPage({
  params,
}: {
  params: { locale: string };
}) {
  return <AdminLoginForm locale={params.locale} />;
}
