'use client'

import { getNotificationLog } from '@/app/lib/api';
import Pagination from '@/app/ui/Common/Pagination/Pagination';
import { useVisibility } from '@/app/home';

import { useState, useEffect } from 'react';
import dateFormat from "dateformat";
import parse, {domToReact} from 'html-react-parser';
import { motion, AnimatePresence } from "framer-motion";

const options = {
    replace(domNode) {
        if (domNode.name === 'html') {
            // Returning null will remove the node from the DOM
            return <span>{domToReact(domNode.children, options)}</span>;
        }
        if(domNode.name === 'body') {
            return <div>{domToReact(domNode.children, options)}</div>;
        }
    },
    trim: true
};

const NotificationLog = () => {

    const { isVisible, isSmallScreen } = useVisibility();

    const [notification, setNotification] = useState(null);
    const [pageNumber, setPageNumber] = useState(0);
    const [contentsTotal, setContentsTotal] = useState(0);
    const [showBodyForIds, setShowBodyForIds] = useState([]);

    useEffect(() => {
        async function getDataNotification (){
            const data = await getNotificationLog(pageNumber);
            if(data){
                setNotification(data);
                setContentsTotal(data.contentsTotal);
            }
        }

        getDataNotification();
    },[pageNumber])

    const toggleBodyVisibility = (id) => {
        if (showBodyForIds.includes(id)) {
            setShowBodyForIds(showBodyForIds.filter(item => item !== id));
        } else {
            setShowBodyForIds([...showBodyForIds, id]);
        }
    };

    return (
        <>
            <AnimatePresence>
                <motion.div className='scrollbar w-full h-[calc(100vh-95px)] overflow-x-auto mt-2' animate={{maxHeight: isVisible ? null : isSmallScreen ? "calc(100vh - 130px)" : null}}>
                    <div className="text-gray-700">
                        {notification && notification.contents.length > 0 && notification.contents.map((notification) => {
                            return (
                                <div className='bg-list-bg-color mx-gap mb-gap gap-3 rounded-2xl p-4' key={notification.id}>
                                    <h6 className='text-sm font-medium mb-2'>Send via Email</h6>
                                    <div className='grid grid-cols-2 text-xs'>
                                        <div className='col-span-1'>
                                            <div>Date Send: {dateFormat(notification.sentDate, "d mmm yyyy, h:MM:ss TT")}</div>
                                            {/* <div>From: 123</div> */}
                                            <div>To: {notification.to}</div>
                                            <div>Subject: {notification.subject}</div>
                                            <div className='flex'>
                                                <p className='mr-1 mt-1'>Body: </p>
                                                <button className='underline p-1 bg-list-bg-color rounded-md hover:bg-hover-button'
                                                    title={showBodyForIds.includes(notification.id) ? 'Hide Body' : 'Show Body'} 
                                                    onClick={() => toggleBodyVisibility(notification.id)}
                                                >
                                                    {showBodyForIds.includes(notification.id) ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className='col-span-1 text-end'>
                                            <div>Status: {notification.status}</div>
                                        </div>
                                    </div>
                                    {showBodyForIds.includes(notification.id) &&
                                        <div className='bg-white mt-1 p-3 border border-gray-600 rounded-lg text-xs'>{parse(notification.body, options)}</div>
                                    }
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
            <Pagination contentsTotal={contentsTotal}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
            />
        </>
    )
}

export default NotificationLog;