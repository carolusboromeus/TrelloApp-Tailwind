'use client'

import { urlFile } from '@/app/lib/api';
import { useVisibility } from '@/app/home';

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
        <div className='sm:flex my-3 ml-8 items-center'>
            {showImage === true &&
                <img className='-ml-2 h-auto sm:h-20 w-full sm:w-1/5 rounded-md text-center bg-slate-100 px-2 py-2' src={`${urlFile}${file.data}`} alt={file.name} title={file.name}></img>
            }
            {showImage === false &&
                <div className='-ml-2 h-auto sm:h-20 w-full sm:w-1/5 rounded-md bg-slate-100 px-2 py-2 flex items-center justify-center' title={file.name}><p className='cursor-default'>{file.name.split('.').pop()}</p></div>
            }
            <div className='w-full mt-2 sm:mt-0 sm:w-4/5 sm:ml-3'>
                {showEditFileName === false && 
                    <div className='position-text'>
                        <div className='font-base font-bold'>{file.name}</div>
                        <div className='my-1'>Added {dateFormat(file.date, "d mmm yyyy")} at {new Date(file.date).getHours()}:{new Date(file.date).getMinutes()}</div>
                        <div className='flex'>
                            <button className='underline' 
                                onClick={() => {
                                setIsShowButtonComment(true);
                                fileComment(file);}}>Comment</button><span className='mx-1'>•</span> 
                            <button className='underline' onClick={() => window.location.replace(urlFile+file.data)}>Download</button><span className='mx-1'>•</span>  
                            <button className='underline' onClick={async () => {
                                const value = await DeleteAttchmentFile(params, file);
                                setBoards(value.cardsR.columnsR.boardsR);
                                setBoard(value.cardsR.columnsR.newBoard);
                                setCard(value.nCard);
                            }}>Delete</button><span className='mx-1'>•</span>
                            <button className='underline' onClick={() => setShowEditFileName(true)}>Edit</button>
                        </div>
                    </div>
                }
                {showEditFileName === true &&
                    <div className='edit-file'>
                        <input 
                            className='py-1.5 pr-8 pl-3 rounded-md focus:outline focus:outline-blue-500'
                            ref={FileNameRef}
                            value={valueFileName}
                            spellCheck="false"
                            onChange={(event) => {
                                setValueFileName(event.target.value);
                            }}
                            onKeyDown={(event) => {if(event.key === "Enter"){
                                if(!event.target.value) {setShowEditFileName(false)} 
    
                                setValueFileName(event.target.value);
                                handleEditFile();
                            }}}
                        />
                        <div className='flex mt-2'>
                            <button className='px-2 py-1 rounded-md font-bold text-xs text-white bg-blue-500 hover:text-black hover:bg-hover-button' onClick={() => {handleEditFile()}}>Update</button>
                            <button className='ml-2 px-2 py-1 rounded-md font-bold text-xs text-white bg-red-500 hover:text-black hover:bg-hover-button' onClick={() => {
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