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
    const mediaQuery = window.matchMedia("(max-width: 575px)");
    const handleResize = () => setIsSmallScreen(mediaQuery.matches);
    
    handleResize(); // Initial check
    mediaQuery.addListener(handleResize);
    
    return () => {
      mediaQuery.removeListener(handleResize);
    };
  }, []);

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

  return (
    <>
      <div className="h-dvh bg-board-bg-color text-app-main-color">
        <VisibilityContext.Provider value={contextValue}>
          <div>{modal}</div>
        </VisibilityContext.Provider>
        <AppBar notification={notification} setNotification={setNotification} setBoards={setBoards}/>
        <div className=" h-max sm:flex w-full">
          <motion.div className="w-full sm:w-2/12" animate={{width: isVisible ? null : isSmallScreen ? null : '3.5%', height: isVisible ? isSmallScreen ? "" : '' : isSmallScreen ? "33px" : null}}>
            <SideBar 
              boards={boards}
              setBoards={setBoards}
              notification={notification}
              isVisible={isVisible}
              setIsVisible={setIsVisible}
              isSmallScreen={isSmallScreen}/>
          </motion.div>
          <VisibilityContext.Provider value={contextValue}>
            <motion.div className="w-full sm:w-10/12" animate={{width: isVisible ? null : isSmallScreen ? null : '96.5%'}}>
                {children}
                {loading && <Loading/>}
            </motion.div>
          </VisibilityContext.Provider>
        </div>
      </div>
      {!first &&
        <div className="md:absolute bottom-0 -translate-x-notification">
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
      {first &&
        <div className="md:absolute bottom-0 -translate-x-notification">
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