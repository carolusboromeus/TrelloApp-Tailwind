'use client'

// import 'quill/dist/quill.snow.css';
import { CustomToolbar } from '@/app/lib/toolbar';
import { DeleteComment, EditComment } from '@/app/ui/buttons';
import { useVisibility } from '@/app/home';
import QuillEditor from '@/app/lib/quillEditor';

import './Comment.scss';
import { useState, useRef, useEffect } from 'react';
import ReactTimeAgo from 'react-time-ago';
import PropTypes from 'prop-types';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

const Comment = (props) => {
    const {comment, handleChangeSubmitUploadFile, setDataFromChild, params, setBoard, setCard} = props;
    const { setBoards } = useVisibility();

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
        setBoards(value.cardsR.columnsR.boardsR);
        setBoard(value.cardsR.columnsR.newBoard);
        setCard(value.nCard);
        setIsShowEditComment(false);
    }

    const [lastChange, setLastChange] = useState();

    return (
        <div id='comment-list'>
            <div className='group-btn'>
                <i className='bi-chat-left icon'></i>
                <h6>Comment</h6>
                <ReactTimeAgo id="comment-date" date={new Date(comment.date)} locale="en-US"/>
                {comment.edit === true && <div id='text-edit'>(edited)</div>}
            </div>
            {isShowEditComment === false &&
            <div>
                <div id='display-comment'> 
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
                <div className='action'>
                    <button className='button' onClick={() => setIsShowEditComment(true)}>Edit</button>
                    <span>•</span>
                    <button className='button' 
                        onClick={async () => {
                            const value = await DeleteComment(params, comment);
                            setBoards(value.cardsR.columnsR.boardsR);
                            setBoard(value.cardsR.columnsR.newBoard);
                            setCard(value.nCard);
                        }}>Delete</button>
                </div>
            </div>
            }
            {isShowEditComment === true &&
            <div id='edit-comment'>
                <div id='display-edit-comment'>
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
                    <div></div>
                    <div className='group-btn'>
                        <button id='btn-edit' className='btn badge btn-primary' onClick={() => handleEditComment()}>Save</button>
                        <button className='btn badge btn-danger' onClick={() => {
                            setIsShowEditComment(false)
                        }}>Cancel</button>
                    </div>
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