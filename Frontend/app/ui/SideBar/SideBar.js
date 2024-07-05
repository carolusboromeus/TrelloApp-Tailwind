'use client'

// import './SideBar.scss';
import Board from "@/app/ui/Board/Board";
import { CreateBoard } from '@/app/ui/buttons';
import exampleBackground from '@/app/assets/example-background.svg';
import { useVisibility } from "@/app/home";

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Input, Select, Label, Field, Description } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import clsx from 'clsx'

const DropdownToggle = () => {
    const {boards, notification, setBoards, socket} = useVisibility();
    const [show, setShow] = useState(false);
    const [value, setValue] = useState(null);
    const dropdownRef = useRef(null);
    const inputBoardRef = useRef(null);
    const selectVisibilityRef = useRef(null);
    const [colorBackground, setColorBackground] = useState({"r":0,"g":121,"b":191,"a":1});

    const colors = [
        {"t":"Ocean Boat Blue","r":0,"g":121,"b":191,"a":1},
        {"t":"Munsell Blue","r":0,"g":151,"b":167,"a":1},
        {"t":"Dark Cyan","r":0,"g":150,"b":136,"a":1},
        {"t":"Palm Leaf","r":104,"g":159,"b":56,"a":1},
        {"t":"Japanese Laurel","r":45,"g":134,"b":52,"a":1},
        {"t":"Giants Orange","r":255,"g":87,"b":34,"a":1},
        {"t":"Coral Red","r":244,"g":67,"b":54,"a":1},
        {"t":"Razzmatazz","r":233,"g":30,"b":99,"a":1},
        {"t":"Dark Orchid","r":156,"g":39,"b":176,"a":1},
        {"t":"Dark Margenta","r":139, "g":0, "b":139, "a":1},
        {"t":"Plump Purple","r":103,"g":58,"b":183,"a":1},
        {"t":"Indigo","r":75, "g":0, "b":130, "a":1},
        {"t":"Violet Blue","r":63,"g":81,"b":181,"a":1},
        {"t":"Police Blue","r":52,"g":70,"b":100,"a":1},
        {"t":"Tuscan Red","r":128,"g":48,"b":48,"a":1},
        {"t":"Steel Teal","r":96,"g":125,"b":139,"a":1},
    ];

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setValue(null);
                setColorBackground({"r":0,"g":121,"b":191,"a":1});
                setShow(false);
            }
        };
    
        document.addEventListener('mousedown', handleOutsideClick);
    
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        if(show){
            const draghandle = document.getElementsByClassName("smooth-dnd-container");
            for (const drag of draghandle) {
                drag.style.position = "static";
            }
        } else {
            const draghandle = document.getElementsByClassName("smooth-dnd-container");
            for (const drag of draghandle) {
                drag.style.position = "relative";
            }
        }
    }, [show])
    
    const toggleDropdown = () => {
        setShow(!show);
    };

    const handleAddNewBoard = ( async (formData) => {
        if(formData.get('title') === '') {
            if(inputBoardRef.current)
                inputBoardRef.current.focus();
            return;
        }

        const value = await CreateBoard(formData, colorBackground, boards, notification);
        setBoards(value);
        socket.emit("updateBoards", value);
        inputBoardRef.current.value = '';
        selectVisibilityRef.current.value = "Workspace";
        setShow(false);
        setColorBackground({"r":0,"g":121,"b":191,"a":1});
    })

    return (
        <div className="relative sm:flex" ref={dropdownRef}>
            {/* Dropdown toggle button */}
            <button
                onClick={toggleDropdown}
                title="Create Board"
                className="p-1 hover:bg-hover-icon hover:rounded-md"
            >
                <i className='bi bi-plus text-list-bg-color'></i>
            </button>

            {/* Dropdown menu */}
            {show && (
                <div className="absolute mt-2 w-72 sm:w-100 md:w-72 bg-list-bg-color border rounded-md shadow-lg px-2 right-0 sm:right-auto sm:translate-x-8">
                    <div className='flex w-full px-3 py-3 text-sm'>
                        <div className='text-black font-semibold w-full text-center'>Create board</div>
                        <button className='text-end w-1/12' onClick={() => setShow(false)}>
                            <i className='bi bi-x text-black  hover:rounded-md hover:bg-hover-button p-1'></i>
                        </button>
                    </div>
                    <form className="block sm:grid sm:grid-cols-2 md:block" action={handleAddNewBoard}>
                        <div className="block md:block">
                            <div className="mb-3 w-full">
                                <div id='example-background' className='bg-board-bg-color w-full h-full mb-3 rounded-md pb-3'>
                                    <Image
                                        className=' block mx-auto'
                                        src={exampleBackground}
                                        alt="Example Background"
                                    />
                                </div>
                                <label htmlFor='backgoround' className="block text-gray-700 text-sm mb-2">Background</label>
                                <div className="grid grid-cols-8 gap-2" name='background'>
                                    {colors.map((color, i) => {
                                        const backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
                                        const value = {"r":color.r, "g":color.g, "b":color.b, "a":1};
                                        const isActive = (
                                            colorBackground.r === value.r &&
                                            colorBackground.g === value.g &&
                                            colorBackground.b === value.b &&
                                            colorBackground.a === value.a
                                        );
                                        return (
                                            <button key={i} className={isActive ? `px-3 py-3 border rounded-md shadow-md border-gray-600/50` : `px-3 py-3 border rounded-md hover:shadow-md hover:border-gray-600/50`} title={color.t} name={color.t} style={{backgroundColor}}
                                                onClick={() => {
                                                    const example = document.getElementById("example-background");
                                                    example.style.backgroundColor = backgroundColor;
                                                    setColorBackground(value);
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="ml-0 sm:ml-2 md:ml-0">
                            <Field className="mb-3 md:mb-3">
                                <Label className="block text-gray-700 text-sm mb-2">Board title <span style={{color: "red"}}>*</span></Label>
                                <Input
                                    className={clsx(
                                        'shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight',
                                        'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-blue-500/50'
                                    )}
                                    type="text" 
                                    placeholder="Input board title" 
                                    name='title' 
                                    autoComplete='false' 
                                    spellCheck='false'
                                    ref={inputBoardRef}
                                    onChange={(event) => setValue(event.target.value)}
                                />
                                {(value === null || value === '') && 
                                    <Description className='text-gray-700 text-xs font-light mt-2'>Board title is required</Description>
                                }
                            </Field>
                            <Field className="mb-3">
                                <Label className="block text-gray-700 text-sm mb-2">Visibility</Label>
                                <div className="relative">
                                    <Select
                                        className={clsx(
                                            'shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight',
                                            'focus:outline-none focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500/50',
                                            '*:text-black '
                                        )}
                                        name='visibility' 
                                        defaultValue="Workspace"
                                        ref={selectVisibilityRef}
                                    >
                                        <option value="Private" title='Only board admins can see and edit this board.'>Private</option>
                                        <option value="Workspace" title='Board members and admins can see and edit this board. Admins can close the board or remove members.'>Workspace</option>
                                    </Select>
                                    <div className='bi bi-caret-down-fill group pointer-events-none absolute top-2.5 right-2.5 size-4 text-black/50'></div>
                                </div>
                            </Field>
                            <button id='btn-submit' className={`text-black w-full ${(value === null || value === '') ? "opacity-60 bg-gray-400/70" : "bg-white hover:bg-hover-button"} py-2 px-3 my-3 rounded-md shadow`} disabled={(value === null || value === '')}>Create</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

const SideBar = ((props) => {
    const { boards, isVisible, isSmallScreen } = useVisibility();
    const { setIsVisible } = props;

    return (
        <div className={`sidebar text-list-bg-color sm:h-[calc(100vh-37px)] border-r border-border-color bg-navbar-app-bg-color ${isVisible === true ? "border-b" : ""}`}>
            <div id='sidebar-title' className={`px-gap py-1 items-center text-base border-y border-border-color ${isVisible === true ? "flex" :  isSmallScreen ? "flex" : "block text-center"}`}>
                <AnimatePresence>
                    {!isSmallScreen && (
                        <>
                            {isVisible && 
                                <span className='w-full text-xs lg:text-base'>Workspace</span>
                            }
                            <motion.div animate={{rotate: isVisible ? 0 : 180}}>
                                <button id='arrow-md' title={isVisible ? "Collapse sidebar" : "Expand sidebar"} className='bi bi-arrow-left-short p-1 text-end hover:rounded-lg hover:bg-hover-icon' onClick={() => setIsVisible(!isVisible)}></button>
                            </motion.div>
                        </>
                    )}
                    {isSmallScreen && (
                        <>
                            <span className='w-full'>Workspace</span>
                            <motion.div animate={{rotate: isVisible ? 0 : 180}}>
                                <button id='arrow-sm' className='bi bi-arrow-down-short' title={isVisible ? "Collapse sidebar" : "Expand sidebar"} onClick={() => setIsVisible(!isVisible)}></button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
            <motion.div id='boards-rows' style={{ display: isVisible ? 'block' : 'none' }} animate={{opacity: isVisible ? 1 : 0}} transition={{ duration: 0.3 }}>
                {isVisible && 
                    <div className='px-gap pt-2'>
                        <div className='flex'>
                            <div className='w-full mt-1 text-xs lg:text-base'>
                                Your boards 
                            </div>
                            <DropdownToggle title="Create Board"/>
                        </div>
                    </div>
                }
                {boards && boards.length > 0 && boards.map((board, index) => {
                    return (
                        <Board board={board} key={board._id}/>
                    )
                })}
                {isSmallScreen && 
                    <div className="pb-3"></div>
                }
            </motion.div>
        </div>
    )
});

SideBar.propTypes = {
    setIsVisible: PropTypes.func.isRequired,
};

export default SideBar;