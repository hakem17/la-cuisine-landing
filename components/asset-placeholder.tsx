import { Film, Image as ImageIcon, Sparkles } from 'lucide-react'
import React from 'react'

interface AssetPlaceholderProps {
  label: string
  aspectRatio?: string
  minHeight?: string
  className?: string
  type?: 'image' | 'video' | 'logo'
  dimensionsHint?: string
  overlay?: boolean
  shape?: 'rect' | 'circle'
}

export function AssetPlaceholder({
  label,
  aspectRatio,
  minHeight,
  className = '',
  type = 'image',
  dimensionsHint,
  overlay = false,
  shape = 'rect',
}: AssetPlaceholderProps) {
  const Icon = type === 'video' ? Film : type === 'logo' ? Sparkles : ImageIcon

  return (
    <div
      className={`asset-placeholder ${type === 'logo' ? 'asset-placeholder--logo' : ''} ${
        overlay ? 'asset-placeholder--overlay' : ''
      } ${shape === 'circle' ? 'asset-placeholder--circle' : ''} ${className}`}
      style={{
        aspectRatio: shape === 'circle' ? '1 / 1' : aspectRatio || undefined,
        minHeight: minHeight || undefined,
      }}
      role="img"
      aria-label={label}
    >
      <div className="asset-placeholder__inner">
        <div className="asset-placeholder__icon">
          <Icon size={shape === 'circle' ? 18 : type === 'logo' ? 18 : 24} strokeWidth={1.5} />
        </div>
        <span className="asset-placeholder__label">{label}</span>
        {dimensionsHint && <span className="asset-placeholder__dimensions">{dimensionsHint}</span>}
      </div>
      <div className="asset-placeholder__pattern" aria-hidden="true" />
    </div>
  )
}
