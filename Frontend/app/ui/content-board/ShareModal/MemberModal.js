'use client'

import { getMember } from '@/app/lib/api';
import { useVisibility } from '@/app/home';
import { AddNewMember } from '@/app/ui/buttons';
import MemberBoard from '@/app/ui/content-board/MemberBoard/MemberBoard';
import { MODAL_ACTION_CLOSE } from '@/app/utilities/constant';

import { useState, useEffect, useRef} from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Dialog, DialogPanel, Transition, TransitionChild} from '@headlessui/react'
import clsx from 'clsx'
import PropTypes from 'prop-types';

const MemberModal = (props) => {
    const {board, show, onAction, setBoard} = props;
    const { setBoards } = useVisibility();
    const [member, setMember] = useState([]);

    const inputMemberRef = useRef(null);
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        if(show){
            async function getDataMember (){
                const data = await getMember();
                setMember(data);
            }

            getDataMember();

            
        }
    }, [show])

    if(show === true && inputMemberRef !== null && inputMemberRef.current !== null) {
        inputMemberRef.current.focus();
    } 

    const filteredMember = query === '' ? member.slice(0,5) : member.filter((person) => {
        return person.t.toLowerCase().includes(query.toLowerCase())
    }).slice(0,5)
    
    const handleAddMemberBoard = ( async () => {
        console.log(selected);
        if(selected){
            const value = await AddNewMember(selected, board);
            setBoards(value.boardsR);
            setBoard(value.newBoard);

            if(inputMemberRef.current){
                inputMemberRef.current.value = '';
            }

        }
    })

    return (
        <Transition appear show={show}>
            <Dialog as="div" className="relative z-10 focus:outline-none" onClose={() => {onAction(MODAL_ACTION_CLOSE)}}>
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/25">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 transform-[scale(95%)]"
                            enterTo="opacity-100 transform-[scale(100%)]"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 transform-[scale(100%)]"
                            leaveTo="opacity-0 transform-[scale(95%)]"
                        >
                        <DialogPanel className="w-full max-w-2xl rounded-xl p-6 bg-list-bg-color backdrop-blur-2xl">
                            <div className="text-sm/6 text-black">
                                <div className="mx-auto">
                                    <Combobox value={selected} onChange={(value) => setSelected(value)}>
                                        <div className='flex'>
                                            <div className="relative w-full">
                                                <ComboboxInput
                                                    className={clsx(
                                                    'w-full rounded-lg border border-black/20 bg-black/5 py-1.5 pr-8 pl-3 text-sm/6 text-black',
                                                    'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                                                    )}
                                                    name='Member'
                                                    placeholder='Name'
                                                    ref={inputMemberRef}
                                                    displayValue={(person) => person?.t}
                                                    onChange={(event) => {setQuery(event.target.value);}}
                                                />
                                                <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                                                    <div className="bi bi-caret-down-fill" />
                                                </ComboboxButton>
                                            </div>
                                            <button className="ml-2 bg-blue-500 px-2 text-white rounded-md hover:bg-gray-500" onClick={() => handleAddMemberBoard()}>Share</button>
                                        </div>
                                        <Transition
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                            afterLeave={() => setQuery('')}
                                        >
                                            <ComboboxOptions
                                                className="absolute mt-1 w-[var(--input-width)] rounded-xl border border-black/20 bg-list-bg-color p-1 [--anchor-gap:var(--spacing-1)] empty:hidden"
                                            >
                                                {filteredMember.map((person) => (
                                                    <ComboboxOption
                                                        key={person.i}
                                                        value={person}
                                                        className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-black/10"
                                                    >
                                                        <div className='invisible bi bi-check-circle-fill text-black group-data-[selected]:visible'></div>
                                                        <div className="text-sm/6 text-black">{person.t}</div>
                                                    </ComboboxOption>
                                                ))}
                                            </ComboboxOptions>
                                        </Transition>
                                    </Combobox>
                                </div>
                            </div>
                            {board.member && board.member.length > 0 && board.member.map((member, index) => {
                                return (
                                    <MemberBoard
                                        key={member._id}
                                        member={member}
                                        board={board}
                                        setBoard={setBoard}
                                    />
                                )
                            })}
                        </DialogPanel>
                    </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

MemberModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onAction: PropTypes.func.isRequired,
    board: PropTypes.object.isRequired,
    setBoard: PropTypes.func.isRequired,
};

export default MemberModal;