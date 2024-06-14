'use client'

import BoardBar from "@/app/ui/content-board/BoardBar/BoardBar";
import BoardContent from "@/app/ui/content-board/BoardContent/BoardContent";
import { mapOrder } from "@/app/utilities/sorts";
import { useVisibility } from '@/app/home';
import { getData } from "@/app/lib/api";
import Loading from "@/app/ui/Common/Loading/Loading";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';

const Home = ({params}) => {
    const {boards, isSmallScreen, setBoards } = useVisibility();
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const {boards} = await getData();
                if(boards.length > 0 && params.board_id){
                    setBoards(boards);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [params.board_id]);

    useEffect(() => {
        if(boards.length > 0 && params){
            const boardInitData = boards.find(item => item._id.slice(6, 14) === params.board_id);
            if(boardInitData) {
                if(params.board_title !== undefined && boardInitData.title.toLowerCase().replace(/ /g, "-") !== params.board_title){
                    router.push("/");
                }else {
                    setBoard(boardInitData);
                    setColumns(mapOrder(boardInitData.columns, boardInitData.columnOrder, '_id'));
                }

            }
        }
    },[boards, params.board_id])
    
    useEffect(() => {
        if (typeof document !== 'undefined' && board && !loading) {
            // Your code that uses document here
            const background = document.getElementsByClassName("trello-master");
            background[0].style.backgroundColor = board.background.hex;

            const color = `rgb(${(board.background.rgb.r-20)}, ${board.background.rgb.g-20}, ${board.background.rgb.b-20})`;
            document.getElementsByClassName("navbar-board")[0].style.backgroundColor = color;
            document.getElementsByClassName("navbar-app")[0].style.backgroundColor = color;
            if(!isSmallScreen){
                document.getElementsByClassName("sidebar")[0].style.backgroundColor = color;
            } else if(isSmallScreen){
                document.getElementById("sidebar-title").style.backgroundColor = color;
                document.getElementById("boards-rows").style.backgroundColor = color;
                document.getElementsByClassName("sidebar")[0].style.backgroundColor = null;
            }
        }
    }, [board, loading, isSmallScreen])

    if(loading){
        return <Loading/>
    }

    if(board){
        return (
            <>
                <BoardBar params={params} board={board} setBoard={setBoard}/>
                <BoardContent params={params} board={board} columns={columns} setBoard={setBoard} setColumns={setColumns}/>
            </>
        )
    }
    
}
  
export default Home;
  
Home.propTypes = {
    params: PropTypes.object.isRequired,
};