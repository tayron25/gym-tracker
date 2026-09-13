import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ExerciseTrendPoint } from "../../domain/types/analytics";
import { formatShortDateInTimeZone } from "../../domain/metrics/date-metrics";

export function ProgressChart({ data, timezone, unit, convert }: { data: ExerciseTrendPoint[]; timezone: string; unit: "kg" | "lb"; convert(value: number): number }) {
  const chartData = data.map((point) => ({ ...point, label: formatShortDateInTimeZone(point.completedAt, timezone), displayE1rm: Number(convert(point.e1rmKg).toFixed(1)) }));
  return (
    <div className="progress-chart" role="img" aria-label="Gráfica de e1RM estimado">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="var(--muted)" tick={{ fill: "var(--muted)", fontSize: 11 }} />
          <YAxis stroke="var(--muted)" tick={{ fill: "var(--muted)", fontSize: 11 }} unit={` ${unit}`} />
          <Tooltip formatter={(value) => [`${value} ${unit}`, "e1RM"]} labelFormatter={(label) => `Sesión · ${label}`} contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }} />
          <Line type="monotone" dataKey="displayE1rm" stroke="var(--cyan)" strokeWidth={3} dot={{ fill: "var(--cyan)", r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
