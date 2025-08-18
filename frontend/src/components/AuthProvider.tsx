"use client"

import { useAuthStore } from "@/stores/authStore"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

// Define paths that are public and don't require authentication
const publicPaths = ["/login", "/signup"]

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isPublic = publicPaths.includes(pathname)
    if (!isAuthenticated && !isPublic) {
      router.push("/login")
    }
  }, [isAuthenticated, pathname, router])

  // To prevent flicker, we can show a loader while checking auth
  // For this mock, we'll just return children if authenticated or on a public page
  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return null // or a loading spinner
  }

  return <>{children}</>
}
