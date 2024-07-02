import { getData } from "@/app/lib/api";
import { mapOrder } from "@/app/utilities/sorts";

export const getFirstLetters = ((str) => {
    // Split the string into an array of words
    const words = str.split(" ");
    
    // Initialize an empty string to store the first letters
    let firstLetters = "";
    
    // Iterate over each word
    for (let i = 0; i < 2; i++) {
        // Get the first letter of the current word and concatenate it
        if(words[i]){
            firstLetters += words[i].toUpperCase().charAt(0);
        }
    }
    
    return firstLetters;
})

export const adjustHeight = (textArea) => {
    textArea.current.style.height = "inherit";
    textArea.current.style.height = `${textArea.current.scrollHeight}px`;
}

export const fetchAllData = async (params, board) => {
    try {
        // const { boards } = await getData();

        // if (boards && params.board_id) {
        //     const board = boards.find(item => item._id.slice(6, 14) === params.board_id);

        //     if (board) {
        //         const { columns, column, cards, card } = await fetchColumnData(board, params.card_id);

        //         if (card) {

        //             return { board, columns, column, cards, card };
        //         }
        //     }
        // }

        if (board) {
            const { columns, column, cards, card } = await fetchColumnData(board, params.card_id);

            if (card) {

                return { board, columns, column, cards, card };
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export const fetchColumnData = async (board, cardId) => {
    const columns = mapOrder(board.columns, board.columnOrder, '_id');

    if (cardId) {
        const column = board.columns.find(column => column.cards.some(card => card._id.slice(6, 14) === cardId));
        if (column) {
            const cards = mapOrder(column.cards, column.cardOrder, 'id');
            const card = column.cards.find(card => card._id.slice(6, 14) === cardId);

            return { columns, column, cards, card };
        }
    }

    return {};
};