'use client'

import BoardBar from "@/app/ui/content-board/BoardBar/BoardBar";
import BoardContent from "@/app/ui/content-board/BoardContent/BoardContent";
import { mapOrder } from "@/app/utilities/sorts";
import { useVisibility } from '@/app/home';
import { urlNode, getData } from "@/app/lib/api";
import Loading from "@/app/ui/Common/Loading/Loading";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';

const Home = ({params}) => {
    const {boards, isSmallScreen, setBoards, socket } = useVisibility();
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const {boards} = await getData();
                if(boards !== undefined){
                    if(boards.length > 0 && params.board_id){
                        setBoards(boards);
                    }
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
        if(boards !== undefined && boards.length > 0 && params){
            const boardInitData = boards.find(item => item._id.slice(6, 14) === params.board_id);
            if(boardInitData) {
                if(params.board_title !== undefined && boardInitData.title.toLowerCase().replace(/ /g, "-") !== params.board_title){
                    router.push("/");
                }else {
                    socket.emit("join-board", boardInitData._id, message => {
                        console.log(message);
                    });

                    
                    if(params.board_id == boardInitData._id){
                        socket.on('getUpdateBoard', data => {
                            setBoard(data);
                        })
                    }

                    setBoard(boardInitData);
                    setColumns(mapOrder(boardInitData.columns, boardInitData.columnOrder, '_id'));

                    return () => {
                        socket.disconnect(); // Clean up on unmount
                    };
                }

            }
        }
    },[boards, params.board_id])

    useEffect(() => {
        socket.on('getUpdateBoard', data => {
            setBoard(data);
        })

        return () => {
            socket.disconnect(); // Clean up on unmount
        };
    }, [])
    
    useEffect(() => {
        if (typeof document !== 'undefined' && board && !loading) {
            // Your code that uses document here
            const background = document.getElementsByClassName("trello-master");
            background[0].style.backgroundColor = board.background.hex;

            const color = `rgb(${(board.background.rgb.r-20)}, ${board.background.rgb.g-20}, ${board.background.rgb.b-20})`;
            document.getElementsByClassName("navbar-app")[0].style.backgroundColor = color;
            document.getElementsByClassName("navbar-board")[0].style.backgroundColor = color;
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

    return (
        <>
            <BoardBar params={params} board={board} setBoard={setBoard}/>
            <BoardContent params={params} board={board} columns={columns} setBoard={setBoard} setColumns={setColumns}/>
        </>
    )
}
  
export default Home;
  
Home.propTypes = {
    params: PropTypes.object.isRequired,
};