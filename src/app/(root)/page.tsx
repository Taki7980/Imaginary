import React from 'react'
import { UserButton } from "@clerk/nextjs";

const Home = () => {
  return (
    <div>
      34:32
      <UserButton afterSignOutUrl='/'/>
    </div>
  )
}

export default Home