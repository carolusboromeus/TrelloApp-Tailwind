'use server'
import { deleteFile, getData, postData, postFile } from '@/app/lib/api';

import _ from 'lodash';
import { Types } from 'mongoose';
import { fetchAllData } from '../utilities/function';
const ObjectId = Types.ObjectId;

export const UpdateNotifSettings = ( async (newNotifSettings, boards) => {
    postData(boards, newNotifSettings);
})

export const CreateBoard = ( async (formData, colorBackground) => {

    const idTemp = new ObjectId().toString();
    const {boards, notificationSetting} = await getData();
    let newBoard = null;
    
    boards !== null ? newBoard = _.cloneDeep(boards) : newBoard = [];
    newBoard.push({
        _id: idTemp,
        title: formData.get('title'),
        visibility: formData.get('visibility'),
        member:[],
        columnOrder: [],
        columns: [],
        background: colorBackground,
    })

    postData(newBoard, notificationSetting);
    return newBoard;
})

export const UpdateBoard = ( async (newBoard) => {
    const {boards, notificationSetting} = await getData();

    const boardIdUpdate = newBoard._id;
    let nboards = [...boards]; //original boards
    let index = nboards.findIndex(item => item._id === boardIdUpdate);

    if(newBoard._destroy) {
        //remove board
        nboards.splice(index, 1);
    } else {
        nboards[index] = newBoard;
    }

    // console.log(nboards);
    postData(nboards, notificationSetting);
    return nboards;
})

// Content Board

export const UpdateOrder = (async (board, newColumns) => {
    const {boards, notificationSetting} = await getData();

    const _board = {...board};
    _board.columnOrder = newColumns.map(column => column._id);
    _board.columns = newColumns;

    const newBoard = boards.map(b => (b._id === _board._id ? _board : b));

    postData(newBoard, notificationSetting);
    return _board;
})

export const UpdateVisibility = ( async (visibility, board) => {
    
    if(visibility) {
        const newBoard = {
            ...board,
            visibility: visibility,
            member: [],
            _destroy: false
        }
        
        const boardsR = await UpdateBoard(newBoard);
        return {newBoard, boardsR};
    }
})

export const AddNewMember = ( async (valueMember, board) => {
    const newMemberBoard = {
        _id: new ObjectId(valueMember.i),
        boardId: board._id,
        name: valueMember.t,
        type: "Member",
    }
    const newBoard = board;
    newBoard.member.push(newMemberBoard);
    
    const boardsR = await UpdateBoard(newBoard);
    return {newBoard, boardsR};
})

export const UpdateMember = ( async (newMember, board) => {
    const memberIdUpdate = newMember._id;
    
    for (const column of board.columns) {
        for (const card of column.cards){
            for (const list of card.checklist) {
                if(list.member === memberIdUpdate){
                    list.member = null;
                }
                
            }
            card.member = card.member.filter(memberCard => memberCard.memberId !== memberIdUpdate);
        }
    }

    let nMembers = [...board.member];
    let index = nMembers.findIndex(item => item._id === memberIdUpdate);

    if(newMember._destroy) {
        nMembers.splice(index, 1);
    } else {
        nMembers[index] = newMember;
    }

    // console.log(nMembers);

    let newBoard = board;
    newBoard.member = nMembers;
    
    const boardsR = await UpdateBoard(newBoard);
    return {boardsR, newBoard};
})

export const CreateColumn = (async (board, columns, title) => {
    
    const idTemp = new ObjectId().toString();
    const _columns = _.cloneDeep(columns);
    _columns.push({
        _id: idTemp,
        boardId: board._id,
        title: title,
        cards: []
    });

    const newBoard = {...board};
    newBoard.columnOrder = _columns.map(column => column._id);
    newBoard.columns = _columns;

    const boardsR = await UpdateBoard(newBoard);
    return {newBoard, boardsR, _columns}
})

export const UpdateColumn = (async(newColumn, columns, board) => {
    const columnIdUpdate = newColumn._id;
    let ncols = [...columns]; //original columns
    let index = ncols.findIndex(item => item._id === columnIdUpdate);

    if(newColumn._destroy) {
        //remove column
        ncols.splice(index, 1);
    } else {
        //update title
        ncols[index] = newColumn;
    }

    const newBoard = {...board};
    newBoard.columnOrder = ncols.map(column => column._id);
    newBoard.columns = ncols;
    
    const boardsR = await UpdateBoard(newBoard);

    return {newBoard, boardsR, ncols}
})

export const CreateCard = (async(board, columns, column, title) => {

    const idTemp = new ObjectId().toString();
    const newCard = {
        _id: idTemp,
        boardId: column.boardId,
        columnId: column._id,
        title: title,
        description: {ops: []},
        image: null,
        member: [],
        comments: [],
        checklist: [],
        files: []
    }

    const newColumn = {...column};
    newColumn.cards = [...newColumn.cards, newCard];
    newColumn.cardOrder = newColumn.cards.map(card => card._id);

    const columnsR = await UpdateColumn(newColumn, columns, board);
    return {newColumn, columnsR}
})

export const UpdateCard = (async (newCard, cards, columns, board) => {

    const cardIdUpdate = newCard._id;

    let ncard = [...cards];
    const index = ncard.findIndex(column => column._id === cardIdUpdate); //find list when id same
    if(newCard._destroy) {
        //remove column
        ncard.splice(index, 1);
    } else {
        //update card
        ncard[index] = newCard;
    }

    // console.log(ncard);

    let ncols = [...columns];
    const i = ncols.findIndex(column => column._id === cards[0].columnId); //find list when id same

    ncols[i].cards = ncard

    const columnsR = await UpdateColumn(ncols, columns, board);

    return {ncard, columnsR}

}) 

// Content Card
export const AddNewMemberCard = ( async (params, member) => {
    const data = await fetchAllData(params);
    if(data.card){
        const newMember = {
            _id: new ObjectId().toString(),
            memberId: member._id,
            name: member.name,
            type: member.type
        }
    
        const newCard = data.card;
        newCard.member.push(newMember);

        const cardsR = await UpdateCard(newCard, data.cards, data.columns, data.board);
        return {newCard, cardsR};
    }
})

export const RemoveMemberCard = ( async (params, member) => {
    const data = await fetchAllData(params);
    if(data.card){
        const newMember = {
            ...member,
            _destory: true
        }
        const memberIdUpdate = newMember._id;
    
        let nMember = [...data.card.member];
        
        const index = nMember.findIndex(member => member._id === memberIdUpdate);
        if(newMember._destory) {
            //remove column
            nMember.splice(index, 1);
        }
    
        const newCard = data.card;
        newCard.member = nMember;

        const cardsR = await UpdateCard(newCard, data.cards, data.columns, data.board);
        return {newCard, cardsR};
    }
})

export const EditTitleCard = ( async (params, title) => {
    const data = await fetchAllData(params);
    if(data.card){
        const newCard = {
            ...data.card,
            title: title,
            _destroy: false,
        }
        
        const cardsR = await UpdateCard(newCard, data.cards, data.columns, data.board);

        return {newCard, cardsR};
    }
})

// Description
export const EditDescription = ( async (params, text) => {

    const data = await fetchAllData(params);
  
    if(Object.keys(text).length === 0){
        text = {ops: []};
    }
    
    if(Object.keys(text).length > 0 && text.ops[0].insert === "\n"){
        text = {ops: []};
    }

    if(data.card){
        const newCard = {
            ...data.card,
            description: text,
        }

        const cardsR = await UpdateCard(newCard, data.cards, data.columns, data.board);
        return {newCard, cardsR};
    }
    
})

// List
export const UpdateList = ( async (params, newList) => {

    const data = await fetchAllData(params);
    if(data.card){
        const listIdUpdate = newList._id;
    
        let nList = [...data.card.checklist];
        const index = nList.findIndex(list => list._id === listIdUpdate); //find list when id same
        if(newList._destroy) {
            //remove column
            nList.splice(index, 1);
        } else {
            //update card
            nList[index] = newList;
        }
    
        const newCard = data.card;
        newCard.checklist = nList;
        
        const cardsR = await UpdateCard(newCard, data.cards, data.columns, data.board);
        return {newCard, cardsR};
    }
})

export const CreateList =( async (params, list) => {

    const data = await fetchAllData(params);
    if(data.card){
        const idTemp = new ObjectId().toString();
        const newChecklist = {
            _id: idTemp,
            boardId: data.card.boardId,
            columnId: data.card.columnId,
            cardId: data.card._id,
            list: list,
            date: null,
            member: null,
            check: false
        }
    
        const newCard = {...data.card};
        newCard.checklist = [...newCard.checklist, newChecklist];
        newCard.cardOrder = newCard.checklist.map(card => card._id);

        const cardsR = await UpdateCard(newCard, data.cards, data.columns, data.board);
        return {newCard, cardsR};
    }
})

export const EditList = ((params, checklist, text) => {
    
    const newChecklist = {
        ...checklist,
        list: text,
    }

    const listR = UpdateList(params, newChecklist);
    return(listR);
})

export const DeleteList = ((params, checklist) => {
    
    const newList = {
        ...checklist,
        _destroy: true
    }

    const listR = UpdateList(params, newList);
    return(listR);
})

export const ValueChecklist = ((params, checklist, value) => {
    const newChecklist = {
        ...checklist,
        check: value,
    }

    const listR = UpdateList(params, newChecklist);
    return(listR);
})

export const AssignMemberList = ((params, member, checklist) => {
    const newMember = {
        _id: new ObjectId().toString(),
        memberId: member.memberId,
        name: member.name,
        type: member.type
    }

    const newChecklist = checklist;
    newChecklist.member = newMember;

    const listR = UpdateList(params, newChecklist);
    return(listR);
})

export const DeleteAssignMemberList = ((params, checklist) => {
    const newList = checklist;
    newList.member = null;

    const listR = UpdateList(params, newList);
    return(listR);
})

export const DueDateList = ((params, checklist, value) => {
    const dd = String(value.getDate()).padStart(2, '0');
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const yyyy = value.getFullYear();

    const date =  yyyy + '-' + mm + '-' + dd;
    const newChecklist = {
        ...checklist,
        date: date,
    }

    const listR = UpdateList(params, newChecklist);
    return(listR);
})

export const RemoveDueDateList = ((params, checklist) => {
    const newList = checklist;
    newList.date = null;

    const listR = UpdateList(params, newList);
    return(listR);
})

export const ShowCheckedlist = (async (params, value) => {
    
    const data = await fetchAllData(params);
    if(data.card){
        const newCard = {
            ...data.card,
            showChecked: value,
        }

        const cardsR = await UpdateCard(newCard, data.cards, data.columns, data.board);
        return {newCard, cardsR};
    }
})

// Comment
export const UpdateComment = (async (params, newComment) => {

    const data = await fetchAllData(params);
    if(data.card){
        const commentsIdUpdate = newComment._id;
    
        let nComment = [...data.card.comments];
        const index = nComment.findIndex(card => card._id === commentsIdUpdate); //find list when id same
        if(newComment._destroy) {
            //remove column
            nComment.splice(index, 1);
        } else {
            //update card
            nComment[index] = newComment;
        }
        
        let nCard = data.card;
        for(let a = 0; a < data.card.comments.length; a++){
            if(nComment[a] !== undefined) {
                nCard.comments[a] = nComment[a];
            } else {
                delete nCard.comments[a];
            }
        }
    
        // console.log(nCard);
        nCard.comments = nCard.comments.filter((e) => {return e !== undefined});
        
        const cardsR = await UpdateCard(nCard, data.cards, data.columns, data.board);
        return {nCard, cardsR};
    }
})

export const CreateComment = (async (params, text) => {

    const data = await fetchAllData(params);
    if(data.card){
        const dateNow = new Date();
        const idTemp = new ObjectId().toString();
        const newComment = {
            _id: idTemp,
            boardId: data.card.boardId,
            columnId: data.card.columnId,
            cardId: data.card._id,
            text: text,
            date: dateNow
        }

        const newCard = {...data.card};
        newCard.comments = [...newCard.comments, newComment];
        newCard.cardOrder = newCard.comments.map(card => card._id);
        
        const cardsR = await UpdateCard(newCard, data.cards, data.columns, data.board);
        return {newCard, cardsR};
    }
    
})

export const EditComment = ( (params, comment, value) => {
    const dateNow = new Date();
    const newComment = {
        ...comment,
        text: value,
        edit: true,
        date: dateNow,
    }

    const commentR = UpdateComment(params, newComment);
    return commentR;
})

export const DeleteComment = ((params, comment) => {
    const newComment = {
        ...comment,
        _destroy: true
    }

    const commentR = UpdateComment(params, newComment);
    return commentR;
})

// Attachment File
export const UpdateAttachmentFile = (async(params, newFile) => {
    const data = await fetchAllData(params);
    if(data.card){
        const fileIdUpdate = newFile._id;
    
        let nFile = [...data.card.files];
        const index = nFile.findIndex(file => file._id === fileIdUpdate);
        if(newFile._destroy) {
            //remove column
            nFile.splice(index, 1);
        } else {
            //update card
            nFile[index] = newFile;
        }
    
        
        let nCard = data.card;
        for(let a = 0; a < data.card.files.length; a++){
            if(nFile[a] !== undefined) {
                nCard.files[a] = nFile[a];
                
            } else {
                delete nCard.files[a];
            }
        }
    
        nCard.files = nCard.files.filter((e) => {return e !== undefined});

        const cardsR = await UpdateCard(nCard, data.cards, data.columns, data.board);
        return {nCard, cardsR};
    }
})

export const UploadAttchmentFile = (async (params, idTemp, isFile, compressedFile) => {
    const data = await fetchAllData(params);
    if(data.card){
        let newFiles = {};
        const formData = new FormData();
        if(compressedFile !== null){
            formData.append('file', compressedFile);
            formData.append('id', idTemp);

            const response = await postFile(formData);

            newFiles = {
                _id: idTemp,
                boardId: data.card.boardId,
                columnId: data.card.columnId,
                cardId: data.card._id,
                name: compressedFile.name,
                data: response.data.imageData.filename,
                size: compressedFile.size,
                type: isFile.type,
                date: new Date(),
            }

        } else {
            formData.append('file', isFile);
            formData.append('id', idTemp);

            const response = await postFile(formData);

            newFiles = {
                _id: idTemp,
                boardId: data.card.boardId,
                columnId: data.card.columnId,
                cardId: data.card._id,
                name: isFile.name,
                data: response.data.imageData.filename,
                size: isFile.size,
                type: isFile.type,
                date: new Date(),
            }
        }

        let newCard = {...data.card};
        newCard.files = [...newCard.files, newFiles];
        newCard.cardOrder = newCard.files.map(card => card._id);

        const cardsR = await UpdateCard(newCard, data.cards, data.columns, data.board);
        return {newCard, cardsR};
    }
})

export const EditAttchmentFile = (async (params, file, value) => {
    const newName = value+'.'+file.name.split('.').pop()
        
    const newFile = {
        ...file,
        name: newName,
    }

    const fileR = await UpdateAttachmentFile(params, newFile);
    return fileR;
    // onUpdateFile(newFile);
})

export const DeleteAttchmentFile = (async (params, file) => {
    const newFile = {
        ...file,
        _destroy: true
    }

    deleteFile(newFile);
    const fileR = UpdateAttachmentFile(params, newFile);
    return fileR;
})