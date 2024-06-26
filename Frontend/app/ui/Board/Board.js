'use client'

import { UpdateBoard } from '@/app/ui/buttons';
import ConfirmModal from '@/app/ui/Common/ConfirmModal';
import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from '@/app/utilities/constant';
import { useVisibility } from '@/app/home';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react';
import PropTypes from 'prop-types';

const Board = ((props) => {
    const { boards, notification, setBoards, socket } = useVisibility();
    const { board } = props;
    // const {activeLabel, setActiveLabel, index} = props;
    const [showIcon, setShowIcon] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false); //show modal delete
    const router = useRouter();
    const pathname = usePathname()

    const onModalAction = (async (type) => {
        if(type === MODAL_ACTION_CLOSE){
            //Do nothing
        }
        if(type === MODAL_ACTION_CONFIRM){
            //Remove a column
            const newBoard = {
                ...board,
                _destroy: true
            }

            const value = await UpdateBoard(newBoard, boards, notification);
            setBoards(value);
            socket.emit("updateBoards", value);
            document.getElementsByClassName("trello-master")[0].style.backgroundColor = "";
            document.getElementsByClassName("navbar-app")[0].style.backgroundColor = "";
            // document.getElementsByClassName("navbar-board")[0].style.backgroundColor = "";
            document.getElementsByClassName("sidebar")[0].style.backgroundColor = "";
            router.push('/');
        }

        toggleModel();
    })

    const toggleModel = () => {
        setShowModalDelete(!showModalDelete);
    }

    return (
        <>
            <button className={`flex px-gap py-1 w-full ${pathname.split("/").reverse()[1] === board._id.slice(6 ,14) ? "bg-gray-500/50" : null} hover:bg-hover-sidebar`}  
                onMouseEnter={() => setShowIcon(true)} 
                onMouseLeave={() => setShowIcon(false)}
            >
                <div className='w-full flex items-center lg:p-1'>
                    <div className="w-4 h-3 lg:w-6 lg:h-5 mr-2 rounded border border-black/50" style={{backgroundColor: board.background.hex}}></div>
                    <Link href={`/b/${board._id.slice(6, 14)}/${board.title.toLowerCase().replace(/ /g, "-")}`} className='w-full text-left'>
                        <label className="board-label cursor-pointer text-xs lg:text-base">{board.title}</label>
                    </Link>
                </div>
                {showIcon && 
                    <div className="lg:p-1 rounded-md hover:bg-hover-button" onClick={() => toggleModel()}>
                        <i className='bi bi-trash icon text-xs'></i>
                    </div>
                }
            </button>

            <ConfirmModal
                show={showModalDelete}
                title={"Remove a board"}
                content={`Are you sure to remove this board: <b>${board.title}</b>`}
                onAction={onModalAction}
            />
        </>
    )
})

Board.propTypes = {
    board: PropTypes.object.isRequired,
};

export default Board;   