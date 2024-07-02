'use client'

import { useVisibility } from '@/app/home';
import MemberDropdown from '@/app/ui/Common/MemberDropdown/MemberDropdown';
import { DeleteList, DueDateList, EditList, RemoveDueDateList, ValueChecklist } from '@/app/ui/buttons';
import { getFirstLetters } from '@/app/utilities/function';

import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useRef, useState, forwardRef} from 'react';
import dateFormat from "dateformat";
import DatePicker from "react-datepicker";
import PropTypes from 'prop-types'

const DropdownToggle = (props) => {
    const {code, checklist, params, board, card, setBoard, setCard} = props;
    const [show, setShow] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShow(false);
            }
        };
    
        document.addEventListener('mousedown', handleOutsideClick);
    
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        if(show){
            const container = document.getElementsByClassName("ql-container");
            for (const element of container) {
                element.style.position = "static";
            }
        } else {
            const container = document.getElementsByClassName("ql-container");
            for (const element of container) {
                element.style.position = "relative";
            }
        }
    }, [show])

    const toggleDropdown = () => {
        setShow(!show);
    };

    return (
        <div className={`${show ? 'relative' : 'static'} sm:flex ml-1`} ref={dropdownRef}>
            {/* Dropdown toggle button */}
            {code && code === 'member-dropdown' ?
                
                checklist && checklist.member ?

                    <button className='flex items-center mt-0' onClick={toggleDropdown}>
                        <div className="member-photo" title={checklist.member.name}>
                            <div className="grid place-items-center w-7 h-7 bg-navbar-board-bg-color rounded-full border-2 border-white" style={{backgroundColor: `rgb(${(board.background.r)}, ${board.background.g}, ${board.background.b})`}}>
                                <div className='text-list-bg-color text-xs font-bold cursor-default hover:cursor-pointer'>
                                    {getFirstLetters(checklist.member.name)}
                                </div>
                            </div>
                        </div>
                    </button>

                    :

                    <button
                        onClick={toggleDropdown}
                        title="Assign Member"
                        className="text-left px-2 py-1 rounded-md bg-gray-400/50 hover:bg-white"
                    >
                        <i className='bi bi-person-add' title='Assign Member'></i>
                    </button>

                
                
                :
            
                <button 
                    onClick={toggleDropdown}
                    title="Assign Member"
                    className='ml-1 px-1 py-1 w-7 h-7 rounded-full hover:bg-white'
                >
                    <i className='bi-person-add' title='Assign Member'></i>
                </button>
            }
            {/* Dropdown menu */}
            {show && (
                <div className="absolute top-0 left-0 w-72 bg-list-bg-color border rounded-md shadow-lg px-2 translate-y-8">
                    <div className='flex w-full px-3 py-3 text-sm'>
                        <div className='text-black font-semibold w-full text-center'>Assign Member</div>
                        <button className='text-end w-1/12' onClick={() => setShow(false)}>
                            <i className='bi bi-x text-black  hover:rounded-md hover:bg-hover-button p-1'></i>
                        </button>
                    </div>

                    {/* Dropdown Content */}
                    <MemberDropdown
                        memberDropdown={show}
                        checklist={checklist}
                        code="list-assign"
                        params={params}
                        board={board}
                        card={card}
                        setBoardModal={setBoard}
                        setCardModal={setCard}
                    />
                </div>
            )}
        </div>
    )
}

DropdownToggle.propTypes = {
    code: PropTypes.string.isRequired,
    checklist: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired, 
    board: PropTypes.object.isRequired,
    card: PropTypes.bool.isRequired,
    setBoard: PropTypes.func.isRequired,
    setCard: PropTypes.func.isRequired,
}

const DateCustomInput = forwardRef(({ value, onClick, refs}, ref) =>  {
   
    return (
        <div className="date-custom-input" style={{display: "flex"}} onClick={onClick} ref={refs}>
            <i className='bi-clock icon' title='Due Date'></i>
            {value !== '' && 
                <div id="text-date" style={{marginLeft: "5px"}}>{dateFormat(value, "d mmm")}</div>
            }
        </div> 
    )
});

DateCustomInput.propTypes = {
    value: PropTypes.string,
    onClick: PropTypes.func,
    refs: PropTypes.object,
};

const List = (props) => {
    const {checklist, card, board, setProgressBar, setChecked, params, setBoard, setCard} = props;
    const { setBoards, socket } = useVisibility();

    const inputRef = useRef(null);
    const [labelList, setLabelList] = useState(false);

    const [showEditChecklist, setShowEditChecklist] = useState(false); //show input
    const ChecklistRef = useRef(null); //to get value in the form of object
    //const [checked, setChecked] = useState(0);

    const [startDate, setStartDate] = useState('');
    const [assignDropdown, setAssignDropdown] = useState(false);
    const [customHeader, setCustomHeader] = useState(false);
    const [showIcon, setShowIcon] = useState(false);
    const DateRef = useRef(null);

    useEffect(() => {
        if(checklist && checklist.check === true) {
            if(inputRef.current !== null){
                inputRef.current.checked = true;
                setLabelList(true);
            }
        }  else if(checklist && checklist.check === false){
            if(inputRef.current !== null){
                inputRef.current.checked = false;
                setLabelList(false);
            }
        }
    }, [checklist])

    const UpdateChecklist = async () => {
        if(inputRef.current !== null) {
            if(checklist.check === false) {
                const value = await ValueChecklist(params, checklist, true, board);
                // setBoards(value.cardsR.columnsR.boardsR);
                setBoard(value.cardsR.columnsR.newBoard);
                setCard(value.newCard);
                socket.emit('updateCard', value.newCard);
                socket.emit('updateBoard', value.cardsR.columnsR.newBoard);
                setLabelList(true);
            } else if(checklist.check === true) {
                const value = await ValueChecklist(params, checklist, false, board);
                // setBoards(value.cardsR.columnsR.boardsR);
                setBoard(value.cardsR.columnsR.newBoard);
                setCard(value.newCard);
                socket.emit('updateCard', value.newCard);
                socket.emit('updateBoard', value.cardsR.columnsR.newBoard);
                setLabelList(false);
            }
        }

        let checked = 0;
        const myBar = document.getElementById("myBar");
        for(const element of card.checklist) {
            if(element.check === true) {
                checked++
            }
        }
        const result = Math.round(((checked / card.checklist.length) * 100)) + "%";
        myBar.style.width = result;
        setProgressBar(result);
        setChecked(checked);
    }

    useEffect(() => {
        if(checklist) { 
            if(showEditChecklist === true && ChecklistRef.current !== null) {
                ChecklistRef.current.value = checklist.list;
                ChecklistRef.current.focus();
            }
        }
    }, [checklist, showEditChecklist])

    useEffect(() => {
        if(checklist && DateRef.current !== null) {
            setStartDate(checklist.date);
        }
    }, [checklist])

    const handleEditChecklist = async (list) => {
        //validate
        if(ChecklistRef.current.value === ''){
            setShowEditChecklist(false);
            return;
        }
        
        const value = await EditList(params, checklist, list, board);

        // setBoards(value.cardsR.columnsR.boardsR);
        setBoard(value.cardsR.columnsR.newBoard);
        setCard(value.newCard);
        socket.emit('updateCard', value.newCard);
        socket.emit('updateBoard', value.cardsR.columnsR.newBoard);

        setShowEditChecklist(false);
    }

    const handleDeleteList = async () => {

        const value = await DeleteList(params, checklist, board)

        // setBoards(value.cardsR.columnsR.boardsR);
        setBoard(value.cardsR.columnsR.newBoard);
        setCard(value.newCard);
        socket.emit('updateCard', value.newCard);
        socket.emit('updateBoard', value.cardsR.columnsR.newBoard);

        let checked = 0;
        const myBar = document.getElementById("myBar");
        if(card.checklist.length > 1) {
            for(const element of card.checklist) {
                if(element.check === true) {
                    checked++
                }
            }
            
            const result = Math.round(((checked / card.checklist.length) * 100)) + "%";
            myBar.style.width = result;
            setProgressBar(result);
        } else {
            myBar.style.width = "0%";
            setProgressBar("0%");
        }
        
        setChecked(checked);
    }

    const editCheckList = () => {
        if(showEditChecklist === false) {
            setShowEditChecklist(true);
        } else if(showEditChecklist === true) {
            setShowEditChecklist(false);
        }
    }

    const handleDueDateList = async (value) => {
        setStartDate(value);
        setCustomHeader(false);
        const valueR = await DueDateList(params, checklist, value, board);
        // setBoards(valueR.cardsR.columnsR.boardsR);
        setBoard(valueR.cardsR.columnsR.newBoard);
        setCard(valueR.newCard);
        socket.emit('updateCard', valueR.newCard);
        socket.emit('updateBoard', valueR.cardsR.columnsR.newBoard);
    }

    const handleRemoveDueDate = ( async () => {
        setStartDate('');
        setCustomHeader(false);
        
        const valueR = await RemoveDueDateList(params, checklist, board);
        // setBoards(valueR.cardsR.columnsR.boardsR);
        setBoard(valueR.cardsR.columnsR.newBoard);
        setCard(valueR.newCard);
        socket.emit('updateCard', valueR.newCard);
        socket.emit('updateBoard', valueR.cardsR.columnsR.newBoard);
    })

    const CustomHeader = ({ date, decreaseMonth, increaseMonth }) => {
        const date1 = new Date(date);
        const date2 = new Date();

        return (
            <div id='custom-header-date' className='mt-2 -mb-5'>
                {startDate &&
                    <div className='mb-3 mx-3'>
                        <button className='bg-gray-700/10 text-black px-2 py-1 w-full rounded-md hover:bg-hover-button hover:font-bold' onClick={handleRemoveDueDate}>Remove Date</button>
                    </div>
                }
                <div className='grid grid-cols-3 taxe-base'>
                    <div className='font-semibold'>
                        {date1 > date2 && 
                            <button className='px-2 py-1 hover:bg-hover-button rounded-full' onClick={decreaseMonth}>{'<'}</button>
                        }
                    </div>
                    <span className='font-semibold py-1'>{dateFormat(date, "mmm yyyy")}</span>
                    <div className='font-semibold '>
                        <button className='px-2 py-1 hover:bg-hover-button rounded-full' onClick={increaseMonth}>{'>'}</button>
                    </div>
                </div>
                <div>&nbsp;</div>&nbsp;
            </div>
        );
    };

    CustomHeader.propTypes = {
        date: PropTypes.string,
        decreaseMonth: PropTypes.string,
        increaseMonth: PropTypes.string,
    };

    useEffect(() => {
        if(!assignDropdown && !customHeader) {
            setShowIcon(false);
        }

    }, [assignDropdown, customHeader])

    const eventDate = new Date(checklist.date); // Example date
    const twoDaysBefore = new Date(eventDate);
    twoDaysBefore.setDate(eventDate.getDate() - 2);

    return (
        <div id='checkbox' className='my-gap flex ml-8 py-1 items-center'>
            <input type="checkbox" 
                name={checklist.list}
                value={checklist.list}
                ref={inputRef}
                onClick={() => UpdateChecklist()}
                className={`mr-3 ${showEditChecklist !== false ? '-mt-9' : ''}`}
            >
            </input>
            {showEditChecklist === false &&
                <div className='pl-3 py-1 rounded-md w-full flex hover:bg-hover-button/50 cursor-pointer' 
                    onMouseEnter={() => setShowIcon(true)}
                    onMouseLeave={() => {
                        if(!customHeader && !assignDropdown){
                            setShowIcon(false);
                            setAssignDropdown(false);
                        }
                    }}
                >
                    <button className={`${startDate === '' ? 'w-10/12' : 'w-8/12'} text-left`} onClick={() => editCheckList()}>
                        {labelList === false &&
                            <label>{checklist.list}</label>
                        }
                        {labelList === true && 
                            <label className='text-list'>{checklist.list}</label>
                        }
                    </button>
                    <div className={`${startDate === '' ? 'w-2/12' : 'w-4/12'} flex flex-row-reverse pr-3`}>
                        {(checklist.date || checklist.member) &&
                            <>
                                <button className={`ml-1 px-2 py-1 bg-gray-400/50 ${startDate === null ? "w-7 h-7 rounded-full" : "rounded-md"} hover:bg-white`} title='Delete' onClick={() => {handleDeleteList()}}>
                                    <i className='bi bi-trash3 '></i>
                                </button>
                                {card && card.member.length > 0 && 
                                    <DropdownToggle
                                        code="member-dropdown"
                                        checklist={checklist}
                                        params={params}
                                        board={board}
                                        card={card}
                                        setBoard={setBoard}
                                        setCard={setCard}
                                    />
                                }
                                {startDate &&
                                    <div className='px-2 py-1 bg-gray-400/50 rounded-md hover:bg-white'>
                                        <DatePicker
                                            onChange={(date) => handleDueDateList(date)}
                                            customInput={<DateCustomInput refs={DateRef}/>}
                                            renderCustomHeader={CustomHeader}
                                            selected={startDate}
                                            minDate={new Date()}
                                            onCalendarOpen={() => setCustomHeader(true)}
                                            onCalendarClose={() => setCustomHeader(false)}
                                        />
                                    </div>
                                }
                                {!startDate &&
                                    <div className='px-2 py-1 bg-gray-400/50 hover:bg-white' style={{borderRadius: "100%", paddingLeft: "7px", paddingRight: "7px", paddingBottom: "3px"}}>
                                        <DatePicker
                                            onChange={(date) => handleDueDateList(date)}
                                            customInput={<DateCustomInput refs={DateRef}/>}
                                            renderCustomHeader={CustomHeader}
                                            selected={startDate}
                                            minDate={new Date()}
                                            onCalendarOpen={() => setCustomHeader(true)}
                                            onCalendarClose={() => setCustomHeader(false)}
                                        />
                                    </div>
                                }
                            </>
                        }
                        {(!startDate && !checklist.member) && showIcon === true &&
                            <>
                                <button className='abc ml-1 px-2 py-1 w-7 h-7 rounded-full hover:bg-white' title='Delete' onClick={() => {handleDeleteList()}}>
                                    <i className='bi bi-trash3'></i>
                                </button>
                                {card && card.member.length > 0 && 
                                    <DropdownToggle
                                        code="assign-member"
                                        checklist={checklist}
                                        params={params}
                                        board={board}
                                        card={card}
                                        setBoard={setBoard}
                                        setCard={setCard}
                                    />
                                }
                                <div className='px-2 py-1 w-7 h-7 rounded-full hover:bg-white' style={{borderRadius: "100%", paddingLeft: "7px", paddingRight: "7px", paddingBottom: "3px"}}>
                                    <DatePicker
                                        onChange={(date) => handleDueDateList(date)}
                                        customInput={<DateCustomInput refs={DateRef}/>}
                                        renderCustomHeader={CustomHeader}
                                        selected={startDate}
                                        minDate={new Date()}
                                        onCalendarOpen={() => setCustomHeader(true)}
                                        onCalendarClose={() => setCustomHeader(false)}
                                    />
                                </div>
                            </>
                        }
                    </div>
                </div>
            }
            {showEditChecklist === true &&
                <div className='w-full'>
                    <input
                        className="w-full py-1.5 pr-8 pl-3 rounded-md focus:outline focus:outline-blue-500"
                        ref={ChecklistRef}
                        defaultValue={checklist.list}
                        placeholder="Add an item"
                        onKeyDown={(event) => {if(event.key === "Enter"){
                            handleEditChecklist(event.target.value);
                        }}}
                        spellCheck='false'
                    >
                    </input>
                    <div className='flex mt-3'>
                        <button className='px-2 py-1 rounded-md font-bold bg-blue-500 text-white hover:bg-hover-button hover:text-black btn-primary' onClick={() => {handleEditChecklist(ChecklistRef.current.value)}}>Save</button>
                        <button className='ml-2 px-2 py-1 rounded-md font-bold bg-red-500 text-white hover:bg-hover-button hover:text-black btn-danger' onClick={() => {
                            editCheckList()
                            ChecklistRef.current.value = '';
                        }}>Cancel</button>
                    </div>
                </div>
            }
        </div>  
    )
}

List.propTypes = {
    checklist: PropTypes.object.isRequired,
    card: PropTypes.object.isRequired,
    board: PropTypes.object.isRequired,
    setProgressBar: PropTypes.func.isRequired,
    setChecked: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
    setCard: PropTypes.func.isRequired
};

export default List;