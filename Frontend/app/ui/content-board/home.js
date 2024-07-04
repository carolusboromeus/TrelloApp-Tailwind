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
    const {boards, isSmallScreen, setBoards, board, setBoard, socket} = useVisibility();
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const {boards} = await getData();
                if(boards !== null){
                    if(boards.length > 0 && params.board_id){
                        setBoards(boards);
                        const boardInitData = boards.find(item => item._id.slice(6, 14) === params.board_id);
                        if(boardInitData){
                            setBoard(boardInitData);
                        }
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
        if(params && loading === false && board !== null){
            if(board._id.slice(6, 14) === params.board_id) {
                if(params.board_title !== undefined && board.title.toLowerCase().replace(/ /g, "-") !== params.board_title){
                    router.push("/");
                }else {
                    const room = localStorage.getItem('room');
                    if(room !== null && room !== board._id){
                        socket.emit("leave-board", room, message => {
                            console.log(message)
                        })

                        socket.emit("join-board", board._id, message => {
                            console.log(message);
                            localStorage.setItem('room', board._id);
                        });
                    }
                    
                    if(room === null){
                        socket.emit("join-board", board._id, message => {
                            console.log(message);
                            localStorage.setItem('room', board._id);
                        });
                    }

                    socket.on('getUpdateBoard', data => {
                        if (data._id === board._id) {
                            setBoard(data);
                            setColumns(mapOrder(data.columns, data.columnOrder, '_id'));
                        }
                    })

                    setBoard(board);
                    setColumns(mapOrder(board.columns, board.columnOrder, '_id'));

                    return () => {
                        socket.off('getUpdateBoard'); // Clean up on unmount
                    };
                }

            }
        }
    },[board, loading, params.board_id])
    
    useEffect(() => {
        if (typeof document !== 'undefined' && board && !loading) {

            const background = document.getElementsByClassName("trello-master");
            // background[0].style.backgroundColor = `rgb(${(board.background.r)}, ${board.background.g}, ${board.background.b})`;
            background[0].style.background = `linear-gradient(to bottom right, rgb(${board.background.r-10}, ${board.background.g-20}, ${board.background.b-30}), rgb(${board.background.r+10}, ${board.background.g+20}, ${board.background.b+30}))`;
            const color = `rgb(${(board.background.r-30)}, ${board.background.g-30}, ${board.background.b-30})`;
            document.getElementsByClassName("navbar-app")[0].style.backgroundColor = color;
            document.getElementsByClassName("navbar-board")[0].style.backgroundColor = color;
            if(!isSmallScreen){
                document.getElementsByClassName("sidebar")[0].style.backgroundColor = color;
                document.getElementById("sidebar-title").style.backgroundColor = color;
                document.getElementById("boards-rows").style.backgroundColor = null;
            } else if(isSmallScreen){
                document.getElementById("sidebar-title").style.backgroundColor = color;
                document.getElementById("boards-rows").style.backgroundColor = color;
                document.getElementsByClassName("sidebar")[0].style.backgroundColor = null;
            }
        }
    }, [board, loading, isSmallScreen]);

    if(loading){
        return <Loading/>
    } else {
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