'use client'

import { UpdateBoard, UpdateVisibility } from '@/app/ui/buttons';
import { useVisibility } from '@/app/home';
import MemberModal from '@/app/ui/content-board/ShareModal/MemberModal';
import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from '@/app/utilities/constant';
import { getFirstLetters } from '@/app/utilities/function';

import './BoardBar.scss';
import { useState, useEffect, useRef} from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const BoardBar = (props) => {
    const { setBoards } = useVisibility();

    const {board, setBoard} = props;
    const [show, setShow] = useState(false);
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
    const [showInputTitle, setShowInputTitle] = useState(false);
    const inputTitleRef = useRef(null);

    useEffect(() => {
        if(showInputTitle){
            if(board !== null && board.title) {
                setTitleBoard(board.title);
            }
    
            if(inputTitleRef.current) {
                inputTitleRef.current.style.width = (board.title.length + 2.2) * 8 + "px";
                inputTitleRef.current.select();
            }
        }
    }, [board, showInputTitle])

    const selectAllText = (event) => {
        setIsFirstClick(false);
        
        if(isFirstClick) {
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
        setBoards(value);
        setShowInputTitle(false);
    }

    if(board){
        return(
            <nav className="navbar-board">
                <Row>
                    <Col sm={6} className='section'>
                        {!showInputTitle &&
                            <button className="name-board" onClick={() => setShowInputTitle(true)}>{board.title}</button>
                        }
                        {showInputTitle &&
                            <input 
                                size="md"
                                type="text"
                                value={titleBoard}
                                className='input-board'
                                onClick={selectAllText}
                                onChange={(event) => {
                                    setTitleBoard(event.target.value);
                                    event.target.style.width = (event.target.value.length + 2.2) * 8 + "px";
                                }}
                                spellCheck="false"
                                onBlur={handleClickOutside}
                                onMouseDown={(e) => e.preventDefault()}
                                ref={inputTitleRef}
                            />
                        }
                        <Dropdown className='modal-dropdown' show={show} onToggle={(isOpen) => setShow(isOpen)}>
                            <Dropdown.Toggle className='modal-dropdown-button' size='sm' title='Change visibility'>
                                {board.visibility === "Private" &&
                                    <i className='bi bi-lock icon'></i>
                                }
                                {board.visibility === "Workspace" &&
                                    <i className='bi bi-people icon'></i>
                                }
                            </Dropdown.Toggle>
                            <Dropdown.Menu className='modal-dropdown-body'>
                                <Dropdown.Header className='modal-header'>Attach a file from your computer<button className='bi bi-x' onClick={() => setShow(false)}></button></Dropdown.Header>
                                <Dropdown.Item eventKey="1" onClick={async () => {
                                    const value = await UpdateVisibility("Private", board);
                                    setBoards(value.boardsR);
                                    setBoard(value.newBoard);
                                }}>
                                    <div className='icon-group'>
                                        <i className='bi bi-lock icon'></i>Private{board.visibility === "Private" && <i className='bi bi-check'></i>}
                                    </div>
                                    <div className='information'>Only board admins can see and edit this board.</div>
                                </Dropdown.Item>
                                <Dropdown.Item eventKey="2" style={{marginTop: '5px'}} onClick={async () => {
                                    const value = await UpdateVisibility("Workspace", board);
                                    setBoards(value.boardsR);
                                    setBoard(value.newBoard);
                                }}>
                                    <div className='icon-group'>
                                        <i className='bi bi-people icon'></i>Workspace{board.visibility === "Workspace" && <i className='bi bi-check'></i>}
                                    </div>
                                    <div className='information'>Only board members can see and edit this board.<br></br>Admins can close the board or remove members.</div>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col sm={6}>
                        <div className='display-right'>
                            <div className='display-photo'>
                                {board.member && board.member.length > 0 && board.member.toReversed().map((member, index) => {
                                    return (
                                        <div className="member-photo" title={member.name} key={member._id}>
                                            <div className="photo" style={{backgroundColor: board.background.hex}}>
                                                <div>
                                                    {getFirstLetters(member.name)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            {board.visibility === "Workspace" && 
                                <>
                                    <Button className='badge group-btn' onClick={() => setModalMember(true)}>
                                        <i className='bi bi-person-add icon'></i>Share
                                    </Button>
                                    <MemberModal
                                        onAction={onModalAction}
                                        show={modalMember}
                                        board={board}
                                        onHide={() => setModalMember(false)}
                                        setBoard={setBoard}
                                    />
                                </>
                            }
                        </div>
                    </Col>
                </Row>
            </nav>
        )
    }
}

BoardBar.propTypes = {
    board: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
};

export default BoardBar;