import React from 'react';
import ProductsByCategory from '@/app/api/categories/components/ProductsByCategory';
import Header from "@/app/Header";
const page = () => {
  return (
    <div>
      <Header />
      <div className='container mx-auto px-4'><ProductsByCategory /></div></div>
  )
}

export default page
