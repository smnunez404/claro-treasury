import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Props {
  data: { date: string; income_usd: number; expense_usd: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const income = payload.find((p: any) => p.dataKey === "income_usd")?.value ?? 0;
  const expense = payload.find((p: any) => p.dataKey === "expense_usd")?.value ?? 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-xs">
      <p className="text-gray-600 mb-1">
        {new Date(label).toLocaleDateString("en", { month: "long", day: "numeric" })}
      </p>
      {income > 0 && <p className="text-[#057A55]">Income: ${income.toFixed(2)}</p>}
      {expense > 0 && <p className="text-[#E02424]">Expenses: ${expense.toFixed(2)}</p>}
      {income === 0 && expense === 0 && <p className="text-gray-400">No activity</p>}
    </div>
  );
}

export default function TreasuryActivityChart({ data }: Props) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#057A55" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#057A55" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E02424" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#E02424" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
            interval={6}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => (v === 0 ? "" : "$" + v.toFixed(1))}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="income_usd"
            stroke="#057A55"
            strokeWidth={2}
            fill="url(#incomeGrad)"
            dot={false}
            activeDot={{ r: 3, fill: "#057A55" }}
          />
          <Area
            type="monotone"
            dataKey="expense_usd"
            stroke="#E02424"
            strokeWidth={2}
            fill="url(#expenseGrad)"
            dot={false}
            activeDot={{ r: 3, fill: "#E02424" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 justify-end">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#057A55]" />
          <span className="text-xs text-gray-500">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#E02424]" />
          <span className="text-xs text-gray-500">Expenses</span>
        </div>
      </div>
    </div>
  );
}
