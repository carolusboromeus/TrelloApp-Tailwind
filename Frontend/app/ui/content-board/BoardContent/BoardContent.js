'use client'

import Column from '@/app/ui/content-board/Column/Column';
import { CreateColumn, UpdateOrder } from '@/app/ui/buttons';
import { useVisibility } from '@/app/home';
import { applyDrag } from '@/app/utilities/dragDrop';

// import './BoardContent.scss'
import { useState, useEffect, useRef } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import PropTypes from 'prop-types';

const BoardContent = (props) => {
    const {params, board, setBoard, columns, setColumns} = props;
    const { setBoards } = useVisibility();

    //show input add cloumn
    const [isShowAddList, setIsShowAddList] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if(isShowAddList === true && inputRef) {
            inputRef.current.focus();
        }
    }, [isShowAddList])

    const onColumnDrop = async (dropResult) => {
        // console.log('>>> inside onColumnDrop', dropResult);
        let newColumns = [...columns];
        newColumns = applyDrag(newColumns, dropResult);
        // console.log('>>> inside onColumnDrop new columns', newColumns);

        let newBoard = {...board};
        newBoard.columnOrder = newColumns.map(column => column._id);
        newBoard.columns = newColumns;

        setColumns(newColumns);
        setBoard(newBoard);
        const value = await UpdateOrder(board, newColumns)
        // console.log(value)
        setBoards(value);
    }

    const onCardDrop = (dropResult, columnId) => {
        if(dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
            // console.log(">>> inside onCardDrop: ", dropResult, 'with columnId=', columnId);

            let newColumns = [...columns];
            
            let currentColumn = newColumns.find(column => column._id === columnId); //find list when id same
            currentColumn.cards = applyDrag(currentColumn.cards, dropResult);
            currentColumn.cardOrder = currentColumn.cards.map(card => card._id); //create new array (update data)

            if(dropResult.addedIndex !== null) {
                const index = newColumns.findIndex(column => column._id === columnId);
                let ncol = newColumns[index].cards.find(a => a.columnId === dropResult.payload.columnId);
                ncol.columnId = columnId;
            }
            setColumns(newColumns);
            UpdateOrder(board, newColumns);
        }
    }

    if(!board) {
        return (
            <div className='not-found'>
                <h5>Board not found</h5>
            </div>
        )
    }
    else if(!params.board_id) {
        return (
            <div className='not-found'>
                <h5>Select a board or create a board</h5>
            </div>
        )
    }

    const handleCreateColumn = (async () => {
        if(!inputRef.current.value){
            setIsShowAddList(false);
            
            return;
        }

        const value = await CreateColumn(board, columns, inputRef.current.value);
        setBoards(value.boardsR)
        setBoard(value.newBoard);
        setColumns(value._columns);
        inputRef.current.value = '';
    })

    return(
        <div className="scrollbar flex mr-gap gap-3 overflow-x-auto">
            <Container
                orientation="horizontal"
                onDrop={onColumnDrop}
                getChildPayload={index => columns[index]}
                dragHandleSelector=".column-drag-handle"
                dropPlaceholder={{
                    animationDuration: 150,
                    showOnTop: true,
                    className: 'column-drop-preview'
                }} >
                
                {columns && columns.length > 0 && columns.map((column, index) => {
                    return(
                        <Draggable key={column._id}>
                            <Column
                                columns={columns}
                                column={column}
                                board={board}
                                onCardDrop={onCardDrop}
                                params={params}
                                setBoard={setBoard}
                                setColumns={setColumns}
                            />
                        </Draggable>

                    )
                })}

                {isShowAddList === false ? 
                    <button className='w-60 h-10 leading-8 py-1 pl-4 text-white ml-gap mt-1 text-xs bg-hover-icon text-left hover:bg-hover-sidebar rounded-lg' onClick={() => setIsShowAddList(true)}>
                        <i className='bi-plus-lg icon'></i> Add another column
                    </button>

                    :

                    <div className='w-64 h-24 p-3 bg-list-bg-color/50 ml-2 rounded-md'>
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
                                setBoards(value.boardsR);
                                setBoard(value.newBoard);
                                setColumns(value._columns);
                            }}}
                            spellCheck='false'
                        />
                        <div className='mt-2 flex items-center'>
                            <button type="submit" className='py-1 px-2 bg-green-600 text-white font-medium rounded-md hover:text-black hover:bg-hover-sidebar' onClick={() => handleCreateColumn()}>Add list</button>
                            <button type='cancel' className='ml-2 text-xl bi-x px-2 py-1 rounded-md hover:bg-hover-icon' onClick={() => setIsShowAddList(false)}></button>
                        </div>
                    </div>                
                }
            </Container> 
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