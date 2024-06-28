'use client'

import { CustomToolbar } from '@/app/lib/toolbar';
import { DeleteComment, EditComment } from '@/app/ui/buttons';
import { useVisibility } from '@/app/home';
import QuillEditor from '@/app/lib/quillEditor';

// import './Comment.scss';
import { useState, useRef, useEffect } from 'react';
import ReactTimeAgo from 'react-time-ago';
import PropTypes from 'prop-types';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

const Comment = (props) => {
    const {comment, handleChangeSubmitUploadFile, setDataFromChild, params, setBoard, setCard} = props;
    const { setBoards, socket } = useVisibility();

    const [isShowEditComment, setIsShowEditComment] = useState(false);
    const CommentRef = useRef(null); //to get value in the form of object

    useEffect(() => {
        if (CommentRef.current && isShowEditComment === true) {

            const insertFileButton = document.querySelector('.insertFile');
            setDataFromChild(CommentRef);
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
    }, [CommentRef, setDataFromChild, isShowEditComment, handleChangeSubmitUploadFile]);

    useEffect(() => {
        if(comment != null ) { 
            if(comment !== '' && CommentRef.current !== null && isShowEditComment === true) {
                CommentRef.current.focus();

                CommentRef.current.setContents(comment.text);
                const cursorPosition = CommentRef.current.getLength();
                CommentRef.current.setSelection(0 + cursorPosition);
            }

        };
    }, [comment, CommentRef, isShowEditComment])
    
    const handleEditComment = async () => {

        //validate
        if(!lastChange){
            setIsShowEditComment(false);
            return;
        }

        const text = {
            ops:lastChange.ops
        };
    
        // console.log(value)
        const value = await EditComment(params, comment, text);
        // setBoards(value.cardsR.columnsR.boardsR);
        setBoard(value.cardsR.columnsR.newBoard);
        setCard(value.nCard);
        socket.emit('updateCard', value.nCard);
        socket.emit('updateAllBoard', value.cardsR.columnsR.newBoard);
        setIsShowEditComment(false);
    }

    const [lastChange, setLastChange] = useState();

    return (
        <div className='mt-3'>
            <div className='flex items-center'>
                <i className='bi-chat-left icon text-base'></i>
                <h6 className='ml-3 text-base font-medium'>Comment</h6>
                <ReactTimeAgo className='ml-2 text-xs' date={new Date(comment.date)} locale="en-US"/>
                {comment.edit === true && <div className='ml-1 text-xs'>(edited)</div>}
            </div>
            {isShowEditComment === false &&
            <div className='mt-2 ml-8'>
                <div className='bg-white rounded-2xl'> 
                    <QuillEditor
                        
                        placeholder= ""
                        ref={CommentRef}
                        modules={{
                            toolbar: false,
                        }}
                        defaultValue={comment.text}
                        readOnly={true}
                    >
                    </QuillEditor>
                    {/* <div className='comment-text form-control' dangerouslySetInnerHTML={{__html: comment.text}}></div> */}
                    <div></div>
                </div>
                <div className='text-xs mt-2 font-light'>
                    <button className='underline hover:font-medium' onClick={() => setIsShowEditComment(true)}>Edit</button>
                    <span className='mx-1'>•</span>
                    <button className='underline hover:font-medium' 
                        onClick={async () => {
                            const value = await DeleteComment(params, comment);
                            // setBoards(value.cardsR.columnsR.boardsR);
                            // setBoard(value.cardsR.columnsR.newBoard);
                            setCard(value.nCard);
                            socket.emit('updateCard', value.nCard);
                            socket.emit('updateAllBoard', value.cardsR.columnsR.newBoard);
                        }}>Delete</button>
                </div>
            </div>
            }
            {isShowEditComment === true &&
            <div className='ml-8 mt-2'>
                <div className='bg-white rounded-2xl'>
                    <CustomToolbar
                        toolbarId = {comment._id.toString().replace(/^[^a-zA-Z]+/g, '_')}
                    />
                    <QuillEditor
                        
                        placeholder= ""
                        ref={CommentRef}
                        modules={{
                            toolbar: {
                                container: `#${comment._id.toString().replace(/^[^a-zA-Z]+/g, '_')}`,
                            }
                        }}
                        defaultValue={comment.text}
                        readOnly={false}
                        onTextChange={setLastChange}
                    />
                </div>
                <div className='flaxe mt-3'>
                    <button className='px-2 py-1 rounded-md font-bold text-white bg-blue-500 hover:text-black hover:bg-hover-button btn-primary' onClick={() => handleEditComment()}>Save</button>
                    <button className='ml-2 px-2 py-1 rounded-md font-bold text-white bg-red-500 hover:text-black hover:bg-hover-button btn-danger' onClick={() => {
                        setIsShowEditComment(false)
                    }}>Cancel</button>
                </div>
            </div>
            }
        </div>
    )
}

Comment.propTypes = {
    comment: PropTypes.object,
    handleChangeSubmitUploadFile: PropTypes.func.isRequired,
    setDataFromChild: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
    setCard: PropTypes.func.isRequired,
};

export default Comment;