import Overview from "@/components/Overview";
import RecentFiles from "@/components/RecentFiles";

export default function page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Overview />
      </div>
      <div className="lg:col-span-1">
        <RecentFiles />
      </div>
    </div>
  );
}
