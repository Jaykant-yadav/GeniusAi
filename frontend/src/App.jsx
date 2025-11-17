import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Layout from './pages/Layout.jsx'
import Dashboard from './pages/Dashboard'
import WriteArticle from './pages/WriteArticle.jsx'
import BlogTitles from './pages/BlogTitles'
import GenerateImages from './pages/GenerateImages.jsx'
import RemoveBackground from './pages/RemoveBackground.jsx'
import RemoveObject from './pages/RemoveObject.jsx'
import ReviewsResume from './pages/ReviewsResume.jsx'
import Community from './pages/Community.jsx'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/ai' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='write-article' element={<WriteArticle />} />
          <Route path='blog-titles' element={<BlogTitles />} />
          <Route path='generate-images' element={<GenerateImages />} />
          <Route path='remove-background' element={<RemoveBackground />} />
          <Route path='remove-objects' element={<RemoveObject />} />
          <Route path='review-resume' element={<ReviewsResume />} />
          <Route path='community' element={<Community />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
