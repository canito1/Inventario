'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  trend?: 'up' | 'down'
  icon: LucideIcon
  accent?: boolean
}

export default function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  accent = false,
}: MetricCardProps) {
  return (
    <div
      style={{
        background: "#edf8ff",
        border: "1px solid #1f1f1f",
        borderRadius: "1rem",
        padding: "16px",
        boxShadow: "0 2px 4px rgba(33,51,67,0.12)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: '"HubSpot Sans", sans-serif',
        transition: "box-shadow 200ms ease",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow =
          "0 1px 24px rgba(33,51,67,0.12)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow =
          "0 2px 4px rgba(33,51,67,0.12)")
      }
    >
      {/* Top row: icon + trend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "0.5rem",
            background: accent ? "#ff5c35" : "#ffffff",
            border: "1px solid #1f1f1f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} color={accent ? "#ffffff" : "#ff5c35"} />
        </div>

        {/* Trend badge */}
        {change && trend && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 500,
              background: trend === "up" ? "#edf8ff" : "#ffcec2",
              color: trend === "up" ? "#213343" : "#9f2800",
              border: `1px solid ${trend === "up" ? "#b6c7d6" : "transparent"}`,
            }}
          >
            {trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </span>
        )}
      </div>

      {/* Value + label */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#2e475d",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 4,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: '"HubSpot Serif", Georgia, serif',
            fontSize: "2rem",
            fontWeight: 700,
            color: "#000000",
            lineHeight: 1.2,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
