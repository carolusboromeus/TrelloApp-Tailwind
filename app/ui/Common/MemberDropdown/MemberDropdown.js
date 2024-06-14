'use client'

import { getFirstLetters } from "@/app/utilities/function";
import { AddNewMemberCard, AssignMemberList, DeleteAssignMemberList, RemoveMemberCard } from "@/app/ui/buttons";

import "./MemberDropdown.scss"
import {useState,useEffect,useRef} from "react";
import Form from "react-bootstrap/Form";
import PropTypes from "prop-types";

const Member = (({member, board, code, assign, params, checklist, setBoardModal, setCardModal}) => {

    const handleAddMamberCard = (async () => {
        if(code === "member-board" && !assign) {
            const value = await AddNewMemberCard(params, member);
            setBoardModal(value.cardsR.columnsR.newBoard);
            setCardModal(value.newCard);
        } else if(code === "member-card" && !assign) {
            const value = await RemoveMemberCard(params, member);
            setBoardModal(value.cardsR.columnsR.newBoard);
            setCardModal(value.newCard);
        } else if(code === "member-card" && assign === "list-assign") {
            const value = await AssignMemberList(params, member, checklist);
            setBoardModal(value.cardsR.columnsR.newBoard);
            setCardModal(value.newCard);
        }
    })

    return(
        <button id="member-dropdown" onClick={handleAddMamberCard}>
            <div className="member-photo" title={member?.name}>
                <div className="photo" style={{backgroundColor: board.background.hex}}>
                    <div>
                        {getFirstLetters(member?.name)}
                    </div>
                </div>
            </div>
            <div className="member-name">{member?.name}</div>
            {code === "member-card" && !assign &&
                <i className="bi bi-x"></i>
            }
        </button>
    )
})

Member.propTypes = {
    member: PropTypes.object,
    board: PropTypes.object.isRequired,
    code: PropTypes.string,
    assign: PropTypes.string,
    params: PropTypes.object.isRequired,
    checklist: PropTypes.object,
    setBoardModal: PropTypes.func,
    setCardModal: PropTypes.func,
};

const MemberDropdown = ((props) => {
    
    const {checklist, memberDropdown, code, params, board, card, setBoardModal, setCardModal} = props;

    // useEffect(() => {
    //     const fetchData = async () => {
    //         if(params) {
    //             const data = await fetchAllData(params);
    //             if(data){
    //                 setBoard(data.board);
    //                 setCard(data.card);
    //             }
    //         }
    //     };
    
    //     fetchData();
    // }, [params, board, card]);

    const [searchQuery, setSearchQuery] = useState("");
    const inputSearchRef = useRef(null);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Filter members board based on search query
    const filteredMembersBoard = board?.member?.filter((member) =>
        {
            for (const element of card.member) {
                
                if(element.memberId === member._id){
                   return false;
                } 
            }

            return member.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
    );

    const filteredMembersCard = card?.member?.filter((member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if(memberDropdown) {
            setSearchQuery("");
            if(inputSearchRef.current !== null){
                inputSearchRef.current.focus();
            }
        }
    }, [memberDropdown])

    if(card !== null) {
        return (
            <>
                <Form.Control id="input-search-member" 
                    size="sm" 
                    type="text" 
                    placeholder="Search members"
                    ref={inputSearchRef}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoComplete="false"
                    spellCheck="false"
                />
                {card.member.length > 0 && filteredMembersCard.length > 0 &&
                    <div className='label-title'>Card members</div>
                }
                {card.member.length > 0 && filteredMembersCard.map((member) => {
                    if(checklist !== undefined && checklist.member && member.name === checklist.member.name){
                        return null
                    } else {
                        return (
                            <Member
                                key={member._id}
                                member={member}
                                board={board}
                                code="member-card"
                                assign={code}
                                params={params}
                                checklist={checklist}
                                setBoardModal={setBoardModal}
                                setCardModal={setCardModal}
                            />
                        )
                    };
                })}
                {code !== "list-assign" && filteredMembersBoard.length > 0 &&
                    <div className='label-title'>Board members</div>
                }
                {code !== "list-assign" && filteredMembersBoard.map((member) => {
                    return (
                        <Member
                            key={member._id}
                            member={member}
                            board={board}
                            code="member-board"
                            params={params}
                            setBoardModal={setBoardModal}
                            setCardModal={setCardModal}
                        />
                    )})
                }
                {filteredMembersCard.length === 0 && filteredMembersBoard.length === 0 &&
                    <div id="not-found-member"><div>No results</div></div>
                }
                {code === "list-assign" && checklist.member &&
                    <button id="btn-remove-assign" type="button" 
                    onClick={async () => {
                        const value = await DeleteAssignMemberList(params, checklist);
                        setBoardModal(value.cardsR.columnsR.newBoard);
                        setCardModal(value.newCard);
                    }}>Remove member</button>
                }
            </>
        )
    }
})

MemberDropdown.propTypes = {
    checklist: PropTypes.object,
    memberDropdown: PropTypes.bool,
    code: PropTypes.string,
    params: PropTypes.object.isRequired,
    board: PropTypes.object.isRequired,
    card: PropTypes.object.isRequired,
    setBoardModal: PropTypes.func.isRequired,
    setCardModal: PropTypes.func.isRequired
};

export default MemberDropdown;