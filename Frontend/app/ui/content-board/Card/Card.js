import { UpdateCard } from '@/app/ui/buttons';
import { useVisibility } from '@/app/home';
import { getFirstLetters, adjustHeight } from '@/app/utilities/function';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import dateFormat from "dateformat";
import { useRouter } from 'next/navigation'
import PropTypes from 'prop-types'

const DetailCardModal = React.lazy(() => import('@/app/ui/content-card/DetailCard/DetailCardModal'));

const Card = (props) => {
    const {card, cards, columns, board, params, setBoard, setColumns} = props;
    const { setBoards, socket } = useVisibility();
    const router = useRouter();
    const [isShown, setIsShown] = useState(false);

    const [isShowEditCard, setIsShowEditCard] = useState(false); //show input
    const [valueTextArea, setValueTextArea] = useState(''); //to set value in variable valueTextArea
    const textAreaRef = useRef(null); //to get value in the form of object

    useEffect(() => {
        if(isShowEditCard === true && textAreaRef) {
            textAreaRef.current.select();
        }
    }, [isShowEditCard])

    const showEdit = () => {
        setIsShowEditCard(true);
        setValueTextArea(card.title);
    }

    const handleEditCard = async () => {
        //validate
        if(!valueTextArea){
            setIsShowEditCard(false);
            return;
        }
        
        const newCard = {
            ...card,
            title: valueTextArea,
        }

        const value = await UpdateCard(newCard, cards, columns, board);
        // setBoards(value.columnsR.boardsR);
        setBoard(value.columnsR.newBoard);
        setColumns(value.columnsR.ncols);
        socket.emit('updateBoard', value.columnsR.newBoard);
        setIsShown(false);
        setIsShowEditCard(false);
    }

    const handleDeleteCard = async () => {
        const newCard = {
            ...card,
            _destroy: true
        }

        const value = await UpdateCard(newCard, cards, columns, board);
        // setBoards(value.columnsR.boardsR);
        setBoard(value.columnsR.newBoard);
        setColumns(value.columnsR.ncols);
        socket.emit('updateBoard', value.columnsR.newBoard);
    }

    const checkList = () => {
        let count = 0;
        for(const element of card.checklist) {
            if(element.check === true) {
                count++;
            }
        }

        return count;
    }

    const dueDateList = () => {
        let temp = null;
        card.checklist.forEach((element) => {
            if(temp !== null && element.check === false) {
                if(temp > element.date && element.check === false) {
                    temp = element.date;
                }
            } else if(temp === null && element.check === false){
                temp = element.date;
            }
        });

        if(temp !== null) {
            const date = dateFormat(temp, "d mmm");
            return " • " + date;
        }
    }

    return (
        <>
            {isShowEditCard === false &&
                <div className="bg-white p-gap rounded-md shadow cursor-pointer mb-gap break-words mx-1 ml-3"
                    onMouseEnter={() => setIsShown(true)}
                    onMouseLeave={() => setIsShown(false)}
                >
                    {card.image && 
                        <img className="card-cover block w-[calc(100%+2*10px)] -mt-gap mb-gap -ml-gap rounded-t-md" src={card.image} alt="Cover"
                            onMouseDown={event => event.preventDefault()}
                            onClick={() => router.push(`/c/${card.boardId.slice(6, 14)}/${card._id.slice(6, 14)}/${card.title.toLowerCase().replace(/ /g, "-")}`)}
                        />
                    }
                    <div id='text' className='flex'>
                        <div className='w-full' onClick={() => router.push(`/c/${card.boardId.slice(6, 14)}/${card._id.slice(6, 14)}/${card.title.toLowerCase().replace(/ /g, "-")}`)}>
                            <p className='card-title'>{card.title}</p>
                            <div className='grid'>
                                <div className=''>
                                    <div className='flex items-center'>
                                        {(card.description !== null && card.description.ops.length > 0 ) && 
                                            <i className='bi-justify-left icon-description mr-1' title="This card has a description"></i>
                                        }
                                        {card.comments.length > 0 && 
                                            <div className='flex ml-2 items-center' title="Comments">
                                                <i className='bi-chat-left icons'></i>
                                                <div className='text-sm ml-1 mr-1'>{card.comments.length}</div> 
                                            </div>   
                                        }
                                        {card.files.length > 0 && 
                                            <div className='flex ml-2 items-center' title="Attachments">
                                                <i className='bi-paperclip icons'></i>
                                                <div className='text-sm ml-1 mr-1'>{card.files.length}</div> 
                                            </div>   
                                        }
                                        {card.checklist.length > 0 && 
                                            <div className='flex ml-2 items-center' title="Checklist items">
                                                <i className='bi-check2-square icons'></i>
                                                <div className='text-sm ml-1 mr-1'>{checkList()}/{card.checklist.length}{dueDateList()}</div> 
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className=''>
                                    <div className={`${isShown === true ? "-mr-4" : ""}`}>
                                        {card && card.member.length > 0 &&
                                            <div className='flex sm:float-end'>
                                                {card.member && card.member.length > 0 && card.member.map((member, index) => {
                                                    return (
                                                        <div className="member-photo" title={member.name} key={member._id}>
                                                            <div className="grid place-items-center w-6 h-6 bg-navbar-board-bg-color rounded-full border-2 border-list-bg-color" style={{backgroundColor: `rgb(${(board.background.r)}, ${board.background.g}, ${board.background.b})`}}>
                                                                <div className='text-list-bg-color text-xs font-bold cursor-default'>
                                                                    {getFirstLetters(member.name)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='text-right float-end'>
                            {isShown === true && <button className='bi-pencil-square icon text-end edit' onClick={() => showEdit()}></button>}
                        </div>
                    </div>
                    {params && params.card_id !== null && params.card_id === card._id.slice(6, 14) &&
                        <Suspense fallback={<></>}>
                            <DetailCardModal
                                params={params}
                            />
                        </Suspense>
                    }
                </div>
            }
            {isShowEditCard === true &&
                <div className='mt-1 ml-3 mr-1 pb-3'>
                    <textarea 
                        rows='2'
                        className='resize-none py-1 px-2 w-full rounded-md focus:outline focus:outline-blue-400'
                        placeholder='Enter a title for this card...'
                        ref={textAreaRef}
                        value={valueTextArea}
                        onFocus={() => adjustHeight(textAreaRef)}
                        onChange={(event) => {
                            setValueTextArea(event.target.value)
                            adjustHeight(textAreaRef);
                        }}
                        onKeyDown={(event) => {if(event.key === "Enter"){
                            if(!event.target.value) {setIsShowEditCard(false)} 

                            setValueTextArea(event.target.value);
                            handleEditCard();
                        }}}
                        spellCheck='false'
                    >
                    </textarea>
                    <div className='pt-2 flex items-center'>
                        <button 
                            className='px-2 py-1 rounded-md font-bold bg-green-600 text-white hover:bg-hover-button hover:text-black'
                            onClick={() => handleEditCard()}
                        >Save</button>
                        {/* <i className='bi-x icon' onClick={() => closeEdit()}></i> */}
                        <button 
                            id='btn-delete'
                            className='ml-2 px-2 py-1 rounded-md font-bold bg-red-600 text-white hover:bg-hover-button hover:text-black'
                            onClick={() => handleDeleteCard()}
                        >Delete Card</button>
                    </div>
                </div> 
            }
        </>
    )
}

Card.propTypes = {
    card: PropTypes.object.isRequired,
    cards: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    board: PropTypes.object.isRequired,
    params: PropTypes.object,
    setBoard: PropTypes.func.isRequired,
    setColumns: PropTypes.func.isRequired
};

export default Card;