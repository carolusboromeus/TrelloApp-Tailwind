'use client'

// import './404.scss';
import { useRouter } from 'next/navigation'

const NotFound = (() => {
    const router = useRouter();

    return (
        <div className='flex h-[calc(100vh-250px)] sm:h-[calc(100vh-37px)] justify-center items-center'>
            <div className='w-1/2 text-center text-white'>
                <h1 className='font-extrabold text-3xl py-3'>Oops!</h1>
                <hr></hr>
                <br></br>
                <h3 className='font-semibold text-base'>404.<br></br>Page Not Found</h3><br></br>
                <p className='text-base'>Something went wrong and the page you're looking for cannot be found.</p>
                <br></br>
                <button className='px-3 py-2 my-3 rounded-3xl font-bold text-white bg-blue-500 hover:text-black hover:bg-gray-300' onClick={() => {router.push('/')}}>Go To Home</button>
            </div>
        </div>
    )
})

export default NotFound;