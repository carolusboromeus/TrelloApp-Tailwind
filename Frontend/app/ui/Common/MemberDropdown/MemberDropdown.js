'use client'

import { getFirstLetters } from "@/app/utilities/function";
import { useVisibility } from '@/app/home';
import { AddNewMemberCard, AssignMemberList, DeleteAssignMemberList, RemoveMemberCard } from "@/app/ui/buttons";

import {useState,useEffect,useRef} from "react";
import PropTypes from "prop-types";

const Member = (({member, board, code, assign, params, checklist, setBoardModal, setCardModal}) => {
    const { setBoards, socket } = useVisibility();

    const handleAddMamberCard = (async () => {
        if(code === "member-board" && !assign) {
            const value = await AddNewMemberCard(params, member);
            // setBoards(value.cardsR.columnsR.boardsR);
            // setBoardModal(value.cardsR.columnsR.newBoard);
            setCardModal(value.newCard);
            socket.emit('updateCard', value.newCard);
            socket.emit('updateAllBoard', value.cardsR.columnsR.newBoard);
        } else if(code === "member-card" && !assign) {
            const value = await RemoveMemberCard(params, member);
            // setBoards(value.cardsR.columnsR.boardsR);
            // setBoardModal(value.cardsR.columnsR.newBoard);
            setCardModal(value.newCard);
            socket.emit('updateCard', value.newCard);
            socket.emit('updateAllBoard', value.cardsR.columnsR.newBoard);
        } else if(code === "member-card" && assign === "list-assign") {
            const value = await AssignMemberList(params, member, checklist);
            // setBoards(value.cardsR.columnsR.boardsR);
            // setBoardModal(value.cardsR.columnsR.newBoard);
            setCardModal(value.newCard);
            socket.emit('updateCard', value.newCard);
            socket.emit('updateAllBoard', value.cardsR.columnsR.newBoard);
        }
    })

    return(
        <button className="flex items-center p-1 rounded-md mb-1 w-full text-left hover:bg-white" onClick={handleAddMamberCard}>
            <div className="mr-2" title={member?.name}>
                <div className="grid place-items-center w-7 h-7 bg-navbar-board-bg-color rounded-full" style={{backgroundColor: board.background.hex}}>
                    <div className="text-white text-xs font-bold cursor-default">
                        {getFirstLetters(member?.name)}
                    </div>
                </div>
            </div>
            <div className="w-full">{member?.name}</div>
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
    const {socket} = useVisibility();
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
            <div className="mx-2 py-2 pb-4">
                <input className="w-full py-1 pr-8 pl-3 rounded-md focus:outline focus:outline-blue-500" 
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
                    <div className='mt-4 mb-3 font-medium'>Card members</div>
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
                    <div className='mt-4 mb-3 font-medium'>Board members</div>
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
                    <div className="w-full h-16 bg-hover-button mt-2 mb-1 flex justify-center items-center rounded-md">
                        <div className="font-medium text-sm">No results</div>
                    </div>
                }
                {code === "list-assign" && checklist.member &&
                    <button className="mt-2 px-2 py-1 rounded-md w-full font-medium bg-slate-500 text-white hover:bg-hover-button hover:text-black" type="button" 
                    onClick={async () => {
                        const value = await DeleteAssignMemberList(params, checklist);
                        // setBoardModal(value.cardsR.columnsR.newBoard);
                        setCardModal(value.newCard);
                        socket.emit('updateCard', value.newCard);
                        socket.emit('updateAllBoard', value.cardsR.columnsR.newBoard);
                    }}>Remove member</button>
                }
            </div>
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