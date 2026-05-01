import dynamic from "next/dynamic";

const MapDashboard = dynamic(
  () => import("@/components/map/MapDashboard").then((module) => module.MapDashboard),
  { ssr: false },
);

export default function Home() {
  return <MapDashboard />;
}
