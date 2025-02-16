
import { NotebookTabs } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export const Logo = () =>{
    return (
        <Link href='/' className='flex items-center gap-2'>
            <NotebookTabs className='size-8' strokeWidth={1.5}/>
            <span className='text-lg font-semibold'>Elva</span>
        </Link>
    )
}

