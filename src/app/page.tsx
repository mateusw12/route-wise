import { MapDashboard } from "@/components/map/MapDashboard";
import { authOptions } from "@/libs/auth/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return <MapDashboard />;
}
