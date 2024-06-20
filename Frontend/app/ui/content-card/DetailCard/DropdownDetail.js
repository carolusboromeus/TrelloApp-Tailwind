'use client'

import MemberDropdown from '@/app/ui/Common/MemberDropdown/MemberDropdown';

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export const MemberDropdownToggle = (props) => {
    const {params, code, board, card, setBoard, setCard} = props;
    const [show, setShow] = useState(false);
    const dropdownRef = useRef(null);

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
        if(show){
            const container = document.getElementsByClassName("ql-container");
            for (const element of container) {
                element.style.position = "static";
            }
        } else {
            const container = document.getElementsByClassName("ql-container");
            for (const element of container) {
                element.style.position = "relative";
            }
        }
    }, [show])

    const toggleDropdown = () => {
        setShow(!show);
    };

    return (
        <div className={`${show ? 'relative' : 'static'} sm:flex`} ref={dropdownRef}>
            {/* Dropdown toggle button */}
            {code && code === 'member-dropdown' ?
                <button
                    onClick={toggleDropdown}
                    title="Add Member"
                    className="text-left px-2 py-1 rounded-md sm:w-full bg-white hover:bg-hover-button/30"
                >
                    <i className='bi bi-person text-black mr-2'></i>
                    Member
                </button>
                
                :
            
                <button 
                    onClick={toggleDropdown}
                    title="Add Member"
                    className='w-8 h-8 bg-slate-400/50 hover:bg-slate-500/50 rounded-full'
                >
                    <i className='bi bi-plus-lg'></i>
                </button>
            }
            {/* Dropdown menu */}
            {show && (
                <div className="absolute top-0 left-0 w-72 bg-list-bg-color border rounded-md shadow-lg px-2 translate-y-8">
                    <div className='flex w-full px-3 py-3 text-sm'>
                        <div className='text-black font-semibold w-full text-center'>Members</div>
                        <button className='text-end w-1/12' onClick={() => setShow(false)}>
                            <i className='bi bi-x text-black  hover:rounded-md hover:bg-hover-button p-1'></i>
                        </button>
                    </div>

                    {/* Dropdown Content */}
                    <MemberDropdown
                        params={params}
                        memberDropdown={show}
                        board={board}
                        card={card}
                        setBoardModal={setBoard}
                        setCardModal={setCard}
                    />
                </div>
            )}
        </div>
    )
}

MemberDropdownToggle.propTypes = {
    params: PropTypes.object.isRequired,
    code: PropTypes.string.isRequired,
    board: PropTypes.object.isRequired,
    card: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
    setCard: PropTypes.func.isRequired,

    setBoards: PropTypes.func.isRequired,
};

export const FileDropdownToggle = (props) => {
    const {isFile, fileRef, setIsFile, handleChangeUploadFile, handleUploadFile} = props;
    const [show, setShow] = useState(false);
    const [dragging, setDragging] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShow(false);
                setIsFile(undefined);
                if(fileRef !== null && fileRef.current !== null){
                    fileRef.current.value = null;
                }
            }
        };
    
        document.addEventListener('mousedown', handleOutsideClick);
    
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const toggleDropdown = () => {
        setShow(!show);
        setIsFile(undefined);
        if(fileRef !== null && fileRef.current !== null){
            fileRef.current.value = null;
        }
    };

    const handleClick = () => {
        if(fileRef !== null && fileRef.current !== null){
            fileRef.current.click();
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragging(false);
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
    
        const files = Array.from(e.dataTransfer.files);
        setIsFile(files[0]);
    };

    return (
        <div className={`${show ? 'relative' : 'static'} mt-2 sm:flex"`} ref={dropdownRef}>
            {/* Dropdown toggle button */}
            <button
                onClick={toggleDropdown}
                title="Attachment File"
                className="text-left px-2 py-1 rounded-md sm:w-full bg-white hover:bg-hover-button/30"
            >
                <i className='fa fa-paperclip text-black mr-2'></i>
                Attachment 
            </button>

            {/* Dropdown menu */}
            {show && (
                <div className="absolute top-0 left-0 w-72 bg-list-bg-color border rounded-md shadow-lg px-2 translate-y-8">
                    <div className='flex w-full px-3 py-3 text-sm'>
                        <div className='text-black font-semibold w-full text-center'>Attach a file from your computer</div>
                        <button className='text-end w-1/12' onClick={toggleDropdown}>
                            <i className='bi bi-x text-black  hover:rounded-md hover:bg-hover-button p-1'></i>
                        </button>
                    </div>

                    {/* Dropdown Content */}
                    <div className='bg-white px-2 py-3 rounded-md'>
                        <div className={`cursor-pointer group/input flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${dragging ? 'border-blue-500 bg-blue-100' : ''} hover:border-blue-500 hover:bg-blue-100`}
                            onClick={handleClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="text-center">
                                <div className="flex text-sm leading-6 text-gray-600">
                                    <label
                                        className={`cursor-pointer relative rounded-md font-semibold text-indigo-600 group-hover/input:border-blue-500 group-hover/input:bg-blue-100`}
                                    >
                                        {isFile === undefined && 
                                            <span>Upload a file</span>
                                        }
                                        {isFile !== undefined && 
                                            <span>{isFile.name}</span>
                                        }
                                    </label>
                                    <input id="file-upload" 
                                        className="sr-only" 
                                        name="file-upload" 
                                        type="file" 
                                        onChange={handleChangeUploadFile}
                                        ref={fileRef}
                                        encType="multipart/form-data"
                                    />
                                    {isFile === undefined && 
                                        <p className="pl-1">or drag and drop</p>
                                    }
                                </div>
                                {/* <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p> */}
                            </div>
                        </div>
                        {/* <input type="file" className='w-full' 
                            onChange={handleChangeUploadFile}
                            ref={fileRef}
                            encType="multipart/form-data"
                        /> */}
                    </div>
                    <button type="submit" className='w-full mt-3 mb-3 px-3 py-1 font-bold rounded-md bg-blue-600 text-white hover:bg-hover-button hover:text-black badge'onClick={handleUploadFile}>Insert</button>
                </div>
            )}
        </div>
    )
}

FileDropdownToggle.propTypes = {
    isFile: PropTypes.array,
    fileRef: PropTypes.object.isRequired,
    setIsFile: PropTypes.func.isRequired,
    handleChangeUploadFile: PropTypes.func.isRequired,
    handleUploadFile: PropTypes.func.isRequired,

    setBoards: PropTypes.func.isRequired
};