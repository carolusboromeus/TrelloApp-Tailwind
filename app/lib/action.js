'use client'

import { fetchAllData } from "../utilities/function";
import { UpdateCard } from "../ui/buttons";
import { postFile } from "./api";

export const UploadAttchmentFile = (async (params, idTemp, isFile, compressedFile) => {
    const data = await fetchAllData(params);
    if(data.card){
        let newFiles = {};
        let dataImage = null;
        const formData = new FormData();
        if(compressedFile !== null){
            formData.append('file', compressedFile);
            formData.append('id', idTemp);

            const response = await postFile(formData);
            const date = new Date();
            dataImage = response.data.imageData.filename;

            newFiles = {
                _id: idTemp,
                boardId: data.card.boardId,
                columnId: data.card.columnId,
                cardId: data.card._id,
                name: compressedFile.name,
                data: response.data.imageData.filename,
                size: compressedFile.size,
                type: isFile.type,
                date: date,
            }

        } else {
            formData.append('file', isFile);
            formData.append('id', idTemp);

            const response = await postFile(formData);
            dataImage = response.data.imageData.filename;

            const date = new Date();

            newFiles = {
                _id: idTemp,
                boardId: data.card.boardId,
                columnId: data.card.columnId,
                cardId: data.card._id,
                name: isFile.name,
                data: response.data.imageData.filename,
                size: isFile.size,
                type: isFile.type,
                date: date,
            }
        }

        let newCard = {...data.card};
        newCard.files = [...newCard.files, newFiles];
        newCard.cardOrder = newCard.files.map(card => card._id);

        const cardsR = await UpdateCard(newCard, data.cards, data.columns, data.board);
        return {newCard, cardsR, dataImage};
    }
})