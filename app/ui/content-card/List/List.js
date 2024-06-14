'use client'

import { useVisibility } from '@/app/home';
import MemberDropdown from '@/app/ui/Common/MemberDropdown/MemberDropdown';
import { DeleteList, DueDateList, EditList, RemoveDueDateList, ValueChecklist } from '@/app/ui/buttons';
import { getFirstLetters } from '@/app/utilities/function';

import './List.scss';
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useRef, useState, forwardRef} from 'react';
import dateFormat from "dateformat";
import DatePicker from "react-datepicker";
import Dropdown from 'react-bootstrap/Dropdown';
import PropTypes from 'prop-types'

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
    const { setBoards } = useVisibility();

    const inputRef = useRef(null);
    const [labelList, setLabelList] = useState(false);

    const [showEditChecklist, setShowEditChecklist] = useState(false); //show input
    const ChecklistRef = useRef(null); //to get value in the form of object
    //const [checked, setChecked] = useState(0);

    const [startDate, setStartDate] = useState('');
    const [assignDropdown, setAssignDropdown] = useState(false);
    const [showIcon, setShowIcon] = useState(false);
    const DateRef = useRef(null);

    useEffect(() => {
        if(checklist && checklist.check === true) {
            if(inputRef.current !== null){
                inputRef.current.checked = true;
                setLabelList(true);
            }
        }
    }, [checklist])

    const UpdateChecklist = async () => {
        if(inputRef.current !== null) {
            if(checklist.check === false) {
                const value = await ValueChecklist(params, checklist, true);
                setBoards(value.cardsR.columnsR.boardsR);
                setBoard(value.cardsR.columnsR.newBoard);
                setCard(value.newCard);
                setLabelList(true);
            } else if(checklist.check === true) {
                const value = await ValueChecklist(params, checklist, false);
                setBoards(value.cardsR.columnsR.boardsR);
                setBoard(value.cardsR.columnsR.newBoard);
                setCard(value.newCard);
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
                inputRef.current.style.marginTop = "-35px"
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
            inputRef.current.style.marginTop = "0px"
            return;
        }
        
        const value = await EditList(params, checklist, list);

        setBoards(value.cardsR.columnsR.boardsR);
        setBoard(value.cardsR.columnsR.newBoard);
        setCard(value.newCard);

        setShowEditChecklist(false);
        inputRef.current.style.marginTop = "0px"
    }

    const handleDeleteList = async () => {

        const value = await DeleteList(params, checklist)

        setBoards(value.cardsR.columnsR.boardsR);
        setBoard(value.cardsR.columnsR.newBoard);
        setCard(value.newCard);

        let checked = 0;
        const myBar = document.getElementById("myBar");
        if(card.checklist.length !== 0) {
            for(const element of card.checklist) {
                if(element.check === true) {
                    checked++
                }
            }
            
            const result = Math.round(((checked / card.checklist.length) * 100)) + "%";
            myBar.style.width = result;
            setProgressBar(result);
        } else {
            myBar.style.width = 0 + "%";
            setProgressBar(0+"%");
        }
        
        setChecked(checked);
    }

    const editCheckList = () => {
        if(showEditChecklist === false) {
            inputRef.current.style.marginTop = "-30px"
            setShowEditChecklist(true);
        } else if(showEditChecklist === true) {
            inputRef.current.style.marginTop = "0px"
            setShowEditChecklist(false);
        }
    }

    const handleDueDateList = async (value) => {
        setStartDate(value);
        const valueR = await DueDateList(params, checklist, value);
        setBoards(valueR.cardsR.columnsR.boardsR);
        setBoard(valueR.cardsR.columnsR.newBoard);
        setCard(valueR.newCard);
    }

    const handleRemoveDueDate = ( async () => {
        setStartDate();
        const valueR = await RemoveDueDateList(params, checklist);
        setBoards(valueR.cardsR.columnsR.boardsR);
        setBoard(valueR.cardsR.columnsR.newBoard);
        setCard(valueR.newCard);
    })

    const [customHeader, setCustomHeader] = useState(false);
    const CustomHeader = ({ date, decreaseMonth, increaseMonth }) => {

        return (
            <div id='custom-header-date'>
                {startDate &&
                    <div id='container-clear-button'>
                        <button id='clear-button' onClick={handleRemoveDueDate}>Remove Date</button>
                    </div>
                }
                <div id='container-date-month'>
                    <button id='decrease-button' onClick={decreaseMonth}>{'<'}</button>
                    <span>{dateFormat(date, "mmm yyyy")}</span>
                    <button id='increase-button' onClick={increaseMonth}>{'>'}</button>
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
        <div id='checkbox'>
            <input type="checkbox" 
                name={checklist.list}
                value={checklist.list}
                ref={inputRef}
                onClick={() => UpdateChecklist()}
                className='check'
            >
            </input>
            {showEditChecklist === false &&
                <div className='label' 
                    onMouseEnter={() => setShowIcon(true)}
                    onMouseLeave={() => {
                        if(!customHeader && !assignDropdown){
                            setShowIcon(false);
                            setAssignDropdown(false);
                        }
                    }}
                >
                    <button id='title-list' onClick={() => editCheckList()}>
                        {labelList === false &&
                            <label>{checklist.list}</label>
                        }
                        {labelList === true && 
                            <label className='text-list'>{checklist.list}</label>
                        }
                    </button>
                    <div id='icon-list'>
                        {(checklist.date || checklist.member) && 
                            <>
                                <div className='icon-label badge'><button className='bi-trash3' title='Delete' onClick={() => {handleDeleteList()}}></button></div>
                                {card && card.member.length > 0 && 
                                    <Dropdown className='modal-dropdown' size="sm" show={assignDropdown} onToggle={(isOpen) => setAssignDropdown(isOpen)}>
                                        <Dropdown.Toggle id='dropdown-button-assign' className='badge' size='sm'>
                                            {checklist && !checklist.member && 
                                                <div id='icon-assign' className='badge'>
                                                    <i className='bi-person-add' title='Assign Member'></i>
                                                </div>
                                            }
                                            {checklist.member && 
                                                <div id='assign-member'>
                                                    <div className="member-photo" title={checklist.member.name}>
                                                        <div className="photo" style={{backgroundColor: board.background.hex}}>
                                                            <div>
                                                                {getFirstLetters(checklist.member.name)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className='modal-dropdown-body'>
                                            <Dropdown.Header className='modal-header'>Assign Member<button className='bi bi-x' onClick={() => setAssignDropdown(false)}></button></Dropdown.Header>
                                            <MemberDropdown
                                                checklist={checklist}
                                                code="list-assign"
                                                params={params}
                                                board={board}
                                                card={card}
                                                setBoardModal={setBoard}
                                                setCardModal={setCard}
                                            />
                                        </Dropdown.Menu>
                                    </Dropdown>
                                }
                                {startDate &&
                                    <div className='icon-date'>
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
                                    <div className='icon-date' style={{borderRadius: "100%", paddingLeft: "7px", paddingRight: "7px", paddingBottom: "3px"}}>
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
                        {(!startDate && !checklist.member) && showIcon &&
                            <>
                                <div className='icon-label badge'><button className='bi-trash3' title='Delete' onClick={() => {handleDeleteList()}}></button></div>
                                {card && card.member.length > 0 &&
                                    <Dropdown className='modal-dropdown' size="sm" show={assignDropdown} onToggle={(isOpen) => setAssignDropdown(isOpen)}>
                                        <Dropdown.Toggle id='dropdown-button-assign' className='badge' size='sm'>
                                            <div id='icon-assign' className='badge' style={{marginTop: "2px"}}>
                                                <i className='bi-person-add' title='Assign Member'></i>
                                            </div>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className='modal-dropdown-body'>
                                            <Dropdown.Header className='modal-header'>Assign Member <button className='bi bi-x' onClick={() => setAssignDropdown(false)}></button></Dropdown.Header>
                                            <MemberDropdown
                                                checklist={checklist}
                                                code="list-assign"
                                                params={params}
                                                board={board}
                                                card={card}
                                                setBoardModal={setBoard}
                                                setCardModal={setCard}
                                            />
                                        </Dropdown.Menu>
                                    </Dropdown>
                                
                                }
                                <div className='icon-date' style={{borderRadius: "100%", paddingLeft: "7px", paddingRight: "7px", paddingBottom: "3px"}}>
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
                <div className='edit-checklist'>
                    <input
                    className=" input-checklist form-control"
                    ref={ChecklistRef}
                    defaultValue={checklist.list}
                    placeholder="Add an item"
                    onKeyDown={(event) => {if(event.key === "Enter"){
                        handleEditChecklist(event.target.value);
                    }}}
                    spellCheck='false'
                    >
                    </input>
                    <div className='group-btn'>
                        <button className='btn badge btn-primary' onClick={() => {handleEditChecklist(ChecklistRef.current.value)}}>Save</button>
                        <button className='btn badge btn-danger' onClick={() => {
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