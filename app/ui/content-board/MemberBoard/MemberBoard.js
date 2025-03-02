'use client'

import { UpdateMember } from '@/app/ui/buttons';
import ConfirmModal from '@/app/ui/Common/ConfirmModal';
import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from '@/app/utilities/constant';
import { getFirstLetters } from '@/app/utilities/function';

import "./MemberBoard.scss";
import {useState, useEffect, useRef} from 'react';
import Form from 'react-bootstrap/Form';
import PropTypes from 'prop-types';

const MemberBoard = ((props) => {

    const {member, board, setBoard} = props;

    const [memberType, setMemberType] = useState("");
    const selectMemberTypeRef = useRef(null);

    useEffect(() => {
        if(selectMemberTypeRef.current) {
            setMemberType(member.type);
            selectMemberTypeRef.current.value = member.type;
        }
    },[member.type])

    const handleChangeMemberType = (async (value) => {
        
        if(value === "Remove"){
            setShowModalDelete(true);
            const shareModal = document.getElementById("share-modal");
            shareModal.style.display = "none";
        } else {
            const newMember = {
                ...member,
                type: value,
                _destroy: false,
            };

            setMemberType(value);
            
            const valueR = await UpdateMember(newMember, board);
            setBoard(valueR);
        }
    })

    const [showModalDelete, setShowModalDelete] = useState(false); //show modal delete
    
    const toggleModel = () => {
        setShowModalDelete(!showModalDelete);
    }

    const onModalAction = async (type) => {
        if(type === MODAL_ACTION_CLOSE){
            //Do nothing
            if(selectMemberTypeRef.current) {
                setMemberType(member.type);
                selectMemberTypeRef.current.value = member.type;
            }

            const shareModal = document.getElementById("share-modal");
            shareModal.style.display = "";
        }
        if(type === MODAL_ACTION_CONFIRM){
            //Remove a member
            const newMember = {
                ...member,
                _destroy: true
            }

            const value = await UpdateMember(newMember, board);
            setBoard(value);

            const shareModal = document.getElementById("share-modal");
            shareModal.style.display = "";
        }

        toggleModel();
    }

    return (
        <>
            <div className="member-list">
                <div className="member-photo" title={member.name}>
                    <div className="photo" style={{backgroundColor: board.background.hex}}>
                        <div>
                            {getFirstLetters(member.name)}
                        </div>
                    </div>
                </div>
                <div className="member-name">{member.name}</div>
                <Form.Select className="member-type" size="sm" 
                    ref={selectMemberTypeRef}
                    onChange={(event) => handleChangeMemberType(event.target.value)}
                    value={memberType}
                >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                    <option value="Remove">Remove from board</option>
                </Form.Select>
            </div>
        
            <ConfirmModal
                show={showModalDelete}
                title={"Remove a member"}
                content={`Are you sure to remove this member: <b>${member.name}</b>`}
                onAction={onModalAction}
            />
        </>
    )
});

MemberBoard.propTypes = {
    member: PropTypes.object.isRequired,
    board: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired
};

export default MemberBoard;