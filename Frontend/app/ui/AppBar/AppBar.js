'use client'

import { UpdateNotifSettings } from '@/app/ui/buttons';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';

const DropdownToggle = (props) => {
    const {notification, setNotification} = props;
    const [show, setShow] = useState(false);
    const dropdownRef = useRef(null);
    const notifEmailRef = useRef(null);
    const notifSMSRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShow(false);
            }
        };
    
        document.addEventListener('mousedown', handleOutsideClick);
    
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        if(notification && show) {
            if(notification.email === true && notifEmailRef.current !== null){
                notifEmailRef.current.checked = true;
            }

            if(notification.sms === true && notifSMSRef.current !== null) {
                notifSMSRef.current.checked = true;
            }
        }
    }, [notification, show])
    
    const toggleDropdown = () => {
        setShow(!show);
    };

    const handleUpdateNotifSettings = () => {
        if(notifEmailRef.current !== null && notifSMSRef.current !== null) {
            const newNotifSettings = {
                email: notifEmailRef.current.checked,
                sms: notifSMSRef.current.checked,
                whatsapp: false,
            }

            UpdateNotifSettings(newNotifSettings);
            setNotification(newNotifSettings);
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown toggle button */}
            <button
                onClick={toggleDropdown}
                title="Settings"
                className="px-2 py-1 hover:bg-hover-icon hover:rounded-md"
            >
                <i className='bi bi-gear text-list-bg-color'></i>
            </button>

            {/* Dropdown menu */}
            {show && (
                <div className="absolute right-0 mt-2 w-60 bg-list-bg-color border rounded-md shadow-lg px-2">
                    <div className='flex w-full border-b border-slate-400 px-3 py-3 text-base'>
                        <div className='text-black font-semibold w-full text-center'>Settings</div>
                        <button className='text-end w-1/12' onClick={() => setShow(false)}>
                            <i className='bi bi-x hover:rounded-md hover:bg-hover-button p-1'></i>
                        </button>
                    </div>
                    <div className='px-3 py-3'>
                        <div className='font-medium'>Notification Configuation</div>
                        <div className='mt-1'>
                            <input className='mt-1' 
                                type="checkbox"
                                ref={notifEmailRef}
                                name="Email"
                                value={notification.email}
                                onClick={() => handleUpdateNotifSettings()}
                            ></input>
                            <span className='ml-2 bi bi-envelope'> Send via Email</span>
                        </div>
                        <div>
                            <input className='mt-1' 
                                type="checkbox"
                                ref={notifSMSRef}
                                name='SMS'
                                value={notification.sms}
                                onClick={() => handleUpdateNotifSettings()}
                            ></input><span className='ml-2 bi bi-chat-left-text'> Send via SMS</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

DropdownToggle.propTypes = {
    notification: PropTypes.object.isRequired,
    setNotification: PropTypes.func.isRequired
};

const AppBar = (props) => {
    const {notification, setNotification} = props;
    
    const router = useRouter();

    return(
        <nav className="navbar-app px-2 py-1 pl-gap pb-ga flex items-center w-full border-b border-border-color">
            <span className="text-sm md:text-xl w-11/12"><Link className="text-list-bg-color no-underline" href="/">Byon Task Management</Link></span>
            <div className="w-1/12 flex flex-row-reverse">
                <DropdownToggle notification={notification} setNotification={setNotification}/>
                <button className="px-2 py-1 hover:bg-hover-icon hover:rounded-md" title='Notification Log' name='Notification Log' onClick={() => router.push('/notification-log')}>
                    <i className='bi bi-bell text-list-bg-color'></i>
                </button>
            </div>
        </nav>
    )
}

AppBar.propTypes = {
    notification: PropTypes.object.isRequired,
    setNotification: PropTypes.func.isRequired
};

export default AppBar;