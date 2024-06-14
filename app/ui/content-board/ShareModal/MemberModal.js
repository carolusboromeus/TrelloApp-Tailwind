'use client'

import { getMember } from '@/app/lib/api';
import { useVisibility } from '@/app/home';
import { AddNewMember } from '@/app/ui/buttons';
import MemberBoard from '@/app/ui/content-board/MemberBoard/MemberBoard';
import { MODAL_ACTION_CLOSE } from '@/app/utilities/constant';

import './MemberModal.scss';
import { useState, useEffect, useRef} from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';

const MemberModal = (props) => {
    const {board, show, onAction, setBoard} = props;
    const { setBoards } = useVisibility();
    const [member, setMember] = useState([]);

    useEffect(() => {
        if(show){
            async function getDataMember (){
                const data = await getMember();
                setMember(data);
            }

            getDataMember();
        }
    }, [show])

    const renderMenuItemChildren = (option, props, index) => {
        return (
            <div>
                {option.t}
            </div>
        );
    };

    const inputMemberRef = useRef(null);
    const [valueMember, setValueMember] = useState("");

    const handleAddMemberBoard = (async() => {   
        if(valueMember){

            const value = await AddNewMember(valueMember, board);
            setBoards(value.boardsR);
            setBoard(value.newBoard);
            
            inputMemberRef.current.clear();
        }
    })

    return (
        <Modal id='share-modal' show={show} onHide={() => onAction(MODAL_ACTION_CLOSE)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Share board</Modal.Title>
            </Modal.Header>
            <Modal.Body id='share-modal-body'>
                <div className='section'>
                    <div id='select-member'>
                        <Typeahead
                            id="my-typeahead-id"
                            // defaultSelected={["3"]}
                            name='Member'
                            placeholder='Name'
                            onChange={(selected) => {
                                // Handle selections...
                                // console.log(selected);
                                setValueMember(selected[0])
                            }}
                            labelKey={option => `${option.t}`}
                            options={member}
                            renderMenuItemChildren={renderMenuItemChildren}
                            ref={inputMemberRef}
                        />
                    </div>
                    <div id='btn-submit'>
                        <Button onClick={() => handleAddMemberBoard()}>Share</Button>
                    </div>
                </div>
                {board.member && board.member.length > 0 && board.member.map((member, index) => {
                    return (
                        <MemberBoard
                            key={member._id}
                            member={member}
                            board={board}
                            setBoard={setBoard}
                        />
                    )
                })}
            </Modal.Body>
            {/* <Modal.Footer>
                <Button variant="secondary" onClick={() => onAction(MODAL_ACTION_CLOSE)}>
                    Close
                </Button>
                <Button variant="primary" onClick={() => onAction(MODAL_ACTION_CONFIRM)}>
                    Confirm
                </Button>
            </Modal.Footer> */}
        </Modal>
    )
}

MemberModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onAction: PropTypes.func.isRequired,
    board: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
};

export default MemberModal;