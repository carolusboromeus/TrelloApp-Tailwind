'use client'

import Column from '@/app/ui/content-board/Column/Column';
import { CreateColumn, UpdateOrder } from '@/app/ui/buttons';
import { useVisibility } from '@/app/home';

import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const BoardContent = (props) => {
    const {params, board, setBoard, columns, setColumns} = props;
    const { setBoards, socket, isVisible, isSmallScreen } = useVisibility();

    //show input add cloumn
    const [isShowAddList, setIsShowAddList] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if(isShowAddList === true && inputRef) {
            inputRef.current.focus();
        }
    }, [isShowAddList])

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
    
        // If dropped outside a droppable area
        if (!destination) {
          return;
        }
    
        // If dropped in the same position
        if (
          source.droppableId === destination.droppableId &&
          source.index === destination.index
        ) {
          return;
        }
    
        const newColumns = Array.from(columns);
        const newBoard = {...board};

        // Reorder columns
        if (result.type === 'COLUMN') {
            const movedColumn = newColumns.splice(source.index, 1)[0];
            newColumns.splice(destination.index, 0, movedColumn);

            newBoard.columnOrder = newColumns.map(column => column._id);
            newBoard.columns = newColumns;
        }
    
        // Reorder cards within the same column
        if (result.type === 'CARD') {
            const sourceColumn = newColumns.find(column => column._id === source.droppableId);
            const destinationColumn = newColumns.find(column => column._id === destination.droppableId);
    
            const movedCard = sourceColumn.cards.splice(source.index, 1)[0];
            destinationColumn.cards.splice(destination.index, 0, movedCard);
            
            const deleteColumn = newColumns.find(column => column._id ===source.droppableId);
            const currentColumn = newColumns.find(column => column._id === destination.droppableId); //find list when id same
            
            deleteColumn.cardOrder = deleteColumn.cards.map(card => card._id);
            currentColumn.cardOrder = currentColumn.cards.map(card => card._id); //create new array (update data)
        }

        setBoard(newBoard);
        setColumns(newColumns);
        const value = await UpdateOrder(board, newColumns);
        socket.emit("updateBoard", value);
    };

    if(!board) {
        return (
            <div className='h-dvh max-h-[calc(100vh-200px)]  sm:max-h-[calc(100vh-100px)] flex justify-center items-center'>
                <h5 className='ml-gap text-white text-xl font-bold'>Board not found</h5>
            </div>
        )
    }
    else if(!params.board_id) {
        return (
            <div className='h-dvh max-h-[calc(100vh-200px)]  sm:max-h-[calc(100vh-100px)] flex justify-center items-center'>
                <h5 className='ml-gap text-white text-xl font-bold'>Select a board or create a board</h5>
            </div>
        )
    }

    const handleCreateColumn = (async () => {
        if(!inputRef.current.value){
            setIsShowAddList(false);
            
            return;
        }
        const value = await CreateColumn(board, columns, inputRef.current.value);
        // setBoards(value.boardsR)
        setBoard(value.newBoard);
        setColumns(value._columns);
        socket.emit("updateBoard", value.newBoard);
        inputRef.current.value = '';
    })

    return(
        <div className="scrollbar flex mr-gap gap-3 overflow-x-auto mx-2">
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
                    {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`flex`}>
                        {board.columns.map((column, columnIndex) => (
                            <Draggable
                                key={column._id}
                                draggableId={column._id}
                                index={columnIndex}
                                type="COLUMN"
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`h-0`}
                                    >
                                        <Column
                                            columns={columns}
                                            column={column}
                                            board={board}
                                            params={params}
                                            setBoard={setBoard}
                                            setColumns={setColumns}
                                        />
                                        {/* <h3>{column.title}</h3> */}
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                    )}
                </Droppable>
            </DragDropContext>
            <motion.div className='h-svh max-h-[calc(100vh-300px)] sm:h-[calc(100vh-119px)] sm:max-h-fit' animate={{maxHeight: isVisible ? null : isSmallScreen ? "calc(100vh - 150px)" : null}}>
                {isShowAddList === false ? 
                    <button className='w-60 h-10 leading-8 py-1 pl-4 text-white mt-1 text-xs bg-hover-icon text-left hover:bg-hover-sidebar rounded-lg' onClick={() => setIsShowAddList(true)}>
                        <i className='bi-plus-lg icon pr-1'></i> Add another column
                    </button>

                    :

                    <div className='w-64 h-24 p-3 bg-list-bg-color/50 mt-1 rounded-md'>
                        <input 
                            name='title'
                            type='text'
                            placeholder='Title column' 
                            ref={inputRef}
                            defaultValue={''}
                            className='py-1.5 pr-8 pl-3 w-full rounded-md focus:outline focus:outline-blue-500' 
                            onKeyDown={async (event) => {if(event.key === "Enter"){
                                if(!event.target.value) {setIsShowAddList(false); return null} 
                                
                                const value = await CreateColumn(board, columns, event.target.value);
                                // setBoards(value.boardsR);
                                setBoard(value.newBoard);
                                setColumns(value._columns);
                                socket.emit('updateBoard', value.newBoard);
                            }}}
                            spellCheck='false'
                        />
                        <div className='mt-2 flex items-center'>
                            <button type="submit" className='py-1 px-2 bg-green-600 text-white font-medium rounded-md hover:text-black hover:bg-hover-sidebar' onClick={() => handleCreateColumn()}>Add list</button>
                            <button type='cancel' className='ml-2 text-xl bi-x px-2 py-1 rounded-md hover:bg-hover-icon' onClick={() => setIsShowAddList(false)}></button>
                        </div>
                    </div>                
                }
            </motion.div>
        </div>
    )
}

BoardContent.propTypes = {
    params: PropTypes.object.isRequired,
    board: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
    columns: PropTypes.array.isRequired,
    setColumns: PropTypes.func.isRequired
};

export default BoardContent;