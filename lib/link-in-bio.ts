// Config for the QR-only link-in-bio page (app/links). The QR code printed on
// menus/packaging encodes LINKS_QR_URL, so keep the route + param in sync with it.

export const LINKS_ROUTE = '/links'

// Lightweight entry condition, NOT authentication: anyone holding the URL with
// ?from=qr can open the page. Use a signed/expiring token if real access
// control is ever needed.
export const LINKS_ACCESS = { param: 'from', value: 'qr' } as const

export const LINKS_QR_URL = `https://events-booking.lacuisinedemanou.ae${LINKS_ROUTE}?${LINKS_ACCESS.param}=${LINKS_ACCESS.value}`

export type SocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'website'

export const SOCIAL_LINKS: { platform: SocialPlatform; label: string; handle: string; href: string }[] = [
  { platform: 'instagram', label: 'Instagram', handle: '@lacuisinedemanou', href: 'https://www.instagram.com/lacuisinedemanou/' },
  { platform: 'tiktok', label: 'TikTok', handle: '@lacuisinedemanou', href: 'https://www.tiktok.com/@lacuisinedemanou' },
  { platform: 'facebook', label: 'Facebook', handle: 'cuisinedemanou', href: 'https://www.facebook.com/cuisinedemanou' },
  { platform: 'website', label: 'Website', handle: 'lacuisinedemanou.ae', href: 'https://www.lacuisinedemanou.ae/' },
]
