import Overview from "@/components/Overview";
import RecentFiles from "@/components/RecentFiles";

export default function page() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-2xl">
        <div className="lg:col-span-2">
          <Overview />
        </div>
        <div className="lg:col-span-1">
          <RecentFiles />
        </div>
      </div>
    </div>
  );
}
