import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailyPoint {
  date: string;
  amount_usd: number;
  count: number;
}

interface Props {
  data: DailyPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DailyPoint;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <p className="text-xs font-medium text-gray-900">
        {new Date(d.date).toLocaleDateString("en", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <p className="text-sm font-semibold text-gray-900 mt-1">
        ${d.amount_usd.toFixed(2)} USD
      </p>
      <p className="text-xs text-gray-500">{d.count} transaction(s)</p>
    </div>
  );
}

export default function ActivityChart({ data }: Props) {
  const totalVolume = data.reduce((s, d) => s + d.amount_usd, 0);
  const allZero = data.every((d) => d.amount_usd === 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <p className="text-base font-semibold text-gray-900">
            Transaction Activity
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            ${totalVolume.toFixed(2)} USD
          </p>
          <p className="text-xs text-gray-500">total volume</p>
        </div>
      </div>

      {allZero && (
        <p className="text-sm text-gray-400 text-center mb-2">
          No transaction activity in the last 30 days
        </p>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1A56DB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F3F4F6"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(date: string) =>
              new Date(date).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })
            }
            interval={4}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) =>
              v === 0 ? "" : "$" + v.toFixed(2)
            }
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            dataKey="amount_usd"
            type="monotone"
            stroke="#1A56DB"
            strokeWidth={2}
            fill="url(#colorGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#1A56DB" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
