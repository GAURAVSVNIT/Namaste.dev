'use client'
import { useEffect, useState } from 'react'

export default function ExtensionCompatibility() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark that we're now on the client side
    setIsClient(true)
    
    // Allow extensions to modify the DOM without hydration warnings
    const html = document.documentElement
    
    // Optional: Log extension attributes for debugging
    if (process.env.NODE_ENV === 'development') {
      const extensionAttrs = Array.from(html.attributes)
        .filter(attr => attr.name.includes('extension') || attr.name.includes('windsurf'))
      
      if (extensionAttrs.length > 0) {
        console.log('Browser extension attributes detected:', extensionAttrs.map(attr => attr.name))
      }
    }
  }, [])

  // Don't render anything during SSR to avoid hydration mismatches
  if (!isClient) {
    return null
  }

  return null
}
