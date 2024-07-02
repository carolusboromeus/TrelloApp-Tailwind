'use client'

import { UpdateBoard, UpdateVisibility } from '@/app/ui/buttons';
import { useVisibility } from '@/app/home';
import MemberModal from '@/app/ui/content-board/ShareModal/MemberModal';
import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from '@/app/utilities/constant';
import { getFirstLetters } from '@/app/utilities/function';

import { useState, useEffect, useRef} from 'react';
import { Input } from '@headlessui/react';
import clsx from 'clsx'
import PropTypes from 'prop-types';

const DropdownToggle = (props) => {
    const { boards, notification, socket} = useVisibility();
    const {board, setBoard} = props;
    const [show, setShow] = useState(false);
    const dropdownRef = useRef(null);

    const contents = [
        {
            id: "01",
            name: 'Private', 
            description: 'Only board admins can see and edit this board.'
        },
        {
            id: "02",
            name: 'Workspace', 
            description: 'Only board members can see and edit this board. /n Admins can close the board or remove members.'
        },
    ];

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
    
    return (
        <div className={`${show === true ? "relative" : "static"} sm:flex text-list-bg-color`} ref={dropdownRef}>
            {/* Dropdown toggle button */}
            <button className="p-1 hover:bg-hover-icon hover:rounded-md" onClick={() => setShow(true)}>
                {board.visibility === "Private" &&
                    <i className='bi bi-lock icon'></i>
                }
                {board.visibility === "Workspace" &&
                    <i className='bi bi-people icon'></i>
                }
            </button>

            {/* Dropdown menu */}
            {show && (
                <div className="absolute left-0 top-0 mt-8 w-72 bg-list-bg-color border rounded-md shadow-lg px-2">
                    <div className='flex w-full px-3 py-3 text-sm'>
                        <div className='text-black font-semibold w-full text-center'>Change visibility</div>
                        <button className='text-end w-1/12' onClick={() => setShow(false)}>
                            <i className='bi bi-x text-black  hover:rounded-md hover:bg-hover-button p-1'></i>
                        </button>
                    </div>
                    <div className='mb-2 cursor-pointer'>
                        {contents.map((content) => {
                            return (
                                <div key={content.id} className='text-black px-2 py-2 hover:bg-hover-button hover:rounded-md' onClick={async () => {
                                    const value = await UpdateVisibility(content.name, board, boards, notification);
                                    // setBoards(value.boardsR);
                                    setBoard(value.newBoard);
                                    socket.emit("updateBoard", value.newBoard);
                                    
                                }}>
                                    <div className='text-sm font-normal'>
                                        <i className={`${content.name === "Private" ? "bi bi-lock" : "bi bi-people"} mr-3`}></i>{content.name}{board.visibility === content.name && <i className='bi bi-check float-end'></i>}
                                    </div>
                                    <div className='text-xs text-black/70 mt-1'>{content.description}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

DropdownToggle.propTypes = {
    board: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
    setBoards: PropTypes.func.isRequired
};

const BoardBar = (props) => {
    const { setBoards, socket } = useVisibility();
    
    const {board, setBoard} = props;
    const [modalMember, setModalMember] = useState(false);

    const onModalAction = (type) => {
        if(type === MODAL_ACTION_CLOSE){
            setModalMember(false);
        }
        if(type === MODAL_ACTION_CONFIRM){
            setModalMember(false);
        }
    }

    //Change name board
    const [titleBoard, setTitleBoard] = useState("");
    const [isFirstClick, setIsFirstClick] = useState(true);
    const inputTitleRef = useRef(null);

    useEffect(() => {
        if(board !== null && board.title) {
            setTitleBoard(board.title);
            inputTitleRef.current.style.width = (board.title.length + 2.2) * 8 + "px";
        }
    }, [board, inputTitleRef])

    const selectAllText = (event) => {
        setIsFirstClick(false);
        
        if(isFirstClick) {
            event.target.style.width = (event.target.value.length + 2.2) * 8 + "px";
            event.target.select();
        } else {
            inputTitleRef.current.setSelectionRange(titleBoard.length, titleBoard.length);
        }
    }

    const handleClickOutside = async () => {
        //Do something...
        setIsFirstClick(true);

        const newBoard = {
            ...board,
            title: titleBoard,
            _destroy: false,
        }

        const value = await UpdateBoard(newBoard);
        setBoard(newBoard);
        socket.emit('updateBoard', newBoard);
        socket.emit('updateBoards', value);
        setBoards(value);
    }

    if(board){
        return(
            <nav className="navbar-board px-gap bg-navbar-app-bg-color mb-gap border-y border-border-color">
                <div className='grid grid-cols-2 py-1'>
                    <div className='-ml-1 flex items-center'>
                        <Input
                            className={clsx(
                                'appearance-none w-auto rounded-md bg-inherit py-2 px-2 text-list-bg-color font-bold leading-tight',
                                'focus:outline-none focus:shadow-xl focus:bg-list-bg-color focus:text-black focus:font-medium focus:w-auto'
                            )}
                            type="text"
                            name='title' 
                            autoComplete='false' 
                            spellCheck='false'
                            value={titleBoard}
                            onClick={selectAllText}
                            onChange={(event) => {
                                setTitleBoard(event.target.value);
                                event.target.style.width = (event.target.value.length + 2.2) * 8 + "px";
                            }}
                            onBlur={handleClickOutside}
                            onMouseDown={(e) => e.preventDefault()}
                            ref={inputTitleRef}
                        />
                        <DropdownToggle board={board} setBoard={setBoard} setBoards={setBoards} />
                    </div>
                    <div className='content-center'>
                        <div className='flex float-right'>
                            <div className='flex'>
                                {board.member && board.member.length > 0 && board.member.toReversed().map((member, index) => {
                                    return (
                                        <div className="-mr-2" title={member.name} key={member._id}>
                                            <div className="grid place-items-center p-1 w-7 h-7 rounded-full bg-navbar-board-bg-color border-2 border-list-bg-color" style={{backgroundColor: `rgb(${(board.background.r)}, ${board.background.g}, ${board.background.b})`}}>
                                                <div className='text-list-bg-color text-xs font-bold cursor-default'>
                                                    {getFirstLetters(member.name)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            {board.visibility === "Workspace" && 
                                <>
                                    <button className='ml-4 bg-list-bg-color p-1 rounded-md hover:bg-hover-icon hover:text-white' onClick={() => setModalMember(true)}>
                                        <i className='bi bi-person-add mr-1'></i>Share
                                    </button>
                                    <MemberModal
                                        onAction={onModalAction}
                                        show={modalMember}
                                        board={board}
                                        setBoard={setBoard}
                                    />
                                </>
                            }
                        </div>
                    </div>
                </div>
            </nav>
        )
    }
}

BoardBar.propTypes = {
    board: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
};

export default BoardBar;