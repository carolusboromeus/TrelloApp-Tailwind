import { UpdateCard } from '@/app/ui/buttons';
import { useVisibility } from '@/app/home';
import { getFirstLetters, adjustHeight } from '@/app/utilities/function';

import './Card.scss';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import dateFormat from "dateformat";
import { useRouter } from 'next/navigation'
import PropTypes from 'prop-types'

const DetailCardModal = React.lazy(() => import('@/app/ui/content-card/DetailCard/DetailCardModal'));

const Card = (props) => {
    const {card, cards, columns, board, params, setBoard, setColumns} = props;
    const { setBoards } = useVisibility();
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
        setBoards(value.columnsR.boardsR);
        setBoard(value.columnsR.newBoard);
        setColumns(value.columnsR.ncols);
        setIsShown(false);
        setIsShowEditCard(false);
    }

    const handleDeleteCard = async () => {
        const newCard = {
            ...card,
            _destroy: true
        }

        const value = await UpdateCard(newCard, cards, columns, board);
        setBoards(value.columnsR.boardsR);
        setBoard(value.columnsR.newBoard);
        setColumns(value.columnsR.ncols);
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
                <div className="card-item"
                    onMouseEnter={() => setIsShown(true)}
                    onMouseLeave={() => setIsShown(false)}
                >
                    {card.image && 
                        <img className="card-cover" src={card.image} alt="Cover"
                            onMouseDown={event => event.preventDefault()}
                            onClick={() => router.push(`/c/${card.boardId.slice(6, 14)}/${card._id.slice(6, 14)}/${card.title.toLowerCase().replace(/ /g, "-")}`)}
                        />
                    }
                    {isShown === true && <button className='bi-pencil-square icon text-end edit' onClick={() => showEdit()}></button>}
                    <div id='text' onClick={() => router.push(`/c/${card.boardId.slice(6, 14)}/${card._id.slice(6, 14)}/${card.title.toLowerCase().replace(/ /g, "-")}`)}>
                        <p className='card-title'>{card.title}</p>
                        <Row>
                            <Col sm={12}>
                                <div className='icon-group'>
                                    {(card.description !== null && card.description.ops.length > 0 ) && 
                                        <i className='bi-justify-left icon-description' title="This card has a description"></i>
                                    }
                                    {card.comments.length > 0 && 
                                        <div className='icon-show' title="Comments">
                                            <i className='bi-chat-left icons'></i>
                                            <div className='text'>{card.comments.length}</div> 
                                        </div>   
                                    }
                                    {card.files.length > 0 && 
                                        <div className='icon-show' title="Attachments">
                                            <i className='bi-paperclip icons'></i>
                                            <div className='text'>{card.files.length}</div> 
                                        </div>   
                                    }
                                    {card.checklist.length > 0 && 
                                        <div className='icon-show' title="Checklist items">
                                            <i className='bi-check2-square icons'></i>
                                            <div className='text'>{checkList()}/{card.checklist.length}{dueDateList()}</div> 
                                        </div>   
                                    }
                                </div>
                            </Col>
                            <Col sm={12}>
                                <div id='member-card-display'>
                                    {card && card.member.length > 0 &&
                                        <div className='display-photo'>
                                            {card.member && card.member.length > 0 && card.member.map((member, index) => {
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
                                    }
                                </div>
                            </Col>
                        </Row>
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
                <div className='edit-card'>
                    <textarea 
                        rows='2'
                        className='form-control'
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
                    <div className='group-btn'>
                        <button 
                            className='btn badge btn-primary'
                            onClick={() => handleEditCard()}
                        >Save</button>
                        {/* <i className='bi-x icon' onClick={() => closeEdit()}></i> */}
                        <button 
                            id='btn-delete'
                            className='btn badge btn-danger'
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