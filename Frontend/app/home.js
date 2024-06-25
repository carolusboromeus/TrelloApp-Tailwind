'use client'

import AppBar from "@/app/ui/AppBar/AppBar";
import SideBar from "@/app/ui/SideBar/SideBar";
import Loading from "./ui/Common/Loading/Loading";
import { getData, postData } from "@/app/lib/api";

import { useEffect, useState, useCallback, useContext, useMemo, createContext } from "react";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';

const VisibilityContext = createContext();

const Home = ({modal, children}) => {
  const [boards,setBoards] = useState([]);
  const [notification,setNotification] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const [first, setFirst] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if(boards.length > 0 && notification) {
      postData(boards, notification);
    } else {
      try{
        setLoading(true);
        const {boards, notificationSetting} = await getData();
        setBoards(boards); 
        setNotification(notificationSetting);
        setFirst(false);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  }, [boards, notification])
  
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    

    const handleResize = (mq) => {
      setIsSmallScreen(mq.matches);
    };

    handleResize(mediaQuery); // Initial check

    const listener = (event) => handleResize(event.media);

    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, [isSmallScreen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 765px)");

    const handleResize = (mq) => {
      setIsMediumScreen(mq.matches);
    };

    handleResize(mediaQuery); // Initial check

    const listener = (event) => handleResize(event.media);

    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };

  }, [isMediumScreen])

  useEffect(() => {

    // Check for internet connection change
    const handleConnectionChange = () => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        // If online, retry fetching data
        fetchData();
      }
    };

    window.addEventListener('online', handleConnectionChange);
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleConnectionChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleConnectionChange);
      }
    };
  }, [fetchData]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    // Initial data fetch when component mounts
    fetchData();
  }, []);

  const contextValue = useMemo(() => ({
    isVisible,
    isSmallScreen,
    boards,
    setBoards
  }), [isVisible, isSmallScreen, boards, setBoards]);

  // console.log(`Visible: ${isVisible} & SmallScreen: ${isSmallScreen} & MediumScreen: ${isMediumScreen}`);

  return (
    <>
      <div className="trello-master h-dvh bg-board-bg-color text-app-main-color">
        <VisibilityContext.Provider value={contextValue}>
          <div>{modal}</div>
        </VisibilityContext.Provider>
        <AppBar notification={notification} setNotification={setNotification} setBoards={setBoards}/>
        <div className=" h-max sm:flex w-full">
          <motion.div className={`${isSmallScreen ? "w-full" : "sm:w-1/5 md:w-1/8"}`} 
            animate={{ width: isVisible ? (isSmallScreen ? '100%' : (isMediumScreen ? '20%' : '13%')) : (isSmallScreen ? '100%' : (isMediumScreen ? '6%' : '5%')), 
              height: isVisible ? (isSmallScreen ? '100%' : '100%') : (isSmallScreen ? '3%' : '100%') }}
            transition={{ duration: 0.3 }}
            >
            <SideBar 
              boards={boards}
              setBoards={setBoards}
              notification={notification}
              isVisible={isVisible}
              setIsVisible={setIsVisible}
              isSmallScreen={isSmallScreen}/>
          </motion.div>
          <VisibilityContext.Provider value={contextValue}>
            <motion.div className={`${isSmallScreen ? "w-full" : "sm:w-4/5 md:w-7/8"}`}
              animate={{ width: isVisible ? (isSmallScreen ? '100%' : (isMediumScreen ? '80%' : '87%')) : (isSmallScreen ? '100%' : (isMediumScreen ? '94%' : '95%'))}}
              transition={{ duration: 0.3 }}  
            >
                {children}
                {loading && <Loading/>}
            </motion.div>
          </VisibilityContext.Provider>
        </div>
      </div>
      {!first && !isOnline &&
        <div className="absolute w-full sm:w-auto sm:mb-5 sm:ml-5 bottom-0 -translate-x-notification">
          <motion.div animate={{x: isOnline ? 0 : 600}} transition={{ duration: 0.1, delay: 0.5, }} >
            <div className="bg-list-bg-color p-5 rounded-lg flex flex-row">
              <i className="bi bi-exclamation-triangle-fill mr-2 text-yellow-500"></i>
              <div>
                <h6 className=" font-bold">You are currently offline.</h6>
                <div>Changes made now will not be saved.</div>
              </div>
            </div>
          </motion.div>
        </div>
      }
      {first && !isOnline &&
        <div className="absolute w-full sm:w-auto sm:mb-5 sm:ml-5 bottom-0 -translate-x-notification">
          <motion.div animate={{x: isOnline ? 0 : 600}} transition={{ duration: 0.1, delay: 0.5, }} >
            <div className="bg-list-bg-color p-5 rounded-lg flex flex-row">
              <i className="bi bi-exclamation-triangle-fill mr-2 text-yellow-500"></i>
              <div>
                <h6 className="font-bold">You are currently offline.</h6>
                <div>Please check your internet connection.</div>
              </div>
            </div>
          </motion.div>
        </div>
      }
    </>
  );
}

export default Home;

Home.propTypes = {
  children: PropTypes.ReactNode,
  modal: PropTypes.object,
};

export const useVisibility = () => useContext(VisibilityContext);