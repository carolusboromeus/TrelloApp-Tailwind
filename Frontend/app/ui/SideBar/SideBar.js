'use client'

// import './SideBar.scss';
import Board from "@/app/ui/Board/Board";
import { CreateBoard } from '@/app/ui/buttons';
import exampleBackground from '@/app/assets/example-background.svg';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { CirclePicker } from 'react-color';
import { Input, Select, Label, Field, Description } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import clsx from 'clsx'

const DropdownToggle = (props) => {
    const {setBoards} = props;
    const [show, setShow] = useState(false);
    const [value, setValue] = useState(null);
    const dropdownRef = useRef(null);
    const inputBoardRef = useRef(null);
    const selectVisibilityRef = useRef(null);
    const [colorBackground, setColorBackground] = useState({
        hex: "#0079bf",
        hsl: {h: 201.9895287958115, s: 1, l: 0.37450980392156863, a: 1},
        hsv: {h: 201.9895287958115, s: 1, v: 0.7490196078431373, a: 1},
        oldHue: 250,
        rgb: {r: 0, g: 121, b: 191, a: 1},
        source: "hex"}
    );

    const colors = [
        "#0079bf",  
        "#0097a7", 
        "#009688",
        "#2d8634", 
        "#689f38", 
        "#4caf50", 
        "#ff6f00", 
        "#ff5722",
        "#f44336", 
        "#e91e63", 
        "#9c27b0", 
        "#673ab7", 
        "#3f51b5",
        "#344664", 
        "#795548", 
        "#607d8b"
    ];

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setValue(null);
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

        const value = await CreateBoard(formData, colorBackground);
        setBoards(value);
        inputBoardRef.current.value = '';
        selectVisibilityRef.current.value = "Workspace";
        setShow(false);
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
                <div className="absolute mt-2 w-72 bg-list-bg-color border rounded-md shadow-lg px-2 translate-x-8">
                    <div className='flex w-full px-3 py-3 text-sm'>
                        <div className='text-black font-semibold w-full text-center'>Create board</div>
                        <button className='text-end w-1/12' onClick={() => setShow(false)}>
                            <i className='bi bi-x text-black  hover:rounded-md hover:bg-hover-button p-1'></i>
                        </button>
                    </div>
                    <form action={handleAddNewBoard}>
                        <div className="mb-3 w-full">
                            <div id='example-background' className='bg-board-bg-color w-full h-full mb-3 rounded-md pb-3'>
                                <Image
                                    className=' block mx-auto'
                                    src={exampleBackground}
                                    alt="Example Background"
                                />
                            </div>
                            <label htmlFor='backgoround'>Background</label>
                            <CirclePicker
                                width='200' 
                                circleSize={20}
                                name='background'
                                colors={colors}
                                value={colorBackground}
                                onChange={(event) => {
                                    const example = document.getElementById("example-background");
                                    example.style.backgroundColor = event.hex;
                                    setColorBackground(event);
                                }}
                            />
                        </div>
                        <Field className="mb-3">
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
                    </form>
                </div>
            )}
        </div>
    )
}

DropdownToggle.propTypes = {
    setBoards: PropTypes.func.isRequired
};

const SideBar = ((props) => {
    const {boards, setBoards, setIsVisible, isVisible, isSmallScreen} = props;

    return (
        <div className="sidebar text-list-bg-color sm:h-[calc(100vh-37px)] border-r border-border-color">
            <div id='sidebar-title' className='px-gap py-1 items-center text-base border-y border-border-color flex'>
                <AnimatePresence>
                    {!isSmallScreen && (
                        <>
                            {isVisible && 
                                <span className='w-full'>Workspace</span>
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
            <motion.div id='boards-rows' animate={{opacity: isVisible ? 1 : 0}}>
                {isVisible && 
                    <div className='px-gap pt-2'>
                        <div className='flex'>
                            <div className='w-full mt-1'>
                                Your boards 
                            </div>
                            <DropdownToggle title="Create Board" setBoards={setBoards}/>
                        </div>
                    </div>
                }
                {boards && boards.length > 0 && boards.map((board, index) => {
                    return (
                        <Board board={board} key={board._id} setBoards={setBoards}/>
                    )
                })}
            </motion.div>
        </div>
    )
});

SideBar.propTypes = {
    boards: PropTypes.array.isRequired,
    setBoards: PropTypes.func.isRequired,
    setIsVisible: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired,
    isSmallScreen: PropTypes.bool.isRequired,
};

export default SideBar;