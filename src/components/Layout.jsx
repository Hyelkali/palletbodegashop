import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Announcement from './Announcement'
import { useLocation } from 'react-router-dom'
import SearchOverlay from './SearchOverlay'
import { useSearch } from '../hooks/useSearch'
import ChatSupport from './ChatSupport'

const Layout = () => {
  const location = useLocation()
  const { isSearchOpen } = useSearch()
  
  return (
    <div className="site-wrapper">
      <Announcement />
      <Header />
      {isSearchOpen && <SearchOverlay />}
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <ChatSupport />
    </div>
  )
}

export default Layout