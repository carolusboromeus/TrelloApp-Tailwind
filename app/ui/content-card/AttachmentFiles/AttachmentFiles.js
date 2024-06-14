'use client'

import { urlFile } from '@/app/lib/api';
import { useVisibility } from '@/app/home';

import './AttachmentFiles.scss';
import { useEffect, useRef, useState } from 'react';
import dateFormat from "dateformat";
import PropTypes from 'prop-types';
import { DeleteAttchmentFile, EditAttchmentFile } from '../../buttons';

const AttachmentFiles = (props) => {
    const {file, fileComment, setIsShowButtonComment, params, setBoard, setCard} = props;
    const { setBoards } = useVisibility();

    const [showEditFileName, setShowEditFileName] = useState(false); //show input
    const [valueFileName, setValueFileName] = useState(''); //to set value in variable valueTextArea
    const FileNameRef = useRef(null); //to get value in the form of object

    const handleEditFile = async () => {
        //validate
        if(!valueFileName){
            setShowEditFileName(false);
            return;
        }

        const value = await EditAttchmentFile(params, file, valueFileName);
        setBoards(value.cardsR.columnsR.boardsR);
        setBoard(value.cardsR.columnsR.newBoard);
        setCard(value.nCard);
        setShowEditFileName(false);
    }

    const [showImage, setShowImage] = useState(false);

    useEffect(() => {
        if(file) { 
            if(showEditFileName === true && FileNameRef.current !== null) {
                FileNameRef.current.value = file.name.split('.')[0];
            }

            if(file.type.slice(0,5) === "image") {
                setShowImage(true);
            }
        }
    }, [file, showEditFileName])

    return (
        <div className='group'>
            <div className='cover-file' title={file.name}>
                {showImage === true &&
                    <img className='image-cover' src={`${urlFile}${file.data}`} alt={file.name}></img>
                }
                {showImage === false &&
                    <div className='title-cover'>{file.name.split('.').pop()}</div>
                }
            </div>
            <div className='detail-file'>
                {showEditFileName === false && 
                    <div className='position-text'>
                        <div className='file-name'>{file.name}</div>
                        <div>Added {dateFormat(file.date, "d mmm yyyy")} at {new Date(file.date).getHours()}:{new Date(file.date).getMinutes()}</div>
                        <div className='file-button'>
                            <button onClick={() => {
                                setIsShowButtonComment(true);
                                fileComment(file);}}>Comment</button><span>•</span> 
                            <button onClick={() => window.location.replace(urlFile+file.data)}>Download</button><span>•</span>  
                            <button onClick={async () => {
                                const value = await DeleteAttchmentFile(params, file);
                                setBoards(value.cardsR.columnsR.boardsR);
                                setBoard(value.cardsR.columnsR.newBoard);
                                setCard(value.nCard);
                            }}>Delete</button><span>•</span>
                            <button onClick={() => setShowEditFileName(true)}>Edit</button>
                        </div>
                    </div>
                }
                {showEditFileName === true &&
                    <div className='edit-file'>
                        <input 
                            className='form-control'
                            ref={FileNameRef}
                            value={valueFileName}
                            onChange={(event) => {
                                setValueFileName(event.target.value);
                            }}
                            onKeyDown={(event) => {if(event.key === "Enter"){
                                if(!event.target.value) {setShowEditFileName(false)} 
    
                                setValueFileName(event.target.value);
                                handleEditFile();
                            }}}
                        />
                        <div className='group-btn'>
                            <button className='btn badge btn-primary' onClick={() => {handleEditFile()}}>Update</button>
                            <button className='btn badge btn-danger' onClick={() => {
                                setValueFileName("");
                                setShowEditFileName(false);
                            }}>Cancel</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

AttachmentFiles.propTypes = {
    file: PropTypes.object,
    fileComment: PropTypes.func.isRequired,
    setIsShowButtonComment: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
    setCard: PropTypes.func.isRequired
};

export default AttachmentFiles;