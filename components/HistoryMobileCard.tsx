'use client'

import { TrendingUp, TrendingDown, Calendar, User, Package, FileText, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CurrencyDisplay } from '@/components/CurrencyDisplay'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardSection,
  MobileCardField
} from '@/components/ui/responsive-table'
import { HistoryEntry } from '@/components/HistoryDataTable'

interface HistoryMobileCardProps {
  entry: HistoryEntry
  selected?: boolean
  onSelect?: (selected: boolean) => void
}

export function HistoryMobileCard({
  entry,
  selected = false,
  onSelect
}: HistoryMobileCardProps) {
  const isEntry = entry.type === 'entrada'
  const typeConfig = {
    entrada: {
      icon: <TrendingUp className="copilot-h-3 copilot-w-3 sm:copilot-h-4 sm:copilot-w-4 copilot-text-success" />,
      badge: (
        <Badge size="sm" className="copilot-bg-success/10 copilot-text-success copilot-border copilot-border-success/20">
          <span className="copilot-mr-0.5">📈</span>
          <span className="copilot-hidden copilot-xs:copilot-inline">Entrada</span>
        </Badge>
      ),
      borderColor: "copilot-border-l-copilot-border-success"
    },
    salida: {
      icon: <TrendingDown className="copilot-h-3 copilot-w-3 sm:copilot-h-4 sm:copilot-w-4 copilot-text-destructive" />,
      badge: (
        <Badge size="sm" className="copilot-bg-destructive/10 copilot-text-destructive copilot-border copilot-border-destructive/20">
          <span className="copilot-mr-0.5">📉</span>
          <span className="copilot-hidden copilot-xs:copilot-inline">Salida</span>
        </Badge>
      ),
      borderColor: "copilot-border-l-copilot-border-destructive"
    }
  }

  const config = typeConfig[entry.type]
  const quantityDisplay = isEntry ? `+${entry.quantity}` : `-${entry.quantity}`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const { date, time } = formatDate(entry.createdAt)

  return (
    <MobileCard
      selected={selected}
      onClick={onSelect ? () => onSelect(!selected) : undefined}
      className={`copilot-border-l-4 ${config.borderColor}`}
    >
      <MobileCardHeader
        title={entry.productName}
        subtitle={entry.productSku ? `SKU: ${entry.productSku}` : undefined}
        icon={<Package className="copilot-h-5 copilot-w-5 copilot-text-muted" />}
        badge={config.badge}
        actions={config.icon}
      />

      <MobileCardSection>
        <MobileCardField
          label="Cantidad"
          value={
            <span className={`copilot-font-semibold ${isEntry ? 'copilot-text-success' : 'copilot-text-destructive'}`}>
              {quantityDisplay}
            </span>
          }
        />

        {entry.unitCost && (
          <MobileCardField
            label="Costo unitario"
            value={<CurrencyDisplay amount={entry.unitCost} currency={entry.currency || 'PEN'} />}
          />
        )}

        <MobileCardField
          label="Costo total"
          value={<CurrencyDisplay amount={entry.totalCost} currency={entry.currency || 'PEN'} />}
        />

        <MobileCardField
          label="Motivo"
          value={
            <Badge variant="outline" size="sm" className="copilot-border-border">
              {entry.reason}
            </Badge>
          }
        />

        {entry.supplier && (
          <MobileCardField
            label="Proveedor"
            value={
              <div className="copilot-flex copilot-items-center copilot-gap-1">
                <MapPin className="copilot-h-3 copilot-w-3 copilot-text-muted" />
                <span className="copilot-text-xs">{entry.supplier}</span>
              </div>
            }
          />
        )}

        {entry.destination && (
          <MobileCardField
            label="Destino"
            value={
              <div className="copilot-flex copilot-items-center copilot-gap-1">
                <MapPin className="copilot-h-3 copilot-w-3 copilot-text-muted" />
                <span className="copilot-text-xs">{entry.destination}</span>
              </div>
            }
          />
        )}

        {entry.notes && (
          <MobileCardField
            label="Notas"
            value={
              <div className="copilot-flex copilot-items-start copilot-gap-1">
                <FileText className="copilot-h-3 copilot-w-3 copilot-text-muted copilot-mt-0.5 copilot-flex-shrink-0" />
                <span className="copilot-text-xs copilot-text-muted">{entry.notes}</span>
              </div>
            }
          />
        )}

        <div className="copilot-pt-2 copilot-border-t copilot-border-border">
          <MobileCardField
            label="Fecha"
            value={
              <div className="copilot-flex copilot-items-center copilot-gap-1">
                <Calendar className="copilot-h-3 copilot-w-3 copilot-text-muted" />
                <span className="copilot-text-xs">{date} - {time}</span>
              </div>
            }
          />

          <MobileCardField
            label="Usuario"
            value={
              <div className="copilot-flex copilot-items-center copilot-gap-1">
                <User className="copilot-h-3 copilot-w-3 copilot-text-muted" />
                <span className="copilot-text-xs">{entry.createdBy}</span>
              </div>
            }
          />
        </div>
      </MobileCardSection>
    </MobileCard>
  )
}