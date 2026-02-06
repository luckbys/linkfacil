export type LinkType = 'link' | 'whatsapp' | 'instagram' | 'tiktok' | 'youtube' | 'email' | 'facebook' | 'twitter' | 'linkedin' | 'github' | 'pix'

export const detectLinkType = (url: string): LinkType => {
    const lowerUrl = url.toLowerCase()

    if (lowerUrl.includes('instagram.com')) return 'instagram'
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube'
    if (lowerUrl.includes('wa.me') || lowerUrl.includes('whatsapp.com')) return 'whatsapp'
    if (lowerUrl.includes('tiktok.com')) return 'tiktok'
    if (lowerUrl.includes('linkedin.com')) return 'linkedin'
    if (lowerUrl.includes('github.com')) return 'github'
    if (lowerUrl.includes('facebook.com')) return 'facebook'
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter'
    if (lowerUrl.startsWith('mailto:') || lowerUrl.includes('@')) return 'email'

    return 'link'
}

export const getFaviconUrl = (url: string): string | null => {
    try {
        if (!url || url.startsWith('mailto:')) return null
        let domain = url.replace(/^https?:\/\//, '').split('/')[0]

        // Unavatar is very robust and handles social/domain icons with high quality
        return `https://unavatar.io/${domain}`
    } catch (e) {
        return null
    }
}
