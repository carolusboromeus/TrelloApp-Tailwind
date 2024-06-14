'use client'

import './404.scss';
import { useRouter } from 'next/navigation'

const NotFound = (() => {
    const router = useRouter();

    return (
        <div id='NotFound'>
            <div id='Title'>
                <h1>Oops!</h1>
                <hr></hr>
                <br></br>
                <h3>404.<br></br>Page Not Found</h3><br></br>
                <p>Something went wrong and the page you're looking for cannot be found.</p>
                <br></br>
                <button className='btn badge' onClick={() => {router.push('/')}}>Go To Home</button>
            </div>
        </div>
    )
})

export default NotFound;