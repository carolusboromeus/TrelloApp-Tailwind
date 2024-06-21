'use client'

// import './404.scss';
import { useRouter } from 'next/navigation'

const NotFound = (() => {
    const router = useRouter();

    return (
        <div className='flex h-auto justify-center items-center bg-white'>
            <div className='w-1/2 text-center'>
                <h1>Oops!</h1>
                <hr></hr>
                <br></br>
                <h3>404.<br></br>Page Not Found</h3><br></br>
                <p>Something went wrong and the page you're looking for cannot be found.</p>
                <br></br>
                <button className='px-3 py-2 font-bold text-white bg-blue-500 hover:text-black hover:bg-hover-button' onClick={() => {router.push('/')}}>Go To Home</button>
            </div>
        </div>
    )
})

export default NotFound;