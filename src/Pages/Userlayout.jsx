import React from 'react'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Home from '../components/Home'

const Userlayout = () => {
  return (
    <div className="app-shell">
      <Header />
      <Navbar />
      <Home />
    </div>
  )
}

export default Userlayout