'use client'

import AttachmentFiles from '@/app/ui/content-card/AttachmentFiles/AttachmentFiles';
import List from '@/app/ui/content-card/List/List';
import Comment from '@/app/ui/content-card/Comment/Comment';
import QuillEditor from '@/app/lib/quillEditor';
import { CreateComment, CreateList, EditDescription, EditTitleCard, ShowCheckedlist} from '@/app/ui/buttons';
import { MemberDropdownToggle , FileDropdownToggle } from './DropdownDetail';
import { getFirstLetters, fetchColumnData} from '@/app/utilities/function';
import { UploadAttchmentFile } from '@/app/lib/action';

import { CustomToolbar } from '@/app/lib/toolbar';
import { getData, urlFile } from '@/app/lib/api';
import { useVisibility } from '@/app/home';

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import imageCompression from 'browser-image-compression';
import PropTypes from 'prop-types';
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

                    setIsFile(undefined);
                    
                } catch (error) {
                    console.error('Error compressing image: ', error);
                }
            }
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

    if(card != null && params != null ){

        return (
            <Transition appear show={true}>
                <Dialog as="div" className="relative z-10 focus:outline-none" onClose={() => router.push(`/b/${params.board_id}/${board.title.toLowerCase().replace(/ /g, "-")}`)}>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/25">
                        <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 transform-[scale(95%)]"
                            enterTo="opacity-100 transform-[scale(100%)]"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 transform-[scale(100%)]"
                            leaveTo="opacity-0 transform-[scale(95%)]"
                        >
                            <DialogPanel className="w-full max-w-4xl rounded-xl bg-list-bg-color p-6 backdrop-blur-2xl">
                                {/* Header Modal */}
                                <div className='flex items-center'>
                                    <DialogTitle as="h3" className="text-black w-full">
                                        <div className='mb-1 text-base sm:text-xl font-medium'>
                                            <i className='bi-card-heading mr-1 '></i>
                                            <input
                                                type="text"
                                                value={titleCard}
                                                className='bg-inherit focus:shadow-md focus:outline-none px-2 py-1'
                                                onClick={selectAllText}
                                                onChange={(event) => setTitleCard(event.target.value)}
                                                spellCheck="false"
                                                onBlur={handleClickOutside}
                                                onMouseDown={(e) => e.preventDefault()}
                                                ref={inputRef}
                                            />
                                        </div>
                                        <div className='ml-8'>in list {column.title}</div>
                                    </DialogTitle>
                                    <button
                                        onClick={() => router.push(`/b/${params.board_id}/${board.title.toLowerCase().replace(/ /g, "-")}`)}
                                        title="Close modal"
                                        className="p-2 hover:bg-hover-button hover:rounded-md"
                                    >
                                        <i className='bi bi-x sm:bi-x-lg text-black text-xl'></i>
                                    </button>
                                </div>

                                {/* Body Modal */}
                                <div className='grid grid-cols-1 sm:grid-cols-7 mt-5'>
                                    <div className='sm:col-span-6 pr-5'>

                                        {/* Member */}
                                        <div>
                                            {card && card.member.length > 0 && 
                                                <div className='ml-8'>
                                                    <div className='font-medium text-base'>Members</div>
                                                    <div className='flex items-center mt-2 mb-4'>
                                                        {card.member && card.member.length > 0 && card.member.map((member, index) => {
                                                            return (
                                                                <div className="-ml-2" title={member.name} key={member._id}>
                                                                    <div className="mx-1 grid place-items-center w-9 h-9 bg-navbar-board-bg-color rounded-full border-2 border-list-bg-color" style={{backgroundColor: board.background.hex}}>
                                                                        <div className='text-list-bg-color font-bold cursor-default'>
                                                                            {getFirstLetters(member.name)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                        <div>
                                                            <MemberDropdownToggle
                                                                params={params}
                                                                code={"member-modal"}
                                                                board={board}
                                                                card={card}
                                                                setBoard={setBoard}
                                                                setCard={setCard}
                                                                setShowButtonDescription={setShowButtonDescription}
                                                                setIsShowButtonComment={setIsShowButtonComment}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </div>

                                        {/* Description */}
                                        <div className='flex items-center mb-3 text-base'>
                                            <i className='bi-justify-left mr-2'></i>
                                            <h6 className=' font-medium'>Description</h6>
                                            {card.description.ops.length > 0 && 
                                                <button className='ml-2 px-2 py-1 rounded-md text-xs bg-slate-500 text-white hover:bg-hover-button hover:text-black' onClick={() => {
                                                    setShowButtonDescription(true); 
                                                    setLastChange('')
                                                    setIsShowButtonComment(false);
                                                    quillRef.current.focus();
                                                }}>Edit</button>
                                            }
                                        </div>
                                        <div className='ml-6'>
                                            {showButtonDescription === false ? 
                                            
                                                card.description.ops.length === 0 ?  
                                                
                                                <div className='py-3 pr-8 pl-3 border border-stone-400/50 bg-white rounded-2xl text-slate-500 cursor-pointer hover:shadow-md hover:text-black' 
                                                onClick={() => {
                                                    setShowButtonDescription(true); 
                                                    setLastChange('');
                                                    setIsShowButtonComment(false);
                                                }}>Add a more detailed description...</div>
                    

                                                :

                                                <div className={`bg-white rounded-2xl ${card.description.ops.length > 0 ? 'cursor-default' : 'cursor-pointer'}`} onClick={() => {
                                                    if(quillRef.current.editor.delta.ops.length <= 1 ){
                                                        setShowButtonDescription(true); 
                                                        setLastChange('');
                                                        setIsShowButtonComment(false);
                                                    }
                                                }}>
                                                    <QuillEditor 
                                                        ref={quillRef}
                                                        placeholder=""
                                                        defaultValue={card.description}
                                                        modules={{
                                                            toolbar: false,
                                                        }}
                                                        readOnly = {true}
                                                        onTextChange={setLastChange}
                                                    />
                                                </div>

                                            :

                                            <div id='edit-description-quill'>
                                                <div className="text-editor bg-white rounded-2xl">
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
                                                <div className='flex mt-2'>
                                                    <button className='px-2 py-1 font-bold rounded-md bg-blue-600 text-white hover:bg-hover-button hover:text-black' onClick={() => onUpdateDescription()}>Save</button>
                                                    <button className='ml-2 px-2 py-1 font-bold rounded-md bg-red-600 text-white hover:bg-hover-button hover:text-black' onClick={() => {
                                                        setShowButtonDescription(false);
                                                        setValueTextArea("");
                                                    }}>Cancel</button>
                                                </div>
                                            </div>
                                            }
                                            {/* {showButtonDescription === true &&
                                            } */}
                                        </div>

                                        {/* Attachmen File */}
                                        {card.files && card.files.length > 0 && 
                                            <>
                                                <div className='flex items-center mt-3 mb-3 text-base'>
                                                    <i className='fa fa-paperclip mr-2'></i>
                                                    <h6 className='font-medium'>Attachments</h6>
                                                </div>
                                                {
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
                                                    )})                                                   
                                                }
                                            </>
                                        }

                                        {/* Checklist */}
                                        <div id='checklist-title' className='flex items-center mt-4 mb-3 text-base'>
                                            <i className='bi-check2-square mr-3'></i>
                                            <h6 className='font-medium'>Checklist</h6>
                                            {isShowChecked === false && 
                                                <button className='ml-2 px-1 py-1 text-xs font-medium rounded-md bg-slate-500 text-white hover:bg-hover-button hover:text-black btnHide' onClick={() => handleShowChecked()}>Hide checked items</button>
                                            }
                                            {isShowChecked === true &&
                                                <button className='ml-2 px-1 py-1 text-xs font-medium rounded-md bg-slate-500 text-white hover:bg-hover-button hover:text-black btnHide' onClick={() => handleShowChecked()}>Show checked items ({checked})</button>
                                            }
                                        </div>
                                        <div className='flex items-center mt-3 mb-3' id='progress-bar'>
                                            <div id="numberProgress" className='mr-2'>{progressBar}</div>
                                            <div id="myProgress" className='m-auto w-full bg-white/70 rounded-3xl h-3'>
                                                <div id="myBar" className='w-0 h-3 rounded-3xl bg-navbar-board-bg-color'></div>
                                            </div>
                                        </div>
                                        {card.checklist && card.checklist.length > 0 && isShowChecked === false ? card.checklist.map((checklist) => {
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
                                            
                                        })

                                        :

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
                                            )})
                                        }
                                        <div className='ml-8 mt-2' id='section-checklist'>
                                            {isShowAddNewChecklist === false &&
                                                <button className='px-2 py-1 rounded-md font-medium bg-blue-600 text-white hover:bg-hover-button hover:text-black' onClick={() => setIsShowAddNewChecklist(true)}>Add an item</button>
                                            }
                                            {isShowAddNewChecklist === true &&
                                                <div>
                                                    <input
                                                        className="input-checklist py-1.5 pr-8 pl-3 w-full rounded-md focus:outline-blue-400 focus:outline"
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
                                                    <div className='flex mt-2'>
                                                        <button className='px-2 py-1 rounded-md font-medium text-white bg-blue-600 hover:text-black hover:bg-hover-button' onClick={() => {handleAddNewChecklist(ChecklistRef.current.value)}}>Add</button>
                                                        <button className='ml-2 px-2 py-1 rounded-md font-medium text-white bg-red-600 hover:text-black hover:bg-hover-button' onClick={() => {
                                                            setIsShowAddNewChecklist(false);
                                                            ChecklistRef.current.value = '';
                                                        }}>Cancel</button>
                                                    </div>
                                                </div>
                                            }
                                        </div>

                                        {/* Comment */}
                                        <div className='ml-8 mt-10'>
                                            {isShowButtonComment === false &&
                                                <div className='py-3 pr-8 pl-3 border border-stone-400/50 bg-white rounded-2xl text-slate-500 cursor-pointer hover:shadow-xl hover:text-black' 
                                                    onClick={() => {
                                                        setIsShowButtonComment(true); 
                                                        setValueTextArea('');
                                                        setShowButtonDescription(false);
                                                }}>Write a comment...</div>
                                            }
                                            {isShowButtonComment === true &&
                                                <div className='w-full'>
                                                    <div className='bg-white rounded-2xl'>
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
                                                    </div>
                                                    <div className='flex mt-2'>
                                                        <button className='px-2 py-1 font-bold rounded-md bg-blue-600 text-white hover:bg-hover-button hover:text-black btn-primary' onClick={() => handleAddNewComment()}>Save</button>
                                                        <button className='ml-2 px-2 py-1 font-bold rounded-md bg-red-600 text-white hover:bg-hover-button hover:text-black btn-danger' onClick={() => {
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
                                    </div>
                                    <div className='ml-8 mt-5 sm:mt-0 sm:ml-0 sm:col-span-1'>
                                        <MemberDropdownToggle
                                            params={params}
                                            code={"member-dropdown"}
                                            board={board}
                                            card={card}
                                            setBoard={setBoard}
                                            setCard={setCard}
                                        />
                                        <FileDropdownToggle
                                            isFile={isFile}
                                            fileRef={fileRef}
                                            setIsFile={setIsFile}
                                            handleChangeUploadFile={handleChangeUploadFile}
                                            handleUploadFile={handleUploadFile}
                                        />
                                    </div>
                                    <input type='file' className='invisible' onChange={handleChangeSubmitUploadFile} ref={fileSubmitRef} encType="multipart/form-data"></input>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        );
    }
}

DetailCardModal.propTypes = {
    params: PropTypes.object.isRequired,
};

export default DetailCardModal;