'use client'

import Card from '@/app/ui/content-board/Card/Card';
import { CreateCard, UpdateColumn } from '@/app/ui/buttons';
import { adjustHeight } from '@/app/utilities/function';
import { mapOrder } from '@/app/utilities/sorts';
import { useVisibility } from '@/app/home';
import ConfirmModal from '@/app/ui/Common/ConfirmModal';
import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from '@/app/utilities/constant';

import './Column.scss';
import { useEffect, useRef, useState } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Column = (props) => {

    const {column, onCardDrop, columns, board, params, setBoard, setColumns} = props;
    const { isVisible, isSmallScreen, setBoards } = useVisibility();
    const cards = mapOrder(column.cards, column.cardOrder, 'id');

    const [showModalDelete, setShowModalDelete] = useState(false); //show modal delete
    const toggleModel = () => {
        setShowModalDelete(!showModalDelete);
    }

    const onModalAction = async (type) => {
        if(type === MODAL_ACTION_CLOSE){
            //Do nothing
        }
        if(type === MODAL_ACTION_CONFIRM){
            //Remove a column
            const newColumn = {
                ...column,
                _destroy: true
            }

            const value =  await UpdateColumn(newColumn, columns, board);
            setBoards(value.boardsR);
            setBoard(value.newBoard);
            setColumns(value.ncols);
        }

        toggleModel();
    }

    //Change Title List
    const [titleColumn, setTitleColumn] = useState('');
    const [isFirstClick, setIsFirstClick] = useState(true);
    const inputRef = useRef(null);

    useEffect(() => {
        if(column) {
            setTitleColumn(column.title);
        }
    }, [column])

    const selectAllText = (event) => {
        setIsFirstClick(false);
        
        if(isFirstClick) {
            event.target.select();
        } else {
            inputRef.current.setSelectionRange(titleColumn.length, titleColumn.length);
        }
    }

    const handleClickOutside = async () => {
        //Do something...
        setIsFirstClick(true);

        const newColumn = {
            ...column,
            title: titleColumn,
            _destroy: false,
        }

        const value = await UpdateColumn(newColumn, columns, board);
        setBoards(value.boardsR);
        setBoard(value.newBoard);
        setColumns(value.ncols);
    }

    //Add New Card
    const [isShowAddNewCard, setIsShowAddNewCard] = useState(false); //show input
    const textAreaRef = useRef(null); //to get value in the form of object

    useEffect(() => {
        if(isShowAddNewCard === true && textAreaRef) {
            textAreaRef.current.focus();
        }
    }, [isShowAddNewCard])

    const handleAddNewCard = async () => {
        //validate
        if(!textAreaRef.current.value){
            setIsShowAddNewCard(false);
            return;
        }

        const value = await CreateCard(board, columns, column, textAreaRef.current.value);
        setBoards(value.columnsR.boardsR);
        setBoard(value.columnsR.newBoard);
        setColumns(value.columnsR.ncols);
        textAreaRef.current.value = '';
        setIsShowAddNewCard(false);
    }

    return (
        <>
            <motion.div className="column" animate={{maxHeight: isVisible ? null : isSmallScreen ? "calc(100vh - 200px)" : ''}}>
                <header className="column-drag-handle">
                    <div className='column-title'>
                        <Form.Control 
                            size={"sm"}
                            type="text"
                            value={titleColumn}
                            className='customize-input-column'
                            onClick={selectAllText}
                            onChange={(event) => setTitleColumn(event.target.value)}
                            spellCheck="false"
                            onBlur={handleClickOutside}
                            onMouseDown={(e) => e.preventDefault()}
                            ref={inputRef}
                        />
                    </div>
                    <div className='column-dropdown'>
                        <Dropdown>
                            <Dropdown.Toggle variant="" id="dropdown-basic" size='sm'>
                                
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {/* <Dropdown.Item href="#">Add card...</Dropdown.Item> */}
                                <Dropdown.Item onClick={toggleModel}>Remove this column...</Dropdown.Item>
                                {/* <Dropdown.Item href="#">Something else</Dropdown.Item> */}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </header>
                <div className="card-list">
                    <Container
                        // {...column.props}

                        groupName="col"
                        onDrop={(dropResult) => onCardDrop(dropResult, column._id)}
                        getChildPayload={index => cards[index]}
                        dragClass="card-ghost"
                        dropClass="card-ghost-drop"

                        dropPlaceholder={{                      
                        animationDuration: 150,
                        showOnTop: true,
                        className: 'card-drop-preview' 
                        }}
                        dropPlaceholderAnimationDuration={200}
                    >
                        {/* <Card/> */}
                        {cards && cards.length > 0 && cards.map((card, index) => {
                            return (
                                
                                <Draggable key={card._id}>
                                    <Card 
                                        card={card}
                                        cards={cards}
                                        columns={columns}
                                        board={board}
                                        params={params}
                                        setBoard={setBoard}
                                        setColumns={setColumns}
                                    />
                                </Draggable>
                            )
                        })}
                    </Container>
                    
                    {isShowAddNewCard === true && 
                        <div className='add-new-card'>
                            <textarea 
                                rows='2'
                                className='form-control'
                                placeholder='Enter a title for this card...'
                                ref={textAreaRef}
                                onChange={() => {
                                    adjustHeight(textAreaRef);
                                }}
                                onKeyDown={(event) => {if(event.key === "Enter"){
                                    if(!event.target.value) {setIsShowAddNewCard(false); return} 

                                    handleAddNewCard();

                                }}}
                                spellCheck='false'
                            >
                            </textarea>
                            <div className='group-btn'>
                                <button 
                                    className='btn btn-primary'
                                    onClick={() => handleAddNewCard()}
                                >Add card</button>
                                <button className='bi-x icon rounded' onClick={() => setIsShowAddNewCard(false)}></button>
                            </div>
                        </div>
                    }
                </div>
                {isShowAddNewCard === false && 
                    <footer>
                        <button className='footer-action' onClick={() => setIsShowAddNewCard(true)}>
                            <i className='bi-plus-lg icon'></i> Add a card
                        </button>
                    </footer>
                }
            </motion.div>

            <ConfirmModal
                show={showModalDelete}
                title={"Remove a column"}
                content={`Are you sure to remove this column: <b>${column.title}</b>`}
                onAction={onModalAction}
            />
        </>
    )
}

Column.propTypes = {
    board: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    column: PropTypes.object.isRequired,
    onCardDrop: PropTypes.func.isRequired,
    params: PropTypes.object,
    setBoard: PropTypes.func.isRequired,
    setColumns: PropTypes.func.isRequired
};

export default Column;