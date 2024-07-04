'use client'

import Card from '@/app/ui/content-board/Card/Card';
import { CreateCard, UpdateColumn } from '@/app/ui/buttons';
import { adjustHeight } from '@/app/utilities/function';
import { mapOrder } from '@/app/utilities/sorts';
import { useVisibility } from '@/app/home';
import ConfirmModal from '@/app/ui/Common/ConfirmModal';
import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from '@/app/utilities/constant';

import { useEffect, useRef, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { Droppable, Draggable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';

const DropdownMenu = (props) => {
    const {socket} = useVisibility();
    const {column, columns, board, setBoard, setBoards, setColumns} = props;

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
            // setBoards(value.boardsR);
            setBoard(value.newBoard);
            setColumns(value.ncols);
            socket.emit('updateBoard', value.newBoard);
        }

        toggleModel();
    }
    return (
        <div className="text-center">
            <Menu>
                <MenuButton className="inline-flex items-center gap-2 rounded-md py-1.5 px-3 text-sm/6 font-semibold text-black shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-hover-button data-[open]:bg-hover-button data-[focus]:outline-1 data-[focus]:outline-white">
                    ...
                </MenuButton>
                <Transition
                    enter="transition ease-out duration-75"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <MenuItems
                        anchor="bottom start"
                        className="mt-1 w-52 origin-top-right rounded-xl border border-black/5 bg-list-bg-color p-1 text-sm/6 text-black [--anchor-gap:var(--spacing-1)] focus:outline-none"
                    >
                        <MenuItem>
                            <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10" onClick={toggleModel}>
                                <div className='bi bi-trash mr-1'></div>
                                Remove this column...
                            </button>
                        </MenuItem>
                    </MenuItems>
                </Transition>
            </Menu>
            <ConfirmModal
                show={showModalDelete}
                title={"Remove a column"}
                content={`Are you sure to remove this column: <b>${column.title}</b>`}
                onAction={onModalAction}
            />
        </div>
    )
}

DropdownMenu.propTypes = {
    column: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    board: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
    setBoards: PropTypes.func.isRequired,
    setColumns: PropTypes.func.isRequired
}

const Column = (props) => {

    const {column, columns, board, params, setBoard, setColumns} = props;
    const { setBoards, socket } = useVisibility();
    const cards = mapOrder(column.cards, column.cardOrder, 'id');

    //Change Title List
    const [titleColumn, setTitleColumn] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if(column) {
            setTitleColumn(column.title);
        }
    }, [column])

    const handleClickOutside = async () => {
        //Do something...

        const newColumn = {
            ...column,
            title: titleColumn,
            _destroy: false,
        }

        const value = await UpdateColumn(newColumn, columns, board);
        // setBoards(value.boardsR);
        setBoard(value.newBoard);
        setColumns(value.ncols);
        setCanDrag(true);
        socket.emit('updateBoard', value.newBoard);
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
        // setBoards(value.columnsR.boardsR);
        setBoard(value.columnsR.newBoard);
        setColumns(value.columnsR.ncols);
        socket.emit('updateBoard', value.columnsR.newBoard);
        textAreaRef.current.value = '';
        setIsShowAddNewCard(false);
    }

    const [canDrag, setCanDrag] = useState(true);

    useEffect(() => {
        if(canDrag === false && inputRef.current !== null) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    },[canDrag])

    return (
        <>
            <div className="w-80 mx-2 mt-1 *:bg-list-bg-color *:text-black">
                <header className="column-drag-handle flex py-2 px-1 h-11 text-base font-bold rounded-t-lg cursor-pointer">
                    <div className='w-10/12 my-1'>
                        {canDrag ? (
                            <div className='mx-2 px-2 py-1 rounder-md cursor-pointer'
                                onClick={() => setCanDrag(false)}>
                                    {titleColumn}
                            </div>
                        ) : 
                        (
                            <input 
                                type="text"
                                value={titleColumn}
                                className='mx-2 px-2 py-1 rounder-md cursor-pointer bg-inherit focus:outline-none focus:shadow'
                                onChange={(event) => setTitleColumn(event.target.value)}
                                spellCheck="false"
                                onBlur={handleClickOutside}
                                onMouseDown={(e) => e.preventDefault()}
                                ref={inputRef}
                            />
                        )}
                    </div>
                    <div className='w-2/12'>
                        <DropdownMenu column={column} columns={columns} board={board} setBoard={setBoard} setBoards={setBoards} setColumns={setColumns}/>
                    </div>
                </header>
                <div className={`scrollbar-card pb-2 list-none m-0 max-h-[calc(100%-45px-36px)] overflow-y-auto ${isShowAddNewCard !== false ? "rounded-b-lg" : ""}`}>
                    <Droppable droppableId={column._id} type="CARD">
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}
                                className={`my-1 ${snapshot.isDraggingOver ? 'py-gap bg-gray-400/15 rounded-md' : ''}`}
                            >
                            {column.cards.map((card, cardIndex) => (
                                <Draggable
                                    key={card._id}
                                    draggableId={card._id}
                                    index={cardIndex}
                                    type="CARD"
                                >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`${snapshot.isDragging ? 'dragging' : ''}`}
                                        >
                                            {/* {card.title} */}
                                            <Card 
                                                card={card}
                                                cards={cards}
                                                columns={columns}
                                                board={board}
                                                params={params}
                                                setBoard={setBoard}
                                                setColumns={setColumns}
                                            />
                                    </div>
                                )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    
                    
                    {isShowAddNewCard === true && 
                        <div className='pb-2 pt-1 pl-3 pr-1 w-full'>
                            <textarea 
                                rows='2'
                                className='px-2 py-1 w-full rounded-md resize-none focus:outline focus:outline-blue-500'
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
                            <div className='flext item-center my-1'>
                                <button 
                                    className='px-2 py-2 font-bold rounded-md text-white bg-green-600 hover:text-black hover:bg-hover-button'
                                    onClick={() => handleAddNewCard()}
                                >Add card</button>
                                <button className='ml-2 bi-x icon rounded-md py-1 px-1 text-xl hover:bg-hover-button' onClick={() => setIsShowAddNewCard(false)}></button>
                            </div>
                        </div>
                    }
                </div>
                {isShowAddNewCard === false && 
                    <footer className='group/footer pl-4 pb-10 h-9 left-9 font-bold rounded-b-lg hover:bg-white cursor-pointer' onClick={() => setIsShowAddNewCard(true)}>
                        <button className='pt-2 text-gray-500 group-hover/footer:text-black'>
                            <i className='bi-plus-lg icon'></i> Add a card
                        </button>
                    </footer>
                }
            </div>
        </>
    )
}

Column.propTypes = {
    board: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    column: PropTypes.object.isRequired,
    params: PropTypes.object,
    setBoard: PropTypes.func.isRequired,
    setColumns: PropTypes.func.isRequired
};

export default Column;