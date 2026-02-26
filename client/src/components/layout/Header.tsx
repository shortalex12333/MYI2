'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, Bell, Menu, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, loading, signOut } = useAuth()
  const isAuthenticated = !!user
  const userReputation = 1247

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-foreground">
              <Image src="/logo.svg" alt="MYI" width={28} height={16} priority className="h-5 w-auto" />
            </span>
            <span className="font-bold text-lg">MYI</span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/posts">
              <Button variant="ghost" size="sm">
                Questions
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="ghost" size="sm">
                Categories
              </Button>
            </Link>
            <Link href="/papers">
              <Button variant="ghost" size="sm">
                Papers
              </Button>
            </Link>
            <Link href="/companies">
              <Button variant="ghost" size="sm">
                Companies
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" size="sm">
                FAQ
              </Button>
            </Link>
            <Link href="/topics/">
              <Button variant="ghost" size="sm">
                Topics
              </Button>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search questions..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                <Button variant="default" size="sm" asChild className="hidden sm:flex">
                  <Link href="/posts/new">Ask Question</Link>
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    3
                  </span>
                </Button>
                <Link href="/profile" className="flex items-center gap-2 hover:bg-accent p-1.5 rounded">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none">{user?.username || user?.email}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Award className="h-3 w-3" />
                      <span>{userReputation.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()}>Sign out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}

            {/* Mobile menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
