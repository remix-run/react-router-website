export function BrowserChrome({
  children,
  url = "https://example.com",
}: {
  children: React.ReactNode;
  url?: string;
}) {
  return (
    <div className="bg-gray-700 border border-gray-600 drop-shadow-lg rounded-xl overflow-hidden">
      <div className="pb-2 border-b border-gray-500">
        <div className="flex p-2">
          <WindowButton className="bg-red-400" />
          <WindowButton className="bg-yellow-400" />
          <WindowButton className="bg-green-300" />
        </div>
        <div className="flex items-center px-2">
          <IconArrowLeft />
          <IconArrowLeft className="rotate-180 ml-3" />
          <IconRefresh className="rotate ml-3" />
          <div className="ml-3 bg-gray-800 rounded-full px-4 py-1 w-full text-sm">
            {url}
          </div>
        </div>
      </div>
      <div className="text-xs">{children}</div>
    </div>
  );
}

function WindowButton({ className }: { className: string }) {
  return <div className={`rounded-full mr-2 h-3 w-3 ${className}`} />;
}

function IconArrowLeft({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  );
}

function IconRefresh({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9"
      />
    </svg>
  );
}

export function FastbooksApp({
  children,
  highlight,
}: {
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex ${
        highlight ? "relative z-10 ring-4 ring-orange-500" : ""
      }`}
    >
      <div className="p-4 border-r border-gray-500">
        <div className="px-2 pb-2 flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-400" />
          <div className="ml-1 font-light text-base">Fastbooks</div>
        </div>
        <div>
          <FastbookNavLink>Dashboard</FastbookNavLink>
          <FastbookNavLink>Accounts</FastbookNavLink>
          <FastbookNavLink active>Sales</FastbookNavLink>
          <FastbookNavLink>Expenses</FastbookNavLink>
          <FastbookNavLink>Reports</FastbookNavLink>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function FastbookNavLink({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`px-2 py-1 my-2 rounded-md font-medium text-sm ${
        active ? "bg-green-800 text-green-300" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function FastbooksSales({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="flex justify-between m-4">
        <SalesLink>Overview</SalesLink>
        <SalesLink>Subscriptions</SalesLink>
        <SalesLink active>Invoices</SalesLink>
        <SalesLink>Customers</SalesLink>
        <SalesLink>Deposits</SalesLink>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SalesLink({
  children,
  active,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`text-sm font-medium pr-4 last:pr-0 ${
        active ? "text-green-400" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function FastbooksInvoices({ children }: { children: React.ReactNode }) {
  let invoices = [
    {
      name: "Santa Monica",
      number: 1995,
      amount: "$10,800",
      due: -1,
    },
    {
      name: "Stankonia",
      number: 2000,
      amount: "$8,000",
      due: 0,
      active: true,
    },
    {
      name: "Ocean Avenue",
      number: 2003,
      amount: "$9,500",
      due: 8,
    },
    {
      name: "Tubthumper",
      number: 1997,
      amount: "$14,000",
      due: 10,
    },
    {
      name: "Wide Open Sp...",
      number: 1998,
      amount: "$4,600",
      due: false,
    },
  ];
  return (
    <div data-invoices>
      <div className="mt-4 mb-6 px-6">
        <div className="flex justify-between mb-1">
          <div className="text-gray-300">Overdue: $10,800</div>
          <div className="text-gray-300">Due soon: $62,000</div>
        </div>
        <div className="flex">
          <div className="h-4 bg-yellow-200 w-1/3" />
          <div className="h-4 flex-grow ml-1 bg-gray-300" />
        </div>
      </div>
      <div className="flex border-t border-gray-500">
        <div className="border-r border-gray-500">
          {invoices.map((invoice) => (
            <div
              key={invoice.number}
              className={`flex justify-between text-xs p-2 m-2 ${
                invoice.active ? "bg-green-800 rounded-md" : ""
              }`}
            >
              <div>
                <div className="font-medium">{invoice.name}</div>
                <div className="text-gray-400">10{invoice.number}</div>
              </div>
              <div className="ml-4 text-right">
                <div className="font-medium">{invoice.amount}</div>
                {invoice.due === false ? (
                  <div>paid</div>
                ) : invoice.due === 0 ? (
                  <div className="text-green-400">due today</div>
                ) : invoice.due < 0 ? (
                  <div className="text-red-500">Overdue</div>
                ) : (
                  <div className="text-gray-400">due in {invoice.due} days</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export function FastbooksInvoice() {
  return (
    <div className="p-4 overflow-hidden max-w-xs mx-auto">
      <div className="flex w-full justify-between">
        <div>
          <div className="font-medium text-base">Total Due</div>
          <div className="text-2xl font-bold">$8,000</div>
        </div>
        <div>
          <div className="font-medium text-sm">Stankonia</div>
          <div className="text-gray-300">102000</div>
        </div>
      </div>
      <div className="flex w-full justify-between mt-6">
        <div className="">
          <div className="text-sm font-medium">Invoice Date</div>
          <div className="text-gray-400">10/31/2000</div>
        </div>
        <div className="">
          <div className="text-sm font-medium">Due Date</div>
          <div className="text-gray-400">12/31/2000</div>
        </div>
      </div>
      <div className="mt-6">
        <div className="text-sm font-medium">Activity</div>
        <div>
          <ActivityItem activity="Created" date="10/28/2000" />
          <ActivityItem activity="Sent" date="10/30/2000" />
        </div>
      </div>
    </div>
  );
}
function ActivityItem({ activity, date }: { activity: string; date: string }) {
  return (
    <div className="relative">
      <div className="h-8 border-l border-green-500 absolute top-6 left-2" />
      <div className="mt-4 flex items-center">
        <div className="h-4 w-4 rounded-full bg-green-500" />
        <div className="ml-4">
          <div className="font-medium">{activity}</div>
          <div className="text-gray-400">{date}</div>
        </div>
      </div>
    </div>
  );
}
