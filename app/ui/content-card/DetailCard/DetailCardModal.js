'use client'

import MemberDropdown from '@/app/ui/Common/MemberDropdown/MemberDropdown';
import AttachmentFiles from '@/app/ui/content-card/AttachmentFiles/AttachmentFiles';
import List from '@/app/ui/content-card/List/List';
import Comment from '@/app/ui/content-card/Comment/Comment';
import QuillEditor from '@/app/lib/quillEditor';
import { CreateComment, CreateList, EditDescription, EditTitleCard, ShowCheckedlist} from '@/app/ui/buttons';
import { getFirstLetters, fetchColumnData} from '@/app/utilities/function';
import { UploadAttchmentFile } from '@/app/lib/action';
import Loading from "@/app/ui/Common/Loading/Loading";

import { CustomToolbar } from '@/app/lib/toolbar';
import { getData, urlFile } from '@/app/lib/api';
import { useRouter } from 'next/navigation'

import './DetailCardModal.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVisibility } from '@/app/home';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import imageCompression from 'browser-image-compression';
import PropTypes from 'prop-types'
const ObjectId = require('mongoose').Types.ObjectId;

const DetailCardModal = (props) => {
    const router = useRouter();

    const {params} = props;
    const { boards, setBoards } = useVisibility();
    
    const [board, setBoard] = useState({});
    const [column, setColumn] = useState({});
    const [card, setCard] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const {boards} = await getData();
                if(boards.length > 0 && params.board_id){
                    setBoards(boards);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

       fetchData();

    }, [params.board_id]);

    useEffect(() => {
        const fetchData = async () => {
            if(params) {
                if (boards.length > 0 && params.board_id) {
                    const board = boards.find(item => item._id.slice(6, 14) === params.board_id);
        
                    if (board && params.card_id && params.card_title) {
                        const { columns, column, card } = await fetchColumnData(board, params.card_id);
                        if (columns.length > 0 && card && card.title.toLowerCase().replace(/ /g, "-") === params.card_title) {
                            setBoard(board);
                            setColumn(column);
                            setCard(card)
                        } else {
                            document.getElementsByClassName("trello-master")[0].style.backgroundColor = "";
                            document.getElementsByClassName("navbar-app")[0].style.backgroundColor = "";
                            document.getElementsByClassName("navbar-board")[0].style.backgroundColor = "";
                            document.getElementsByClassName("sidebar")[0].style.backgroundColor = "";
                            document.getElementById("sidebar-title").style.backgroundColor = "";
                            document.getElementById("boards-rows").style.backgroundColor = "";
                            router.push('/');
                        }
                    } else {
                        document.getElementsByClassName("trello-master")[0].style.backgroundColor = "";
                        document.getElementsByClassName("navbar-app")[0].style.backgroundColor = "";
                        document.getElementsByClassName("navbar-board")[0].style.backgroundColor = "";
                        document.getElementsByClassName("sidebar")[0].style.backgroundColor = "";
                        document.getElementById("sidebar-title").style.backgroundColor = "";
                        document.getElementById("boards-rows").style.backgroundColor = "";
                        router.push('/');
                    }
                }
            }
        };
    
        fetchData();
    }, [params, boards]);

    //Header Title
    const [titleCard, setTitleCard] = useState('');
    const [isFirstClick, setIsFirstClick] = useState(true);
    const inputRef = useRef(null);

    useEffect(() => {
        if(card != null){
            if(card.title != null) {
                if(inputRef.current != null){
                    inputRef.current.value = card.title;
                    setTitleCard(card.title);
                }
            }
        }
    }, [card])

    const selectAllText = (event) => {
        setIsFirstClick(false);
        
        if(isFirstClick) {
            event.target.select();
        } else {
            inputRef.current.setSelectionRange(titleCard.length, titleCard.length);
        }
    }

    const handleClickOutside = async () => {
        //Do something...
        setIsFirstClick(true);
        
        if(titleCard !== '') {
            const value =  await EditTitleCard(params, titleCard);
            setBoards(value.cardsR.columnsR.boardsR);
            setBoard(value.cardsR.columnsR.newBoard);
            setCard(value.newCard);
        } else {
            await EditTitleCard(params, card.title);
        }
    }
    
    //Description
    const [showButtonDescription, setShowButtonDescription] = useState(false);
    const [valueTextArea, setValueTextArea] = useState('');
    const textAreaRef = useRef(null);
    const [lastChange, setLastChange] = useState(null);

    useEffect(() => {
        if(card !== null && card.description != null ) { 
            if(quillRef.current !== null && showButtonDescription === true) {
                quillRef.current.focus();
                const cursorPosition = quillRef.current.getLength();
                quillRef.current.setSelection(0 + cursorPosition);
            }
        }
    }, [card, showButtonDescription])

    const onUpdateDescription = async () => {

        const description = {
            ops:lastChange.ops
        };
        
        const value = await EditDescription(params, description);
        setBoards(value.cardsR.columnsR.boardsR);
        setBoard(value.cardsR.columnsR.newBoard);
        setCard(value.newCard);
        textAreaRef.value = valueTextArea;
        setShowButtonDescription(false);
    }

    //Comment
    const [isShowButtonComment, setIsShowButtonComment] = useState(false);
    const CommentRef = useRef(null); //to get value in the form of object

    useEffect(() => {
        if(isShowButtonComment === true && CommentRef) {
            CommentRef.current.focus();
        }
    }, [isShowButtonComment])
    
    const handleAddNewComment = async () => {

        //validate
        if(!lastChange){
            return;
        }

        const comment = {
            ops:lastChange.ops
        };

        const value = await CreateComment(params, comment);
        setBoards(value.cardsR.columnsR.boardsR);
        setBoard(value.cardsR.columnsR.newBoard);
        setCard(value.newCard);
        
        setLastChange('');
        setIsShowButtonComment(false);
    }

    //Checklist
    const [progressBar, setProgressBar] = useState("0%");
    const [checked, setChecked] = useState(0);
    const [isShowChecked, setIsShowChecked] = useState(false);
    const [isShowAddNewChecklist, setIsShowAddNewChecklist] = useState(false); //show input
    const ChecklistRef = useRef(null); //to get value in the form of object

    useEffect(() => {

        if(card != null){
            if(card.checklist != null ) { 
                if(card.checklist.length > 0) {
                    let checked = 0;
                    const myBar = document.getElementById("myBar");
                    for(const element of card.checklist) {
                        if(element.check === true) {
                            checked++
                        }
                    }
                    
                    const resultProgress = Math.round(((checked / card.checklist.length) * 100)) + "%";
                    myBar.style.width = resultProgress;
                    setProgressBar(resultProgress);
                    setChecked(checked);
                    
                }
            }
    
            if(card.showChecked != null ) { 
                if(card.showChecked !== false) {
                    setIsShowChecked(false);
                } else {
                    setIsShowChecked(true);
                }
    
            }
        }
        
    }, [card])

    useEffect(() => {
        if(isShowAddNewChecklist === true && ChecklistRef) {
            ChecklistRef.current.focus();
        }
    }, [isShowAddNewChecklist])

    const handleAddNewChecklist = async (list) => {
        //validate
        if(ChecklistRef.current.value === ''){
            setIsShowAddNewChecklist(false);
            return;
        }
        
        const value = await CreateList(params, list);
        setIsShowAddNewChecklist(false);
        setBoards(value.cardsR.columnsR.boardsR);
        setBoard(value.cardsR.columnsR.newBoard);
        setCard(value.newCard);
    }

    const handleShowChecked = async () => {
        if(isShowChecked === true ){
            const value = await ShowCheckedlist(params, true);
            setBoards(value.cardsR.columnsR.boardsR);
            setBoard(value.cardsR.columnsR.newBoard);
            setCard(value.newCard);
            setIsShowChecked(true);
        } else {
            const value = await ShowCheckedlist(params, false);
            setBoards(value.cardsR.columnsR.boardsR);
            setBoard(value.cardsR.columnsR.newBoard);
            setCard(value.newCard);
            setIsShowChecked(false);
        }
    }

    //Attachment File
    const fileSubmitRef = useRef(null);
    const [dataFromChild, setDataFromChild] = useState("");
    const [isFile, setIsFile] = useState();
    const fileRef = useRef(null);
    const quillRef = useRef(null);
    
    const handleChangeSubmitUploadFile = useCallback(async (event) => {
        // Your handleChangeSubmitUploadFile logic here
        const fileUpload = document.getElementById("fileUpload");
        fileUpload.click();

        let dataImage = '';
        if(fileUpload.value !== ''){
            if(event.target.files[0] !== undefined) {
                const idTemp = new ObjectId().toString();
                const newFiles = {
                    _id: idTemp,
                    name: event.target.files[0].name,
                    size: event.target.files[0].size,
                    type: event.target.files[0].type,
                }
        
                let newCardTemp = {...card};

                const found = newCardTemp.files.some(element => element.name === newFiles.name && element.type === newFiles.type);
                if(!found) {
                    const type = newFiles.type.split("/");
                    if(type[0] === "image"){
                        const options = {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1920,
                            useWebWorker: true,
                            fileType: 'image/webp',
                        };
    
                        const compressedFile = await imageCompression(event.target.files[0], options);
                        try {
                            const value = await UploadAttchmentFile(params, idTemp, event.target.files[0], compressedFile)
                            setBoards(value.cardsR.columnsR.boardsR);
                            setBoard(value.cardsR.columnsR.newBoard);
                            setCard(value.newCard);
                            dataImage = value.dataImage;
                        } catch (error) {
                            console.log(error);
                        }
                    } else {
                        try {
                            const value = await UploadAttchmentFile(params, idTemp, event.target.files[0], null);
                            setBoards(value.cardsR.columnsR.boardsR);
                            setBoard(value.cardsR.columnsR.newBoard);
                            setCard(value.newCard);
                            dataImage = value.dataImage;
                        } catch (error) {
                            console.log(error);
                        }
                    }
                } else {
                    const results = newCardTemp.files.filter(element => element.name === newFiles.name && element.type === newFiles.type);
                    dataImage = results[0].data;
                }
            }

            if(quillRef.current && showButtonDescription === true) {
                quillRef.current.focus();
                const cursorPosition = quillRef.current.getSelection().index;
                quillRef.current.insertText(cursorPosition, event.target.files[0].name, 'link', urlFile+dataImage);
                quillRef.current.setSelection(cursorPosition + event.target.files[0].name.length);
            } else if(CommentRef.current && isShowButtonComment === true) {
                const cursorPosition = CommentRef.current.getSelection().index;
                CommentRef.current.insertText(cursorPosition, event.target.files[0].name, 'link', urlFile+dataImage);
                CommentRef.current.setSelection(cursorPosition + event.target.files[0].name.length);
            } else if(dataFromChild) {
                const cursorPosition = dataFromChild.current.getSelection().index;
                dataFromChild.current.insertText(cursorPosition, event.target.files[0].name, 'link', urlFile+dataImage);
                dataFromChild.current.setSelection(cursorPosition + event.target.files[0].name.length);
            }
        }

        if(fileSubmitRef.current !== null) {
            fileSubmitRef.current.value = null;
        }
    }, [card, dataFromChild, isShowButtonComment, showButtonDescription]);

    //File Description
    useEffect(() => {
        if (quillRef.current && showButtonDescription === true) {

            const insertFileButton = document.querySelector('.insertFile');
            if (insertFileButton) {
                insertFileButton.addEventListener('click', handleChangeSubmitUploadFile);
            }

            return () => {
                // Cleanup: Remove the event listener when the component unmounts
                if (insertFileButton) {
                    insertFileButton.removeEventListener('click', handleChangeSubmitUploadFile);
                }
            };
        }
    }, [showButtonDescription, handleChangeSubmitUploadFile, quillRef]);

    //File Comment
    useEffect(() => {
        if (CommentRef.current && isShowButtonComment === true) {

            const insertFileButton = document.querySelector('.insertFile');
            if (insertFileButton) {
                insertFileButton.addEventListener('click', handleChangeSubmitUploadFile);
            }

            return () => {
                // Cleanup: Remove the event listener when the component unmounts
                if (insertFileButton) {
                    insertFileButton.removeEventListener('click', handleChangeSubmitUploadFile);
                }
            };
        }
    }, [isShowButtonComment, handleChangeSubmitUploadFile, CommentRef]);

    const handleUploadFile = async () => {
        if(fileRef.current !== null) {
            fileRef.current.value = null;
        }

        const idTemp = new ObjectId().toString();
        let newCardTemp = {...card};
        if(isFile){
            const found = newCardTemp.files.some(element => element.name === isFile.name && element.type === isFile.type);
            if(!found) {
                try {
                    const type = isFile.type.split("/");
                    
                    if(type[0] === "image"){
                        const options = {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1920,
                            useWebWorker: true,
                            fileType: 'image/webp',
                        };
    
                        const compressedFile = await imageCompression(isFile, options);
                        try {
                            const value = await UploadAttchmentFile(params, idTemp, isFile, compressedFile);
                            
                            setBoards(value.cardsR.columnsR.boardsR);
                            setBoard(value.cardsR.columnsR.newBoard);
                            setCard(value.newCard);
                        } catch (error) {
                            console.log(error);
                        }
                    } else {
                        try{
                            const value = await UploadAttchmentFile(params, idTemp, isFile, null);
                            setBoards(value.cardsR.columnsR.boardsR);
                            setBoard(value.cardsR.columnsR.newBoard);
                            setCard(value.newCard);
                        } catch(error){
                            console.log(error);
                        }
                    }
                    
                } catch (error) {
                    console.error('Error compressing image: ', error);
                }
            }
            setFileDropdown(false);
        }
    }

    const handleChangeUploadFile = (event) => {
        setIsFile(event.target.files[0]);
    }

    const fileComment = (file) => {
        if(CommentRef.current !== null) {
            CommentRef.current.focus();
            CommentRef.current.insertText(0, file.name, "link", `${urlFile}${file.data}`);
        }
    }

    //Dropdown
    const [fileDropdown, setFileDropdown] = useState(false);
    const [memberDropdown, setMemberDropdown] = useState(false);
    const [memberDropdownModal, setMemberDropdownModal] = useState(false);

    if(card != null && params != null ){

        return (
            <Modal show={true} onHide={() => router.push(`/b/${params.board_id}/${board.title.toLowerCase().replace(/ /g, "-")}`)} size="lg" centered>
                <div id='modal'>
                    <Modal.Header closeButton id='modal-header'>
                        <div>
                            <div className='group-btn'>
                                <i className='bi-card-heading icon'></i>
                                <Form.Control 
                                    size={"sm"}
                                    type="text"
                                    value={titleCard}
                                    className='customize-input-column'
                                    onClick={selectAllText}
                                    onChange={(event) => setTitleCard(event.target.value)}
                                    spellCheck="false"
                                    onBlur={handleClickOutside}
                                    onMouseDown={(e) => e.preventDefault()}
                                    ref={inputRef}
                                />
                            </div>
                            <div id='list'>in list {column.title}</div>
                        </div>
                    </Modal.Header>
                    <Modal.Body id='modal-body'>
                        <Row>
                            <Col xs={12} md={9}>
                                <div id='members-notifications'>
                                    {card && card.member.length > 0 && 
                                        <>
                                            <div id='label-members'>Members</div>
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
                                                <div id='icon-add-member'>
                                                    <Dropdown className='modal-dropdown' show={memberDropdownModal} onToggle={(isOpen) => setMemberDropdownModal(isOpen)}>
                                                        <Dropdown.Toggle id='button-modal' size='sm'>
                                                            <i className='bi bi-plus-lg'></i>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu className='modal-dropdown-body'>
                                                            <Dropdown.Header className='modal-header'>Members<button className='bi bi-x' onClick={() => setMemberDropdownModal(false)}></button></Dropdown.Header>
                                                            <MemberDropdown
                                                                params={params}
                                                                memberDropdown={memberDropdownModal}
                                                                board={board}
                                                                card={card}
                                                                setBoardModal={setBoard}
                                                                setCardModal={setCard}
                                                            />
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                                <div className='group-btn'>
                                    <i className='bi-justify-left icon'></i>
                                    <h6>Description</h6>
                                    {card.description.ops.length > 0 && 
                                        <button className='btn badge btn-secondary btnDescription' onClick={() => {
                                            setShowButtonDescription(true); 
                                            setLastChange('')
                                            setIsShowButtonComment(false);
                                            quillRef.current.focus();
                                        }}>Edit</button>
                                    }
                                </div>
                                <div className='section'>
                                    {showButtonDescription === false &&  
                                        <div id='quill-description' onClick={() => {
                                            if(quillRef.current.editor.delta.ops.length <= 1 ){
                                                setShowButtonDescription(true); 
                                                setLastChange('');
                                                setIsShowButtonComment(false);
                                            }
                                        }}>
                                            <QuillEditor 
                                                ref={quillRef}
                                                placeholder="Add a more detailed description..."
                                                defaultValue={card.description}
                                                modules={{
                                                    toolbar: false,
                                                }}
                                                readOnly = {true}
                                                onTextChange={setLastChange}
                                            />
                                        </div>
                                    }
                                    {showButtonDescription === true &&
                                        <div id='edit-description-quill'>
                                            <div className="text-editor">
                                                <CustomToolbar
                                                    toolbarId = {column._id.toString().replace(/^[^a-zA-Z]+/g, '_')}
                                                    handleUploadFile = {handleUploadFile}
                                                />
                                                <QuillEditor 
                                                    modules={{
                                                        toolbar: {
                                                            container: `#${column._id.toString().replace(/^[^a-zA-Z]+/g, '_')}`,
                                                        },
                                                    }}
                                                    readOnly={false}
                                                    ref={quillRef}
                                                    placeholder="Add a more detailed description..."
                                                    defaultValue={card.description}
                                                    onTextChange={setLastChange}
                                                />
                                            </div>
                                            <div className='group-btn'>
                                                <button className='btn badge btn-primary' onClick={() => onUpdateDescription()}>Save</button>
                                                <button className='btn badge btn-danger' onClick={() => {
                                                    setShowButtonDescription(false);
                                                    setValueTextArea("");
                                                }}>Cancel</button>
                                            </div>
                                            {/* <div className="custom-file">
                                                <label htmlFor='fileUpload' className='icon-fileUpload'><i className='bi-paperclip'></i></label>
                                                <input type='file' id='fileUpload'></input>
                                            </div> */}
                                        </div>
                                    }
                                </div>

                                {card.files && card.files.length > 0 && 
                                    <div className='group-btn'>
                                        <i className='fa fa-paperclip icon'></i>
                                        <h6>Attachments</h6>
                                    </div>
                                }
                                {card.files && card.files.length > 0 && 
                                    card.files.map((file) => {
                                    return (
                                        <AttachmentFiles 
                                            key={file._id}
                                            file={file}
                                            card={card}
                                            fileComment={fileComment}
                                            setIsShowButtonComment={setIsShowButtonComment}
                                            params={params}
                                            setBoard={setBoard}
                                            setCard={setCard}
                                        />
                                    )
                                })}

                                <div id='checklist-title' className='group-btn'>
                                    <i className='bi-check2-square icon'></i>
                                    <h6>Checklist</h6>
                                    {isShowChecked === false && 
                                        <button className='btn badge btn-secondary btnHide' onClick={() => handleShowChecked()}>Hide checked items</button>
                                    }
                                    {isShowChecked === true &&
                                        <button className='btn badge btn-secondary btnHide' onClick={() => handleShowChecked()}>Show checked items ({checked})</button>
                                    }
                                </div>
                                <div className='group-btn' id='progress-bar'>
                                    <div id="numberProgress">{progressBar}</div>
                                    <div id="myProgress">
                                        <div id="myBar"></div>
                                    </div>
                                </div>
                                {card.checklist && card.checklist.length > 0 && isShowChecked === false && card.checklist.map((checklist) => {
                                    return (
                                        <List 
                                            key={checklist._id}
                                            checklist={checklist}
                                            card={card}
                                            board={board}
                                            setProgressBar={setProgressBar}
                                            setChecked={setChecked}
                                            params={params}
                                            setBoard={setBoard}
                                            setCard={setCard}
                                        />
                                    )
                                })}
                                {card.checklist && card.checklist.length > 0 && isShowChecked === true && 
                                    card.checklist.filter(checklist => checklist.check === false)
                                    .map((checklist) => {
                                    return (
                                        <List 
                                            key={checklist._id}
                                            checklist={checklist}
                                            card={card}
                                            board={board}
                                            setProgressBar={setProgressBar}
                                            setChecked={setChecked}
                                            params={params}
                                            setBoard={setBoard}
                                            setCard={setCard}
                                        />
                                    )
                                })}
                                <div className='section' id='section-checklist'>
                                    {isShowAddNewChecklist === false &&
                                        <button className='btn badge btn-secondary' onClick={() => setIsShowAddNewChecklist(true)}>Add an item</button>
                                    }
                                    {isShowAddNewChecklist === true &&
                                        <div>
                                            <input
                                                className="form-control input-checklist"
                                                ref={ChecklistRef}
                                                defaultValue={''}
                                                placeholder="Add an item"
                                                onKeyDown={(event) => {if(event.key === "Enter"){
                                                    if(!event.target.value) {setIsShowAddNewChecklist(false)} 
                        
                                                    handleAddNewChecklist(event.target.value);
                                                }}}
                                                spellCheck='false'
                                            >
                                            </input>
                                            <div className='group-btn'>
                                                <button className='btn badge btn-primary' onClick={() => {handleAddNewChecklist(ChecklistRef.current.value)}}>Add</button>
                                                <button className='btn badge btn-danger' onClick={() => {
                                                    setIsShowAddNewChecklist(false);
                                                    ChecklistRef.current.value = '';
                                                }}>Cancel</button>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className='section'>
                                    {isShowButtonComment === false &&
                                        <div id='comment' className='form-control' 
                                            onClick={() => {
                                                setIsShowButtonComment(true); 
                                                setValueTextArea('');
                                                setShowButtonDescription(false);
                                        }}>Write a comment...</div>
                                    }
                                    {isShowButtonComment === true &&
                                        <div id='quill-comment-edit'>
                                            <CustomToolbar
                                                toolbarId = {card._id.toString().replace(/^[^a-zA-Z]+/g, '_')}
                                            />
                                            <QuillEditor
                                                placeholder='Write a comment...'
                                                modules={{
                                                    toolbar: {
                                                        container: `#${card._id.toString().replace(/^[^a-zA-Z]+/g, '_')}`,
                                                    },
                                                }}
                                                ref={CommentRef}
                                                readOnly={false}
                                                onTextChange={setLastChange}
                                            />
                                            <div className='group-btn'>
                                                <button className='btn badge btn-primary' onClick={() => handleAddNewComment()}>Save</button>
                                                <button className='btn badge btn-danger' onClick={() => {
                                                    setIsShowButtonComment(false);
                                                    setLastChange("");
                                                }}>Cancel</button>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {card.comments && card.comments.length > 0 && card.comments.map((comment) => {
                                    return (
                                        <Comment
                                            key={comment._id} 
                                            comment={comment}
                                            setDataFromChild={setDataFromChild}
                                            handleChangeSubmitUploadFile={handleChangeSubmitUploadFile}
                                            params={params}
                                            setBoard={setBoard}
                                            setCard={setCard}
                                        />
                                    )
                                })}
                            </Col>
                            <Col xs={6} md={3}>
                                <Dropdown className='modal-dropdown' show={memberDropdown} onToggle={(isOpen) => setMemberDropdown(isOpen)}>
                                    <Dropdown.Toggle className='modal-dropdown-button' size='sm'>
                                        <div className='badge icon-group'><i className='bi-person icon'></i>Member</div>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className='modal-dropdown-body'>
                                        <Dropdown.Header className='modal-header'>Members<button className='bi bi-x' onClick={() => setMemberDropdown(false)}></button></Dropdown.Header>
                                        <MemberDropdown
                                            params={params}
                                            memberDropdown={memberDropdown}
                                            board={board}
                                            card={card}
                                            setBoardModal={setBoard}
                                            setCardModal={setCard}
                                        />
                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown className='modal-dropdown' show={fileDropdown} onToggle={(isOpen) => setFileDropdown(isOpen)}>
                                    <Dropdown.Toggle className='modal-dropdown-button' size='sm'>
                                        <div className='badge icon-group'><i className='fa fa-paperclip icon'></i>Attachment</div>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className='modal-dropdown-body'>
                                        <Dropdown.Header className='modal-header'>Attach a file from your computer<button className='bi bi-x' onClick={() => setFileDropdown(false)}></button></Dropdown.Header>
                                        <input type="file" className='form-control input-form' 
                                            onChange={handleChangeUploadFile}
                                            ref={fileRef}
                                            encType="multipart/form-data"
                                        />
                                        <button type="submit" className='btn btn-primary badge'onClick={handleUploadFile}>Insert</button>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <input type='file' id='fileUpload' style={{display: "none"}} onChange={handleChangeSubmitUploadFile} ref={fileSubmitRef} encType="multipart/form-data"></input>
                    </Modal.Footer>   
                </div>
            </Modal>
        );
    }
}

DetailCardModal.propTypes = {
    params: PropTypes.object.isRequired,
};

export default DetailCardModal;