import { getSubscribers } from "./actions/subscribers-actions";
import { SubscriberTable } from "./components/subscriber-table";

export default async function SubscribersPage() {
  const subscribers = await getSubscribers();

  return (
    <div dir="rtl" className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">مشتركو العملاء <span className="text-base font-bold tabular-nums text-muted-foreground">{subscribers.length}</span></h1>
          <p className="text-muted-foreground mt-1">من اشترك في نشرة عميل من صفحته أو مقالاته — لكل عميل مشتركوه. نشرة مدونتي العامة منفصلة وما لها صفحة بعد.</p>
        </div>
      </div>
      <SubscriberTable subscribers={subscribers} />
    </div>
  );
}
